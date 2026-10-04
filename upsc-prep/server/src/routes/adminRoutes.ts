import { Router } from "express";
import {
  createReport,
  deleteUser,
  listReports,
  listUsers,
  updateReportStatus,
  updateUserRole,
} from "../controllers/adminController";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.post("/reports", createReport);
router.get("/reports", requireRole("admin"), listReports);
router.patch("/reports/:id", requireRole("admin"), updateReportStatus);

router.get("/users", requireRole("admin"), listUsers);
router.patch("/users/:id/role", requireRole("admin"), updateUserRole);
router.delete("/users/:id", requireRole("admin"), deleteUser);

export default router;
