import { Request, Response } from "express";
import { FilterQuery } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { IQuestion, Question } from "../models/Question";

// Strips the answer key + explanation before a question reaches a student
// during an active attempt, so the client can never "see" the answer.
function toSafeQuestion(q: IQuestion) {
  const obj = q.toObject ? q.toObject() : q;
  const { correctAnswer, explanation, upscTakeaway, ...safe } = obj as any;
  return safe;
}

export const listQuestions = asyncHandler(async (req: Request, res: Response) => {
  const {
    subject,
    topic,
    difficulty,
    questionType,
    isPYQ,
    year,
    search,
    page = "1",
    limit = "20",
    reveal,
  } = req.query as Record<string, string>;

  const filter: FilterQuery<IQuestion> = { isActive: true };
  if (subject) filter.subject = subject;
  if (topic) filter.topic = topic;
  if (difficulty) filter.difficulty = difficulty;
  if (questionType) filter.questionType = questionType;
  if (isPYQ !== undefined) filter.isPYQ = isPYQ === "true";
  if (year) filter.year = Number(year);
  if (search) filter.$text = { $search: search };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [items, total] = await Promise.all([
    Question.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Question.countDocuments(filter),
  ]);

  // Admin question-bank views pass reveal=true to see answers; everywhere
  // else (practice/browsing) answers are stripped.
  const data = reveal === "true" ? items : items.map(toSafeQuestion);

  sendSuccess(res, {
    items: data,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

export const getQuestion = asyncHandler(async (req: Request, res: Response) => {
  const question = await Question.findById(req.params.id);
  if (!question) throw ApiError.notFound("Question not found");
  const reveal = req.query.reveal === "true";
  sendSuccess(res, reveal ? question : toSafeQuestion(question));
});

export const createQuestion = asyncHandler(async (req: Request, res: Response) => {
  const question = await Question.create({ ...req.body, createdBy: req.user!.userId });
  sendSuccess(res, question, "Question created", 201);
});

export const updateQuestion = asyncHandler(async (req: Request, res: Response) => {
  const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!question) throw ApiError.notFound("Question not found");
  sendSuccess(res, question, "Question updated");
});

export const deleteQuestion = asyncHandler(async (req: Request, res: Response) => {
  const question = await Question.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!question) throw ApiError.notFound("Question not found");
  sendSuccess(res, null, "Question removed");
});

interface BulkImportRow {
  questionText: string;
  options: string[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  subject: string;
  topic: string;
  subtopic?: string;
  difficulty: string;
  questionType: string;
  isPYQ?: boolean;
  year?: number;
  source?: string;
  tags?: string[];
}

export const bulkImportQuestions = asyncHandler(async (req: Request, res: Response) => {
  const rows = req.body.questions as BulkImportRow[];
  if (!Array.isArray(rows) || rows.length === 0) {
    throw ApiError.badRequest("Provide a non-empty 'questions' array");
  }

  const valid: any[] = [];
  const invalid: { row: number; reason: string }[] = [];
  const seenTexts = new Set<string>();
  let duplicateCount = 0;

  rows.forEach((row, index) => {
    const errors: string[] = [];
    if (!row.questionText) errors.push("Missing questionText");
    if (!Array.isArray(row.options) || row.options.length !== 4)
      errors.push("Must have exactly 4 options");
    if (!["A", "B", "C", "D"].includes(row.correctAnswer))
      errors.push("correctAnswer must be A, B, C or D");
    if (!row.explanation) errors.push("Missing explanation");
    if (!row.subject) errors.push("Missing subject");
    if (!row.topic) errors.push("Missing topic");
    if (!row.difficulty) errors.push("Missing difficulty");
    if (!row.questionType) errors.push("Missing questionType");
    if (row.isPYQ && !row.year) errors.push("PYQ rows must include a year");

    const normalizedText = row.questionText?.trim().toLowerCase();
    if (normalizedText && seenTexts.has(normalizedText)) {
      duplicateCount += 1;
      return;
    }
    if (normalizedText) seenTexts.add(normalizedText);

    if (errors.length) {
      invalid.push({ row: index + 1, reason: errors.join("; ") });
      return;
    }

    valid.push({
      questionText: row.questionText,
      options: row.options.map((text, i) => ({ key: "ABCD"[i], text })),
      correctAnswer: row.correctAnswer,
      explanation: row.explanation,
      subject: row.subject,
      topic: row.topic,
      subtopic: row.subtopic,
      difficulty: row.difficulty,
      questionType: row.questionType,
      isPYQ: Boolean(row.isPYQ),
      year: row.year,
      source: row.source,
      tags: row.tags || [],
      createdBy: req.user!.userId,
    });
  });

  const inserted = valid.length ? await Question.insertMany(valid) : [];

  sendSuccess(
    res,
    {
      insertedCount: inserted.length,
      invalidCount: invalid.length,
      duplicateCount,
      invalidRows: invalid,
    },
    "Bulk import processed"
  );
});

export const getFacets = asyncHandler(async (_req: Request, res: Response) => {
  const [subjects, topics, years] = await Promise.all([
    Question.distinct("subject", { isActive: true }),
    Question.distinct("topic", { isActive: true }),
    Question.distinct("year", { isActive: true, isPYQ: true }),
  ]);
  sendSuccess(res, { subjects, topics, years: years.sort((a, b) => b - a) });
});
