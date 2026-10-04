import { Router } from "express";
import {
  getOverview,
  getPlatformAnalytics,
  getSubjectAnalytics,
  getTopicAnalytics,
} from "../controllers/analyticsController";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/overview", getOverview);
router.get("/subjects", getSubjectAnalytics);
router.get("/topics", getTopicAnalytics);
router.get("/platform", requireRole("admin"), getPlatformAnalytics);

export default router;
