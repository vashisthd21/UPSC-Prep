import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { Bookmark } from "../models/Bookmark";

export const listBookmarks = asyncHandler(async (req: Request, res: Response) => {
  const bookmarks = await Bookmark.find({ user: req.user!.userId })
    .populate("question")
    .sort({ createdAt: -1 });
  sendSuccess(res, bookmarks);
});

export const addBookmark = asyncHandler(async (req: Request, res: Response) => {
  const { questionId } = req.body;
  if (!questionId) throw ApiError.badRequest("questionId is required");

  const bookmark = await Bookmark.findOneAndUpdate(
    { user: req.user!.userId, question: questionId },
    { user: req.user!.userId, question: questionId },
    { upsert: true, new: true }
  );
  sendSuccess(res, bookmark, "Bookmarked", 201);
});

export const removeBookmark = asyncHandler(async (req: Request, res: Response) => {
  await Bookmark.findOneAndDelete({
    user: req.user!.userId,
    question: req.params.questionId,
  });
  sendSuccess(res, null, "Bookmark removed");
});
