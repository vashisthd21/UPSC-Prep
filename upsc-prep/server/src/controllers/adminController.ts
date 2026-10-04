import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/User";
import { Report } from "../models/Report";

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page = "1", limit = "20", search } = req.query as Record<string, string>;
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const filter = search
    ? { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] }
    : {};

  const [items, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(filter),
  ]);

  sendSuccess(res, {
    items,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { role } = req.body;
  if (!["student", "admin"].includes(role)) throw ApiError.badRequest("Invalid role");

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) throw ApiError.notFound("User not found");
  sendSuccess(res, user, "Role updated");
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw ApiError.notFound("User not found");
  sendSuccess(res, null, "User deleted");
});

export const createReport = asyncHandler(async (req: Request, res: Response) => {
  const { questionId, reason, comment } = req.body;
  if (!questionId || !reason) throw ApiError.badRequest("questionId and reason are required");

  const report = await Report.create({
    user: req.user!.userId,
    question: questionId,
    reason,
    comment,
  });
  sendSuccess(res, report, "Report submitted", 201);
});

export const listReports = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query as Record<string, string>;
  const filter = status ? { status } : {};
  const reports = await Report.find(filter)
    .populate("question", "questionText subject topic")
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  sendSuccess(res, reports);
});

export const updateReportStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  if (!["OPEN", "RESOLVED", "DISMISSED"].includes(status)) {
    throw ApiError.badRequest("Invalid status");
  }
  const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!report) throw ApiError.notFound("Report not found");
  sendSuccess(res, report, "Report updated");
});
