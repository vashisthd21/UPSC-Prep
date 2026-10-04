import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { Test } from "../models/Test";
import { TestAttempt } from "../models/TestAttempt";
import { Question } from "../models/Question";
import { computeScore } from "../services/scoringService";

export const startAttempt = asyncHandler(async (req: Request, res: Response) => {
  const { testId } = req.body;
  const test = await Test.findById(testId);
  if (!test) throw ApiError.notFound("Test not found");

  // A student may have one in-progress attempt per test at a time - resume
  // it instead of creating a duplicate.
  const existing = await TestAttempt.findOne({
    user: req.user!.userId,
    test: testId,
    status: "IN_PROGRESS",
  });
  if (existing) return sendSuccess(res, existing, "Resuming in-progress attempt");

  const attempt = await TestAttempt.create({
    user: req.user!.userId,
    test: testId,
    answers: test.questions.map((q) => ({ question: q, status: "UNVISITED", timeSpentSeconds: 0 })),
    startedAt: new Date(),
    durationMinutes: test.settings.durationMinutes,
  });

  test.attemptCount += 1;
  await test.save();

  sendSuccess(res, attempt, "Attempt started", 201);
});

async function getOwnedAttempt(attemptId: string, userId: string) {
  const attempt = await TestAttempt.findById(attemptId);
  if (!attempt) throw ApiError.notFound("Attempt not found");
  if (attempt.user.toString() !== userId) throw ApiError.forbidden();
  return attempt;
}

export const saveAnswer = asyncHandler(async (req: Request, res: Response) => {
  const { questionId, selected, status, timeSpentSeconds } = req.body;
  const attempt = await getOwnedAttempt(req.params.id, req.user!.userId);

  if (attempt.status !== "IN_PROGRESS") {
    throw ApiError.badRequest("This attempt has already been submitted");
  }

  const record = attempt.answers.find((a) => a.question.toString() === questionId);
  if (!record) throw ApiError.badRequest("Question does not belong to this attempt");

  if (selected !== undefined) record.selected = selected || undefined;
  if (typeof timeSpentSeconds === "number") record.timeSpentSeconds += timeSpentSeconds;

  // Derive status from selection + explicit review flag when not passed
  // directly, so "Clear Response" and "Mark for Review" both work from a
  // single endpoint.
  if (status) {
    record.status = status;
  } else {
    record.status = record.selected ? "ANSWERED" : "VISITED";
  }

  await attempt.save();
  sendSuccess(res, attempt, "Answer saved");
});

export const getAttempt = asyncHandler(async (req: Request, res: Response) => {
  const attempt = await getOwnedAttempt(req.params.id, req.user!.userId);
  sendSuccess(res, attempt);
});

export const submitAttempt = asyncHandler(async (req: Request, res: Response) => {
  const attempt = await getOwnedAttempt(req.params.id, req.user!.userId);
  if (attempt.status !== "IN_PROGRESS") {
    return sendSuccess(res, attempt, "Attempt already submitted");
  }

  const test = await Test.findById(attempt.test);
  if (!test) throw ApiError.notFound("Underlying test not found");

  const questions = await Question.find({ _id: { $in: attempt.answers.map((a) => a.question) } });
  const answerKey = new Map(questions.map((q) => [q._id.toString(), q.correctAnswer]));

  for (const answer of attempt.answers) {
    if (answer.selected) {
      answer.isCorrect = answer.selected === answerKey.get(answer.question.toString());
    }
  }

  const result = computeScore(attempt.answers, test.settings);
  attempt.score = result.score;
  attempt.correctCount = result.correctCount;
  attempt.incorrectCount = result.incorrectCount;
  attempt.unattemptedCount = result.unattemptedCount;
  attempt.accuracy = result.accuracy;
  attempt.submittedAt = new Date();
  attempt.timeTakenSeconds = Math.round(
    (attempt.submittedAt.getTime() - attempt.startedAt.getTime()) / 1000
  );
  attempt.status = req.body.autoSubmitted ? "AUTO_SUBMITTED" : "SUBMITTED";

  await attempt.save();
  sendSuccess(res, attempt, "Test submitted");
});

export const getAttemptReview = asyncHandler(async (req: Request, res: Response) => {
  const attempt = await getOwnedAttempt(req.params.id, req.user!.userId);
  if (attempt.status === "IN_PROGRESS") {
    throw ApiError.badRequest("Submit the test before reviewing it");
  }

  const questions = await Question.find({
    _id: { $in: attempt.answers.map((a) => a.question) },
  });
  const byId = new Map(questions.map((q) => [q._id.toString(), q]));

  const review = attempt.answers.map((a) => ({
    question: byId.get(a.question.toString()),
    selected: a.selected,
    isCorrect: a.isCorrect,
    status: a.status,
  }));

  sendSuccess(res, { attempt, review });
});

export const getHistory = asyncHandler(async (req: Request, res: Response) => {
  const { page = "1", limit = "10" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));

  const filter = { user: req.user!.userId, status: { $ne: "IN_PROGRESS" } };

  const [items, total] = await Promise.all([
    TestAttempt.find(filter)
      .populate("test", "title testType subjects")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    TestAttempt.countDocuments(filter),
  ]);

  sendSuccess(res, {
    items,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});
