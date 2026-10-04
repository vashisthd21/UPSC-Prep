import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { User, UserRole } from "../models/User";

export interface AuthPayload {
  userId: string;
  role: UserRole;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("Missing or malformed authorization header"));
  }

  const token = header.slice("Bearer ".length);

  try {
    const secret = process.env.JWT_SECRET as string;
    const payload = jwt.verify(token, secret) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    next(ApiError.unauthorized("Invalid or expired token"));
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden("You do not have access to this resource"));
    }
    next();
  };
}

// Confirms the user id in the token still maps to an existing, active account.
// Cheap guard against a deleted user replaying an old token.
export async function loadCurrentUser(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) return next(ApiError.unauthorized());
    const exists = await User.exists({ _id: req.user.userId });
    if (!exists) return next(ApiError.unauthorized("Account no longer exists"));
    next();
  } catch (err) {
    next(err);
  }
}
