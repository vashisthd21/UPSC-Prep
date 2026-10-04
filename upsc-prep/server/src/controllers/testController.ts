import { Request, Response } from "express";
import { FilterQuery } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { ITest, Test } from "../models/Test";
import { Question } from "../models/Question";
import { generateCustomTestQuestions } from "../services/testGeneratorService";

export const listTests = asyncHandler(async (req: Request, res: Response) => {
  const { testType, subject, difficulty, search, page = "1", limit = "12" } =
    req.query as Record<string, string>;

  const filter: FilterQuery<ITest> = { isPublished: true };
  if (testType) filter.testType = testType;
  if (subject) filter.subjects = subject;
  if (difficulty) filter.difficulty = difficulty;
  if (search) filter.title = { $regex: search, $options: "i" };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));

  const [items, total] = await Promise.all([
    Test.find(filter)
      .select("-questions")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Test.countDocuments(filter),
  ]);

  sendSuccess(res, {
    items,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

export const getTest = asyncHandler(async (req: Request, res: Response) => {
  const test = await Test.findById(req.params.id).select("-questions.correctAnswer");
  if (!test) throw ApiError.notFound("Test not found");
  sendSuccess(res, test);
});

// Returns the test's questions, in the test's own stored order, with the
// answer key and explanation stripped - used to render the live test-taking
// interface. Never exposed alongside correctAnswer/explanation.
export const getTestQuestions = asyncHandler(async (req: Request, res: Response) => {
  const test = await Test.findById(req.params.id);
  if (!test) throw ApiError.notFound("Test not found");

  const questions = await Question.find({ _id: { $in: test.questions } });
  const byId = new Map(questions.map((q) => [q._id.toString(), q]));

  const ordered = test.questions
    .map((id) => byId.get(id.toString()))
    .filter(Boolean)
    .map((q: any) => {
      const obj = q.toObject();
      const { correctAnswer, explanation, upscTakeaway, ...safe } = obj;
      return safe;
    });

  sendSuccess(res, ordered);
});

export const createTest = asyncHandler(async (req: Request, res: Response) => {
  const test = await Test.create({ ...req.body, createdBy: req.user!.userId });
  sendSuccess(res, test, "Test created", 201);
});

export const updateTest = asyncHandler(async (req: Request, res: Response) => {
  const test = await Test.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!test) throw ApiError.notFound("Test not found");
  sendSuccess(res, test, "Test updated");
});

export const deleteTest = asyncHandler(async (req: Request, res: Response) => {
  const test = await Test.findByIdAndUpdate(
    req.params.id,
    { isPublished: false },
    { new: true }
  );
  if (!test) throw ApiError.notFound("Test not found");
  sendSuccess(res, null, "Test removed");
});

// Builds and persists a one-off Test document from student-selected
// criteria, so it can be attempted, reviewed and re-attempted like any
// other test.
export const generateCustomTest = asyncHandler(async (req: Request, res: Response) => {
  const {
    title,
    subjects,
    topics,
    difficulty,
    questionTypes,
    numberOfQuestions,
    durationMinutes,
    onlyPYQ,
  } = req.body;

  if (!numberOfQuestions || numberOfQuestions < 1) {
    throw ApiError.badRequest("numberOfQuestions must be at least 1");
  }

  const questions = await generateCustomTestQuestions({
    subjects,
    topics,
    difficulty,
    questionTypes,
    numberOfQuestions,
    onlyPYQ,
  });

  if (questions.length === 0) {
    throw ApiError.badRequest("No questions match the selected criteria");
  }
  if (questions.length < numberOfQuestions) {
    // Proceed with what's available rather than failing outright - the
    // question bank may simply not have enough matches yet.
  }

  const test = await Test.create({
    title: title || "Custom Practice Test",
    testType: "CUSTOM",
    subjects: subjects || [],
    topics: topics || [],
    questions: questions.map((q) => q._id),
    difficulty: difficulty?.length === 1 ? difficulty[0] : "Mixed",
    settings: {
      marksPerCorrect: 2,
      negativeMarks: 0.6667,
      durationMinutes: durationMinutes || Math.max(30, questions.length * 1.2),
    },
    createdBy: req.user!.userId,
  });

  sendSuccess(res, test, "Custom test generated", 201);
});
