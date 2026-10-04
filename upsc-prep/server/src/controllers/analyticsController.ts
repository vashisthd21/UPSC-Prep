import { Request, Response } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { TestAttempt } from "../models/TestAttempt";
import { Question } from "../models/Question";

const SUBMITTED = { $in: ["SUBMITTED", "AUTO_SUBMITTED"] };

export const getOverview = asyncHandler(async (req: Request, res: Response) => {
  const userId = new mongoose.Types.ObjectId(req.user!.userId);

  const attempts = await TestAttempt.find({ user: userId, status: SUBMITTED })
    .sort({ createdAt: 1 })
    .select("score accuracy correctCount incorrectCount unattemptedCount createdAt");

  const testsAttempted = attempts.length;
  const questionsSolved = attempts.reduce(
    (sum, a) => sum + a.correctCount + a.incorrectCount,
    0
  );
  const avgScore =
    testsAttempted > 0
      ? Math.round((attempts.reduce((s, a) => s + a.score, 0) / testsAttempted) * 100) / 100
      : 0;
  const avgAccuracy =
    testsAttempted > 0
      ? Math.round((attempts.reduce((s, a) => s + a.accuracy, 0) / testsAttempted) * 100) / 100
      : 0;

  // Current streak = consecutive most-recent days (by local date string)
  // with at least one submitted attempt.
  const days = Array.from(
    new Set(attempts.map((a) => a.createdAt.toISOString().slice(0, 10)))
  ).sort();
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    const expected = new Date();
    expected.setDate(expected.getDate() - (days.length - 1 - i));
    if (days[i] === expected.toISOString().slice(0, 10)) streak += 1;
    else break;
  }

  const scoreTrend = attempts.map((a, i) => ({
    testNumber: i + 1,
    score: a.score,
    accuracy: a.accuracy,
    date: a.createdAt,
  }));

  sendSuccess(res, {
    testsAttempted,
    questionsSolved,
    avgScore,
    avgAccuracy,
    currentStreak: streak,
    scoreTrend,
  });
});

export const getSubjectAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const userId = new mongoose.Types.ObjectId(req.user!.userId);

  const rows = await TestAttempt.aggregate([
    { $match: { user: userId, status: SUBMITTED } },
    { $unwind: "$answers" },
    { $match: { "answers.selected": { $exists: true, $ne: null } } },
    {
      $lookup: {
        from: "questions",
        localField: "answers.question",
        foreignField: "_id",
        as: "q",
      },
    },
    { $unwind: "$q" },
    {
      $group: {
        _id: "$q.subject",
        attempted: { $sum: 1 },
        correct: { $sum: { $cond: ["$answers.isCorrect", 1, 0] } },
      },
    },
    {
      $project: {
        _id: 0,
        subject: "$_id",
        attempted: 1,
        correct: 1,
        accuracy: {
          $cond: [
            { $eq: ["$attempted", 0] },
            0,
            { $round: [{ $multiply: [{ $divide: ["$correct", "$attempted"] }, 100] }, 2] },
          ],
        },
      },
    },
    { $sort: { subject: 1 } },
  ]);

  sendSuccess(res, rows);
});

export const getTopicAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const userId = new mongoose.Types.ObjectId(req.user!.userId);

  const rows = await TestAttempt.aggregate([
    { $match: { user: userId, status: SUBMITTED } },
    { $unwind: "$answers" },
    { $match: { "answers.selected": { $exists: true, $ne: null } } },
    {
      $lookup: {
        from: "questions",
        localField: "answers.question",
        foreignField: "_id",
        as: "q",
      },
    },
    { $unwind: "$q" },
    {
      $group: {
        _id: { subject: "$q.subject", topic: "$q.topic" },
        attempted: { $sum: 1 },
        correct: { $sum: { $cond: ["$answers.isCorrect", 1, 0] } },
      },
    },
    {
      $project: {
        _id: 0,
        subject: "$_id.subject",
        topic: "$_id.topic",
        attempted: 1,
        correct: 1,
        accuracy: {
          $cond: [
            { $eq: ["$attempted", 0] },
            0,
            { $round: [{ $multiply: [{ $divide: ["$correct", "$attempted"] }, 100] }, 2] },
          ],
        },
      },
    },
    { $sort: { accuracy: 1 } },
  ]);

  // Weak topics are derived here from real attempt data (min. 3 attempts
  // to avoid noise) rather than ever being hard-coded.
  const weakTopics = rows.filter((r) => r.attempted >= 3 && r.accuracy < 50).slice(0, 5);

  sendSuccess(res, { topics: rows, weakTopics });
});

export const getPlatformAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const [totalQuestions, totalAttempts, avgScoreAgg] = await Promise.all([
    Question.countDocuments({ isActive: true }),
    TestAttempt.countDocuments({ status: SUBMITTED }),
    TestAttempt.aggregate([
      { $match: { status: SUBMITTED } },
      { $group: { _id: null, avgScore: { $avg: "$score" }, avgAccuracy: { $avg: "$accuracy" } } },
    ]),
  ]);

  sendSuccess(res, {
    totalQuestions,
    totalAttempts,
    avgScore: Math.round((avgScoreAgg[0]?.avgScore || 0) * 100) / 100,
    avgAccuracy: Math.round((avgScoreAgg[0]?.avgAccuracy || 0) * 100) / 100,
  });
});
