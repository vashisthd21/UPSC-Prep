import { Request, Response } from "express";
import { FilterQuery, Types } from "mongoose";

import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

import { ITest, Test } from "../models/Test";
import { Question } from "../models/Question";

import { generateCustomTestQuestions } from "../services/testGeneratorService";

/**
 * GET /api/tests
 *
 * Public endpoint.
 * Returns only published tests.
 */
export const listTests = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      testType,
      subject,
      difficulty,
      search,
      page = "1",
      limit = "12",
    } = req.query as Record<string, string>;

    const filter: FilterQuery<ITest> = {
      isPublished: true,
    };

    if (testType) {
      filter.testType = testType;
    }

    if (subject) {
      filter.subjects = subject;
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (search?.trim()) {
      filter.title = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const pageNum = Number.isFinite(parsedPage)
      ? Math.max(1, Math.floor(parsedPage))
      : 1;

    const limitNum = Number.isFinite(parsedLimit)
      ? Math.min(50, Math.max(1, Math.floor(parsedLimit)))
      : 12;

    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Test.find(filter)
        .select("-questions")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean({ virtuals: true }),

      Test.countDocuments(filter),
    ]);

    sendSuccess(res, {
      items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  }
);

/**
 * GET /api/tests/:id
 */
export const getTest = asyncHandler(
  async (req: Request, res: Response) => {
    if (!Types.ObjectId.isValid(req.params.id)) {
      throw ApiError.badRequest("Invalid test ID");
    }

    const test = await Test.findById(req.params.id).select(
      "-questions.correctAnswer"
    );

    if (!test) {
      throw ApiError.notFound("Test not found");
    }

    sendSuccess(res, test);
  }
);

/**
 * GET /api/tests/:id/questions
 *
 * Requires authentication.
 */
export const getTestQuestions = asyncHandler(
  async (req: Request, res: Response) => {
    if (!Types.ObjectId.isValid(req.params.id)) {
      throw ApiError.badRequest("Invalid test ID");
    }

    const test = await Test.findById(req.params.id).select("questions");

    if (!test) {
      throw ApiError.notFound("Test not found");
    }

    const questionIds = Array.isArray(test.questions)
      ? test.questions
      : [];

    const questions = await Question.find({
      _id: {
        $in: questionIds,
      },
    });

    const byId = new Map(
      questions.map((question) => [
        question._id.toString(),
        question,
      ])
    );

    const ordered = questionIds
      .map((id) => byId.get(id.toString()))
      .filter(Boolean)
      .map((question: any) => {
        const obj = question.toObject();

        const {
          correctAnswer,
          explanation,
          upscTakeaway,
          ...safeQuestion
        } = obj;

        return safeQuestion;
      });

    sendSuccess(res, ordered);
  }
);

/**
 * POST /api/tests
 *
 * Admin only.
 */
export const createTest = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user?.userId) {
      throw ApiError.unauthorized();
    }

    const {
      title,
      description,
      testType,
      subjects = [],
      topics = [],
      questions = [],
      difficulty = "Mixed",
      settings,
      isPublished = false,
    } = req.body;

    if (!title?.trim()) {
      throw ApiError.badRequest("Test title is required");
    }

    if (!testType) {
      throw ApiError.badRequest("Test type is required");
    }

    if (!settings?.durationMinutes) {
      throw ApiError.badRequest(
        "Duration is required"
      );
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw ApiError.badRequest(
        "At least one question is required"
      );
    }

    const test = await Test.create({
      title: title.trim(),
      description,
      testType,
      subjects,
      topics,
      questions,
      difficulty,
      settings,
      isPublished,
      createdBy: req.user.userId,
    });

    sendSuccess(
      res,
      test,
      "Test created successfully",
      201
    );
  }
);

/**
 * PUT /api/tests/:id
 *
 * Admin only.
 */
export const updateTest = asyncHandler(
  async (req: Request, res: Response) => {
    if (!Types.ObjectId.isValid(req.params.id)) {
      throw ApiError.badRequest("Invalid test ID");
    }

    const allowedUpdates = [
      "title",
      "description",
      "subjects",
      "topics",
      "difficulty",
      "settings",
      "isPublished",
      "questions",
      "testType",
    ];

    const update: Record<string, unknown> = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        update[key] = req.body[key];
      }
    }

    const test = await Test.findByIdAndUpdate(
      req.params.id,
      update,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!test) {
      throw ApiError.notFound("Test not found");
    }

    sendSuccess(
      res,
      test,
      "Test updated successfully"
    );
  }
);

/**
 * DELETE /api/tests/:id
 *
 * We don't actually delete tests.
 * We unpublish them.
 */
export const deleteTest = asyncHandler(
  async (req: Request, res: Response) => {
    if (!Types.ObjectId.isValid(req.params.id)) {
      throw ApiError.badRequest("Invalid test ID");
    }

    const test = await Test.findByIdAndUpdate(
      req.params.id,
      {
        isPublished: false,
      },
      {
        new: true,
      }
    );

    if (!test) {
      throw ApiError.notFound("Test not found");
    }

    sendSuccess(
      res,
      null,
      "Test unpublished successfully"
    );
  }
);

/**
 * POST /api/tests/generate
 *
 * Generates a custom test from question-bank criteria.
 */
export const generateCustomTest = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user?.userId) {
      throw ApiError.unauthorized();
    }

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

    if (
      !numberOfQuestions ||
      Number(numberOfQuestions) < 1
    ) {
      throw ApiError.badRequest(
        "numberOfQuestions must be at least 1"
      );
    }

    const questions =
      await generateCustomTestQuestions({
        subjects,
        topics,
        difficulty,
        questionTypes,
        numberOfQuestions: Number(
          numberOfQuestions
        ),
        onlyPYQ,
      });

    if (!questions.length) {
      throw ApiError.badRequest(
        "No questions match the selected criteria"
      );
    }

    const test = await Test.create({
      title: title?.trim() || "Custom Practice Test",

      testType: "CUSTOM",

      subjects: Array.isArray(subjects)
        ? subjects
        : [],

      topics: Array.isArray(topics)
        ? topics
        : [],

      questions: questions.map(
        (question) => question._id
      ),

      difficulty:
        Array.isArray(difficulty) &&
        difficulty.length === 1
          ? difficulty[0]
          : "Mixed",

      settings: {
        marksPerCorrect: 2,
        negativeMarks: 0.6667,
        durationMinutes:
          Number(durationMinutes) ||
          Math.max(30, questions.length * 1.2),
      },

      // Generated custom tests are student-specific.
      // They don't need to appear in public mock tests.
      isPublished: false,

      createdBy: req.user.userId,
    });

    sendSuccess(
      res,
      test,
      "Custom test generated",
      201
    );
  }
);
