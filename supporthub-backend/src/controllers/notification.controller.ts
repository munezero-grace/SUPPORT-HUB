import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { HTTP_OK } from "../constants/httpStatusCodes";

const prisma = new PrismaClient();

export default class NotificationController {
  static async getNotifications(req: Request, res: Response): Promise<Response> {
    const userId = req.user?.id as string;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    return res.status(HTTP_OK).json({ data: notifications });
  }

  static async markAllRead(req: Request, res: Response): Promise<Response> {
    const userId = req.user?.id as string;
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return res.status(HTTP_OK).json({ data: { ok: true } });
  }
}
