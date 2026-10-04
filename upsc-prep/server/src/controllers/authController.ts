import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/User";

function signToken(userId: string, role: string) {
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];
  return jwt.sign({ userId, role }, secret, { expiresIn });
}

function toPublicUser(user: {
  _id: unknown;
  name: string;
  email: string;
  role: string;
  targetYear?: number;
  optionalSubject?: string;
}) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    targetYear: user.targetYear,
    optionalSubject: user.optionalSubject,
  };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, targetYear, optionalSubject } = req.body;

  if (!name || !email || !password) {
    throw ApiError.badRequest("Name, email and password are required");
  }
  if (String(password).length < 8) {
    throw ApiError.badRequest("Password must be at least 8 characters");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw ApiError.conflict("An account with this email already exists");

  const user = await User.create({
    name,
    email,
    password,
    targetYear,
    optionalSubject,
  });

  const token = signToken(user._id.toString(), user.role);
  sendSuccess(res, { token, user: toPublicUser(user) }, "Account created", 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) throw ApiError.badRequest("Email and password are required");

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) throw ApiError.unauthorized("Invalid email or password");

  const valid = await user.comparePassword(password);
  if (!valid) throw ApiError.unauthorized("Invalid email or password");

  const token = signToken(user._id.toString(), user.role);
  sendSuccess(res, { token, user: toPublicUser(user) }, "Logged in");
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.userId);
  if (!user) throw ApiError.notFound("User not found");
  sendSuccess(res, toPublicUser(user));
});
