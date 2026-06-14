import { Router } from "express";
import { WrapAsync } from "../middlewares/wrapAsync";
import { authenticateUser } from "../middlewares/authenticateUser";
import NotificationController from "../controllers/notification.controller";

const router = Router();

router.get("/", WrapAsync(authenticateUser), WrapAsync(NotificationController.getNotifications));
router.patch("/mark-read", WrapAsync(authenticateUser), WrapAsync(NotificationController.markAllRead));

export default router;
