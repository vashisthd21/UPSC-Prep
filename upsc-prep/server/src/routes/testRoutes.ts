import { Router } from "express";
import {
  createTest,
  deleteTest,
  generateCustomTest,
  getTest,
  getTestQuestions,
  listTests,
  updateTest,
} from "../controllers/testController";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", listTests);
router.get("/:id", getTest);
router.get("/:id/questions", requireAuth, getTestQuestions);
router.post("/generate", requireAuth, generateCustomTest);

router.post("/", requireAuth, requireRole("admin"), createTest);
router.put("/:id", requireAuth, requireRole("admin"), updateTest);
router.delete("/:id", requireAuth, requireRole("admin"), deleteTest);

export default router;
