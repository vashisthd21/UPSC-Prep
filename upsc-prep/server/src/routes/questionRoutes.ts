import { Router } from "express";
import {
  bulkImportQuestions,
  createQuestion,
  deleteQuestion,
  getFacets,
  getQuestion,
  listQuestions,
  updateQuestion,
} from "../controllers/questionController";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", listQuestions);
router.get("/facets", getFacets);
router.get("/:id", getQuestion);

router.post("/", requireAuth, requireRole("admin"), createQuestion);
router.post("/bulk-import", requireAuth, requireRole("admin"), bulkImportQuestions);
router.put("/:id", requireAuth, requireRole("admin"), updateQuestion);
router.delete("/:id", requireAuth, requireRole("admin"), deleteQuestion);

export default router;
