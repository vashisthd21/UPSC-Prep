import { Router } from "express";
import {
  getAttempt,
  getAttemptReview,
  getHistory,
  saveAnswer,
  startAttempt,
  submitAttempt,
} from "../controllers/attemptController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.post("/start", startAttempt);
router.get("/history", getHistory);
router.get("/:id", getAttempt);
router.post("/:id/answer", saveAnswer);
router.post("/:id/submit", submitAttempt);
router.get("/:id/review", getAttemptReview);

export default router;
