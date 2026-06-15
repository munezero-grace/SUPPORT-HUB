import express from "express";
import multer from "multer";
import UsersController from "../controllers/users.controller";
import { authenticateUser } from "../middlewares/authenticateUser";
import { WrapAsync } from "../middlewares/wrapAsync";
import { requireRole } from "../middlewares/requireRole";

const avatarUpload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

const router = express.Router();

router.get(
  "/",
  WrapAsync(authenticateUser),
  WrapAsync(requireRole("super_admin")),
  WrapAsync(UsersController.getAllUsers)
);

router.post(
  "/",
  WrapAsync(authenticateUser),
  WrapAsync(requireRole("super_admin")),
  WrapAsync(UsersController.createUser)
);
router.get(
  "/team",
  WrapAsync(authenticateUser),
  WrapAsync(requireRole("super_admin", "ticket_manager")),
  WrapAsync(UsersController.getTeamMembers)
);

router.get(
  "/profile",
  WrapAsync(authenticateUser),
  WrapAsync(UsersController.getUserProfile)
);
router.put(
  "/profile",
  WrapAsync(authenticateUser),
  WrapAsync(UsersController.updateUserProfile)
);

router.post(
  "/profile/picture",
  WrapAsync(authenticateUser),
  avatarUpload.single("profilePicture"),
  WrapAsync(UsersController.uploadProfilePicture)
);

router.put(
  "/profile/company",
  WrapAsync(authenticateUser),
  WrapAsync(UsersController.updateUserCompanyProfile)
);
router.delete(
  "/:id/soft-delete",
  WrapAsync(authenticateUser),
  WrapAsync(UsersController.softDeleteUser)
);

router.post(
  "/:id/restore",
  WrapAsync(authenticateUser),
  WrapAsync(requireRole("super_admin")),
  WrapAsync(UsersController.reactivateUser)
);

router.post(
  "/:id/resend-invite",
  WrapAsync(authenticateUser),
  WrapAsync(requireRole("super_admin")),
  WrapAsync(UsersController.resendInvite)
);

export default router;
