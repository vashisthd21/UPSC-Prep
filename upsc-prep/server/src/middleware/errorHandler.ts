import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

// Centralized error formatter. Never leaks stack traces or raw driver
// errors to the client - only a safe message and, for validation
// failures, the field-level details.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
  }

  if (err && typeof err === "object" && "name" in err) {
    const anyErr = err as { name: string; code?: number; errors?: unknown };

    if (anyErr.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        details: anyErr.errors,
      });
    }
    if (anyErr.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid identifier" });
    }
    if (anyErr.code === 11000) {
      return res.status(409).json({ success: false, message: "Duplicate value" });
    }
  }

  console.error("[unhandled error]", err);
  return res.status(500).json({ success: false, message: "Internal server error" });
}
