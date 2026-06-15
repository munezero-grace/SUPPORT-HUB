import { PrismaClient, StatusEnum, PriorityEnum } from "@prisma/client";
import { ClientService } from "./client.service";
import { ERROR_MESSAGES } from "../constants/response/errors";
import { sendSlackNotification } from "../utils/slackNotifier";
import { getUserRole } from "../helpers/getUserRole";
import { UserRole } from "../types";
import { CreateTicketData } from "../types/ticket";
import { buildTicketData } from "../utils/ticketData";
import {
  ticketIncludes,
  ticketListIncludes,
} from "../utils/ticketPrismaIncludes";
import { uploadTicketFiles } from "../helpers/ticketFileHelper";
import { buildSlackNewTicketMessage } from "../helpers/slackHelper";
import SettingsService from "./settings.service";
import {
  throwIfTicketNotFound,
  throwIfNotAuthorized,
} from "../helpers/ErrorHandling";
import { scoreTicket } from "./priority.service";

const prisma = new PrismaClient();
const clientService = new ClientService();

function calculateDueDate(priority: string, createdAt: Date): Date {
  const due = new Date(createdAt)
  switch (priority.toLowerCase()) {
    case 'critical':
      due.setHours(due.getHours() + 4)
      break
    case 'high':
      due.setDate(due.getDate() + 1)
      break
    case 'medium':
      due.setDate(due.getDate() + 3)
      break
    case 'low':
    default:
      due.setDate(due.getDate() + 7)
      break
  }
  return due
}

function parseTags(tags: string | string[] | undefined): string[] | undefined {
  if (!tags) return undefined;
  if (Array.isArray(tags)) return tags.map((tag) => tag.trim()).filter(Boolean);
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export class TicketsService {
  private static async getNextTicketCode(): Promise<string> {
    const lastTicket = await prisma.tickets.findFirst({
      orderBy: { ticketCode: "desc" },
    });
    if (!lastTicket) return "T-1001";
    const lastCodeNumber = parseInt(lastTicket.ticketCode.split("-")[1]);
    return `T-${lastCodeNumber + 1}`;
  }

  /**
   * Scores a ticket in the background (off the request path) and writes the
   * result back to the DB once it resolves. Failures are logged only — the
   * hourly priorityRefresh cron job will pick up any ticket that's still
   * unscored.
   */
  private static async getClientUserIdForTicket(ticketId: string): Promise<string | null> {
    const ticket = await prisma.tickets.findUnique({
      where: { id: ticketId },
      include: { client: { select: { userId: true } } },
    });
    return ticket?.client?.userId ?? null;
  }

  private static async createStatusChangeNotifications(
    ticketId: string,
    ticketCode: string,
    ticketTitle: string,
    newStatus: string
  ): Promise<void> {
    const CLIENT_MESSAGES: Record<string, string> = {
      in_progress:      `Your ticket [${ticketCode}] is now being reviewed by our support team.`,
      awaiting_client:  `Your ticket [${ticketCode}] requires more information from you. Please check the ticket for details.`,
      resolved:         `Your ticket [${ticketCode}] has been resolved. Please review and confirm the resolution.`,
    };

    const clientUserId = await TicketsService.getClientUserIdForTicket(ticketId);
    const clientMsg = CLIENT_MESSAGES[newStatus];
    if (clientUserId && clientMsg) {
      await prisma.notification.create({
        data: {
          userId: clientUserId,
          type: "status_change",
          title: "Ticket Status Updated",
          body: clientMsg,
          ticketCode,
        },
      });
    }

    const admins = await prisma.userRoles.findMany({
      where: { role: { name: { in: ["super_admin", "ticket_manager"] } } },
      select: { userId: true },
    });
    if (admins.length === 0) return;
    const label = newStatus.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    await prisma.notification.createMany({
      data: admins.map(({ userId }) => ({
        userId,
        type: "status_change",
        title: "Ticket Status Changed",
        body: `[${ticketCode}] "${ticketTitle}" → ${label}`,
        ticketCode,
      })),
      skipDuplicates: true,
    });
  }

  private static async createCommentNotification(
    ticketId: string,
    ticketCode: string,
    commenterRole: string
  ): Promise<void> {
    const isClient = commenterRole === UserRole.CLIENT;

    if (!isClient) {
      const clientUserId = await TicketsService.getClientUserIdForTicket(ticketId);
      if (clientUserId) {
        await prisma.notification.create({
          data: {
            userId: clientUserId,
            type: "new_ticket",
            title: "New Reply on Your Ticket",
            body: `A new message was added to your ticket [${ticketCode}].`,
            ticketCode,
          },
        });
      }
    } else {
      const [assignedDevs, admins] = await Promise.all([
        prisma.userTickets.findMany({ where: { ticketId }, select: { userId: true } }),
        prisma.userRoles.findMany({
          where: { role: { name: { in: ["super_admin", "ticket_manager"] } } },
          select: { userId: true },
        }),
      ]);
      const allIds = [...new Set([
        ...assignedDevs.map((d) => d.userId),
        ...admins.map((a) => a.userId),
      ])];
      if (allIds.length > 0) {
        await prisma.notification.createMany({
          data: allIds.map((userId) => ({
            userId,
            type: "new_ticket",
            title: "Client Replied",
            body: `Client replied on ticket [${ticketCode}].`,
            ticketCode,
          })),
          skipDuplicates: true,
        });
      }
    }
  }

  private static async createAdminNotifications(
    ticketCode: string,
    title: string,
    clientName: string,
    priority: string
  ): Promise<void> {
    const admins = await prisma.userRoles.findMany({
      where: { role: { name: { in: ["super_admin", "ticket_manager"] } } },
      select: { userId: true },
    });
    if (admins.length === 0) return;
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    await prisma.notification.createMany({
      data: admins.map(({ userId }) => ({
        userId,
        type: "new_ticket",
        title: `New ticket from ${clientName}`,
        body: `[${ticketCode}]: ${title} — Priority: ${cap(priority)}`,
        ticketCode,
      })),
      skipDuplicates: true,
    });
  }

  private static queueBackgroundScoring(
    ticket: {
      id: string;
      ticketCode: string;
      title: string;
      description: string | null;
      createdAt: Date;
    },
    options?: { setAutoDueDate?: boolean; manualDueDate?: unknown }
  ) {
    console.log(`[scoring] ticket ${ticket.ticketCode} queued for background scoring`);

    setImmediate(async () => {
      try {
        const score = await scoreTicket({
          title: ticket.title,
          description: ticket.description,
          createdAt: ticket.createdAt,
        });

        const data: Record<string, unknown> = {
          priority:        score.priority as "critical" | "high" | "medium" | "low",
          priorityScore:   score.priorityScore,
          emotionScore:    score.emotion,
          complexityScore: score.complexity,
          agingScore:      score.agingScore,
          llmReasoning:    score.llmReasoning,
          confidence:      score.confidence,
          lastScoredAt:    new Date(),
        };

        if (options?.setAutoDueDate && !options.manualDueDate) {
          data.dueDate = calculateDueDate(score.priority, ticket.createdAt);
        }

        await prisma.tickets.update({ where: { id: ticket.id }, data });

        console.log(
          `[scoring] ticket ${ticket.ticketCode} scored — priority: ${score.priority.toUpperCase()}`
        );

        // Create in-app notifications for admins/ticket managers and send Slack — all post-scoring
        try {
          const full = await prisma.tickets.findUnique({
            where: { id: ticket.id },
            include: {
              client: { select: { companyName: true } },
              owner:  { select: { firstName: true, lastName: true } },
            },
          });
          const clientName = full?.client?.companyName || "Unknown";
          const userName   = full?.owner
            ? `${full.owner.firstName} ${full.owner.lastName}`
            : "Unknown";

          await TicketsService.createAdminNotifications(
            ticket.ticketCode,
            ticket.title,
            clientName,
            score.priority
          );

          // Slack — sent for ALL tickets after scoring so priority + score are accurate
          try {
            const adminSettings = await SettingsService.getAdminSlackSettings();
            if (adminSettings?.newTickets && adminSettings.slackWebhookUrl) {
              const slackMsg = buildSlackNewTicketMessage({
                ticketCode:    ticket.ticketCode,
                title:         ticket.title,
                priority:      score.priority,
                priorityScore: score.priorityScore,
                clientName,
                userName,
                createdAt:     ticket.createdAt,
              });
              await sendSlackNotification(slackMsg, adminSettings.userId);
            }
          } catch (slackErr) {
            console.error(`[scoring] Slack notification failed for ${ticket.ticketCode}:`, slackErr);
          }
        } catch (notifErr) {
          console.error(`[scoring] post-score notifications failed for ${ticket.ticketCode}:`, notifErr);
        }
      } catch (e) {
        console.error(
          `[scoring] ticket ${ticket.ticketCode} scoring failed — will retry on next cron run:`,
          e
        );
      }
    });
  }

  static async createTicket(
    userId: string,
    ticketData: CreateTicketData & { imageUrls?: string[] }
  ) {
    const {
      title,
      priority,
      imageUrls,
      clientId,
      productId,
      product,
      tags,
      dueDate,
      internalNotes,
      description,
    } = ticketData;

    if (!title || !title.trim()) {
      return { error: ERROR_MESSAGES.TICKET_TITLE_REQUIRED };
    }
    if (!description || !description.trim()) {
      return { error: ERROR_MESSAGES.TICKET_DESCRIPTION_REQUIRED };
    }

    const userClient = await clientService.findClientByUserId(userId);
    let finalClientId = clientId;
    if (!clientId && userClient && "id" in userClient)
      finalClientId = userClient.id;
    if (clientId) {
      const clientExists = await clientService.findClientByIdField(clientId);
      if (!clientExists)
        return {
          error: ERROR_MESSAGES.CLIENT_DOES_NOT_EXIST.replace("{id}", clientId),
        };
    } else if (!userClient) {
      return { error: ERROR_MESSAGES.NO_CLIENT_ASSOCIATED_WITH_USER };
    }
    const finalProductId = productId || product;
    if (finalProductId) {
      const productExists = await prisma.products.findUnique({
        where: { id: finalProductId },
      });
      if (!productExists)
        return { error: ERROR_MESSAGES.PRODUCT_DOES_NOT_EXIST };
      if (finalClientId) {
        const clientProduct = await prisma.clientProduct.findUnique({
          where: {
            clientId_productId: {
              clientId: finalClientId,
              productId: finalProductId,
            },
          },
        });
        if (!clientProduct)
          return { error: ERROR_MESSAGES.PRODUCT_NOT_ASSOCIATED_WITH_CLIENT };
      }
    }
    const ticketCode = await TicketsService.getNextTicketCode();
    const tagsArray = parseTags(tags);
    const data = buildTicketData({
      ticketCode,
      title,
      priority,
      imageUrls,
      description,
      internalNotes,
      tags: undefined,
      dueDate,
      userId,
      finalClientId,
      finalProductId,
    });
    const ticket = await prisma.tickets.create({
      data: { ...data, tags: tagsArray },
    });
    if (imageUrls && imageUrls.length > 0) {
      for (const url of imageUrls) {
        await prisma.ticketAttachment.create({
          data: { ticketId: ticket.id, fileUrl: url },
        });
      }
    }
    TicketsService.queueBackgroundScoring(ticket, {
      setAutoDueDate: true,
      manualDueDate: dueDate,
    });

    return prisma.tickets.findUnique({
      where: { id: ticket.id },
      include: ticketIncludes,
    });
  }

  static async checkUserExists(userId: string) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });
    return !!user;
  }

  static async getUserTickets(userId: string, isAdmin: boolean = false) {
    try {
      const accessFilter = isAdmin
        ? {}
        : { OR: [{ createdBy: userId }, { client: { userId: userId } }] };

      // Unscored tickets (no score yet, or score still at its default of 0)
      // are shown first so new urgent tickets aren't hidden until the
      // hourly priorityRefresh cron job runs.
      const unscoredFilter = { OR: [{ lastScoredAt: null }, { priorityScore: 0 }] };
      const scoredFilter = {
        AND: [{ lastScoredAt: { not: null } }, { priorityScore: { not: 0 } }],
      };

      const [unscored, scored] = await Promise.all([
        prisma.tickets.findMany({
          where: { AND: [accessFilter, unscoredFilter, { deletedAt: null }] },
          orderBy: [{ createdAt: "desc" }],
          include: ticketListIncludes,
        }),
        prisma.tickets.findMany({
          where: { AND: [accessFilter, scoredFilter, { deletedAt: null }] },
          orderBy: [{ priorityScore: "desc" }, { createdAt: "desc" }],
          include: ticketListIncludes,
        }),
      ]);

      return [...unscored, ...scored];
    } catch (error) {
      throw error;
    }
  }

  static async getUserTicketsWithOptions(queryOptions: any) {
    return await prisma.tickets.findMany({
      ...queryOptions,
      where: { ...(queryOptions.where ?? {}), deletedAt: null },
      include: ticketListIncludes,
    });
  }

  static async getTicketById(id: string) {
    return await prisma.tickets.findFirst({
      where: { id, deletedAt: null },
      include: ticketIncludes,
    });
  }

  static async getTicketByCode(ticketCode: string) {
    const ticket = await prisma.tickets.findFirst({
      where: { ticketCode, deletedAt: null },
      include: ticketIncludes,
    });
    if (!ticket) {
      const { ErrorHandling } = await import("../helpers/ErrorHandling");
      throw new ErrorHandling(ERROR_MESSAGES.TICKET_NOT_FOUND, 404);
    }
    return ticket;
  }

  static async updateTicket(id: string, updateData: any) {
    const updated = await prisma.tickets.update({
      where: { id },
      data: updateData,
    });

    TicketsService.queueBackgroundScoring(updated);

    return updated;
  }

  static async deleteTicket(id: string) {
    return await prisma.tickets.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  static async getAllTickets() {
    // Unscored tickets (no score yet, or score still at its default of 0)
    // are shown first so new urgent tickets aren't hidden until the
    // hourly priorityRefresh cron job runs.
    const unscoredFilter = { OR: [{ lastScoredAt: null }, { priorityScore: 0 }] };
    const scoredFilter = {
      AND: [{ lastScoredAt: { not: null } }, { priorityScore: { not: 0 } }],
    };

    const [unscored, scored] = await Promise.all([
      prisma.tickets.findMany({
        where: { AND: [unscoredFilter, { deletedAt: null }] },
        orderBy: [{ createdAt: "desc" }],
        include: ticketListIncludes,
      }),
      prisma.tickets.findMany({
        where: { AND: [scoredFilter, { deletedAt: null }] },
        orderBy: [{ priorityScore: "desc" }, { createdAt: "desc" }],
        include: ticketListIncludes,
      }),
    ]);

    return [...unscored, ...scored];
  }

  static async getTicketsCounts() {
    const [total, open, newTickets, inProgress, assigned, awaiting, resolved] =
      await Promise.all([
        prisma.tickets.count({ where: { deletedAt: null } }),
        prisma.tickets.count({
          where: {
            deletedAt: null,
            status: {
              in: ["new", "in_progress", "assigned", "awaiting_client"],
            },
          },
        }),
        prisma.tickets.count({
          where: { deletedAt: null, status: "new" },
        }),
        prisma.tickets.count({
          where: { deletedAt: null, status: "in_progress" },
        }),
        prisma.tickets.count({
          where: { deletedAt: null, status: "assigned" },
        }),
        prisma.tickets.count({
          where: { deletedAt: null, status: "awaiting_client" },
        }),
        prisma.tickets.count({
          where: { deletedAt: null, status: "resolved" },
        }),
      ]);

    return {
      total,
      open,
      closed: resolved,
      byStatus: {
        new: newTickets,
        in_progress: inProgress,
        assigned,
        awaiting_client: awaiting,
        resolved,
      },
    };
  }

  static async createTicketWithUploadsAndNotify(
    userId: string,
    body: any,
    files: any
  ) {
    try {
      const userExists = await TicketsService.checkUserExists(userId);
      if (!userExists) {
        return { error: ERROR_MESSAGES.USER_DOES_NOT_EXIST };
      }

      // Validate required fields before touching the database
      if (!body.title || !body.title.trim()) {
        return { error: ERROR_MESSAGES.TICKET_TITLE_REQUIRED };
      }
      if (!body.description || !body.description.trim()) {
        return { error: ERROR_MESSAGES.TICKET_DESCRIPTION_REQUIRED };
      }

      const userRole = await getUserRole(userId);
      const isAdmin =
        userRole?.includes("admin") || userRole?.includes("super_admin");
      let imageUrls: string[] = await uploadTicketFiles(files);
      let ticketData;
      if (isAdmin) {
        if (!body.clientId || !body.clientId.trim()) {
          return { error: ERROR_MESSAGES.TICKET_CLIENT_REQUIRED };
        }
        ticketData = { ...body, imageUrls };
      } else {
        const client = await new ClientService().findClientByUserId(userId);
        if (!client || "error" in client) {
          return { error: ERROR_MESSAGES.NO_CLIENT_ASSOCIATED_WITH_USER };
        }
        ticketData = { ...body, imageUrls, clientId: client.id };
      }
      const ticketResult = await TicketsService.createTicket(
        userId,
        ticketData
      );
      if (!ticketResult || "error" in ticketResult) {
        return { error: ticketResult?.error };
      }

      // Slack notification and in-app admin alerts are sent after ML scoring completes
      // (inside queueBackgroundScoring) so priority and score are included.

      return { data: ticketResult };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  static async getUserTicketsControllerLogic(userId: string) {
    const userExists = await TicketsService.checkUserExists(userId);
    if (!userExists) {
      throw new Error(ERROR_MESSAGES.USER_DOES_NOT_EXIST);
    }
    const userRole = await getUserRole(userId);
    const isAdmin = userRole === "super_admin" || userRole === "ticket_manager";

    let accessFilter: any = {};
    if (!isAdmin) {
      try {
        const client = await new ClientService().findClientByUserId(userId);
        if (!client || "error" in client) {
          accessFilter = { OR: [{ createdBy: userId }] };
        } else {
          accessFilter = { OR: [{ createdBy: userId }, { clientId: client.id }] };
        }
      } catch {
        accessFilter = { OR: [{ createdBy: userId }] };
      }
    }

    // Unscored tickets (no score yet, or score still at its default of 0)
    // are shown first so new urgent tickets aren't hidden until the
    // hourly priorityRefresh cron job runs.
    const unscoredFilter = { OR: [{ lastScoredAt: null }, { priorityScore: 0 }] };
    const scoredFilter = {
      AND: [{ lastScoredAt: { not: null } }, { priorityScore: { not: 0 } }],
    };

    const [unscored, scored] = await Promise.all([
      prisma.tickets.findMany({
        where: { AND: [accessFilter, unscoredFilter, { deletedAt: null }] },
        orderBy: [{ createdAt: "desc" }],
        include: ticketListIncludes,
      }),
      prisma.tickets.findMany({
        where: { AND: [accessFilter, scoredFilter, { deletedAt: null }] },
        orderBy: [{ priorityScore: "desc" }, { createdAt: "desc" }],
        include: ticketListIncludes,
      }),
    ]);

    return [...unscored, ...scored];
  }

  static async getAllTicketsControllerLogic(userId: string) {
    const userRole = await getUserRole(userId);
    const isAdmin =
      userRole?.includes("admin") || userRole?.includes("super_admin");
    if (!isAdmin) {
      return { error: ERROR_MESSAGES.UNAUTHORIZED };
    }
    const tickets = await TicketsService.getAllTickets();
    return { data: tickets };
  }

  static async getTicketsCountsControllerLogic(userId: string) {
    const userRole = await getUserRole(userId);
    const isAdmin =
      userRole?.includes("admin") || userRole?.includes("super_admin");
    if (!isAdmin) {
      return { error: ERROR_MESSAGES.UNAUTHORIZED };
    }
    const counts = await TicketsService.getTicketsCounts();
    return { data: counts };
  }

  static async updateTicketWithValidation(user: any, id: string, body: any, files?: any) {
    try {
      if (user && (user.role === "client" || user.role === "user")) {
        return { error: ERROR_MESSAGES.UNAUTHORIZED, status: 403 };
      }
      const { status, priority } = body;
      const updateData: any = {};
      if ("status" in body) {
        if (!Object.values(StatusEnum).includes(status)) {
          return {
            error: `${ERROR_MESSAGES.INVALID_STATUS}: ${Object.values(
              StatusEnum
            ).join(", ")}`,
            status: 400,
          };
        }
        updateData.status = status;
      }
      if ("priority" in body) {
        if (!Object.values(PriorityEnum).includes(priority)) {
          return {
            error: `${ERROR_MESSAGES.INVALID_PRIORITY}: ${Object.values(
              PriorityEnum
            ).join(", ")}`,
            status: 400,
          };
        }
        updateData.priority = priority;
      }
      const hasNewFiles = Array.isArray(files) && files.length > 0;
      if (Object.keys(updateData).length === 0 && !hasNewFiles) {
        return { error: ERROR_MESSAGES.NO_VALID_FIELDS_TO_UPDATE, status: 400 };
      }
      try {
        const oldTicket = await TicketsService.getTicketById(id);

        if (hasNewFiles) {
          const imageUrls = await uploadTicketFiles(files);
          for (const url of imageUrls) {
            await prisma.ticketAttachment.create({
              data: { ticketId: id, fileUrl: url },
            });
          }
        }

        const ticket =
          Object.keys(updateData).length > 0
            ? await TicketsService.updateTicket(id, updateData)
            : await TicketsService.getTicketById(id);

        if ("status" in body) {
          // In-app DB notifications for status change (client + admins)
          try {
            const tc = oldTicket?.ticketCode ?? "";
            const tt = oldTicket?.title ?? "Ticket";
            if (tc) {
              await TicketsService.createStatusChangeNotifications(id, tc, tt, body.status);
            }
          } catch (notifErr) {
            console.error("Status change DB notification error:", notifErr);
          }
        }
        return { data: ticket };
      } catch (error: any) {
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          (error as any).code === "P2025"
        ) {
          return { error: ERROR_MESSAGES.TICKET_NOT_FOUND, status: 404 };
        } else {
          return { error: ERROR_MESSAGES.FAILED_TO_UPDATE_TICKET, status: 400 };
        }
      }
    } catch (error: any) {
      return {
        error: error.message || ERROR_MESSAGES.FAILED_TO_UPDATE_TICKET,
        status: 400,
      };
    }
  }

  static async getTicketByIdWithAuth(id: string, user: any) {
    const ticket = await TicketsService.getTicketById(id);
    throwIfTicketNotFound(ticket);
    throwIfNotAuthorized(user, ticket);
    return ticket;
  }

  static async deleteTicketWithAuth(id: string, user: any) {
    const ticket = await TicketsService.getTicketById(id);
    throwIfTicketNotFound(ticket);
    throwIfNotAuthorized(user, ticket);
    await TicketsService.deleteTicket(id);
    return true;
  }

  static async addComment(ticketId: string, userId: string, text: string) {
    const ticket = await prisma.tickets.findFirst({ where: { id: ticketId, deletedAt: null } });
    if (!ticket) return { error: ERROR_MESSAGES.TICKET_NOT_FOUND };
    const comment = await prisma.ticketComment.create({
      data: { ticketId, userId, text },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });

    setImmediate(async () => {
      try {
        const commenterRole = await getUserRole(userId);
        await TicketsService.createCommentNotification(ticketId, ticket.ticketCode, commenterRole);
      } catch (e) {
        console.error(`[comment] notification failed for ticket ${ticket.ticketCode}:`, e);
      }
    });

    return { data: comment };
  }

  static async addNote(ticketId: string, userId: string, text: string) {
    const ticket = await prisma.tickets.findFirst({ where: { id: ticketId, deletedAt: null } });
    if (!ticket) return { error: ERROR_MESSAGES.TICKET_NOT_FOUND };
    const note = await prisma.ticketNote.create({
      data: { ticketId, userId, text },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
    return { data: note };
  }

  static async getDeveloperAssignedTickets(userId: string) {
    const assignments = await prisma.userTickets.findMany({
      where: { userId, ticket: { deletedAt: null } },
      include: {
        ticket: {
          include: {
            client: { select: { id: true, companyName: true, clientCode: true, status: true } },
            product: { select: { id: true, name: true, productCode: true, status: true, updatedAt: true } },
            owner: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return assignments.map((a) => a.ticket).filter(Boolean);
  }

  static async getTicketsAssignedToUser(userId: string) {
    return TicketsService.getDeveloperAssignedTickets(userId);
  }

  static async assignTicket(ticketId: string, assigneeId: string, _assignedBy: string, deadline?: string) {
    const ticket = await prisma.tickets.findFirst({ where: { id: ticketId, deletedAt: null } });
    if (!ticket) return { error: ERROR_MESSAGES.TICKET_NOT_FOUND };

    const assignee = await prisma.users.findUnique({ where: { id: assigneeId, deletedAt: null } });
    if (!assignee) return { error: "Assignee not found" };

    await prisma.userTickets.upsert({
      where: { userId_ticketId: { userId: assigneeId, ticketId } },
      update: {},
      create: {
        userId: assigneeId,
        ticketId,
        clientId: ticket.clientId ?? "",
      },
    });

    const updated = await prisma.tickets.update({
      where: { id: ticketId },
      data: {
        status: "assigned",
        ...(deadline && { dueDate: new Date(deadline) }),
      },
      include: {
        client: { select: { companyName: true } },
        product: { select: { name: true } },
      },
    });

    // In-app notification for the assigned developer
    try {
      await prisma.notification.create({
        data: {
          userId: assigneeId,
          type: "ticket_assigned",
          title: "Ticket Assigned to You",
          body: `You have been assigned ticket [${ticket.ticketCode}] — "${ticket.title}".`,
          ticketCode: ticket.ticketCode,
        },
      });
    } catch (e) {
      console.error("Assignment notification error:", e);
    }

    return { data: updated };
  }
}
