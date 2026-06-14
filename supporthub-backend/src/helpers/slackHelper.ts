import { SlackTicket, SlackProduct } from "../types/ticket";

export function buildSlackTicketMessage(ticketResult: SlackTicket, product: SlackProduct, userName: string): string {
  return [
    `*New ticket created:*\n${ticketResult.title}(${ticketResult.ticketCode})`,
    `${product?.name || "Unknown"}(${product?.productCode || "Unknown"})`,
    "description" in ticketResult ? `Description: ${ticketResult.description}` : null,
    ...(ticketResult.TicketAttachments?.map((attachment: any) => attachment.fileUrl) || []),
    `Created by: ${userName}`,
  ].filter(Boolean).join("\n");
}

const PRIORITY_EMOJI: Record<string, string> = {
  critical: "🔴",
  high:     "🟠",
  medium:   "🟡",
  low:      "🟢",
};

export function buildSlackNewTicketMessage({
  ticketCode,
  title,
  priority,
  priorityScore,
  clientName,
  userName,
  createdAt,
}: {
  ticketCode: string;
  title: string;
  priority: string;
  priorityScore: number;
  clientName: string;
  userName: string;
  createdAt: Date;
}): string {
  const emoji = PRIORITY_EMOJI[priority.toLowerCase()] ?? "🟡";
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const pct = Math.round(priorityScore * 100);
  const time = new Date(createdAt).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  return [
    "🚨 *New Ticket Submitted*",
    "",
    `*Ticket:* ${ticketCode}`,
    `*Priority:* ${emoji} ${cap(priority)}`,
    `*Score:* ${pct}%`,
    `*Client:* ${clientName}`,
    `*Title:* ${title}`,
    `*Submitted by:* ${userName}`,
    `*Time:* ${time}`,
  ].join("\n");
}

export function buildSlackStatusChangeMessage(ticketTitle: string, ticketCode: string, oldStatus: string, newStatus: string, updatedBy: string): string {
  return [
    "*Ticket status updated:*",
    `${ticketTitle}(${ticketCode})`,
    `Status from *${oldStatus}* to *${newStatus}*`,
    `Updated by: ${updatedBy}`,
  ].join("\n");
}
