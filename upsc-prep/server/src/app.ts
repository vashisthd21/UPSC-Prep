import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes";
import questionRoutes from "./routes/questionRoutes";
import testRoutes from "./routes/testRoutes";
import attemptRoutes from "./routes/attemptRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import bookmarkRoutes from "./routes/bookmarkRoutes";
import adminRoutes from "./routes/adminRoutes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    })
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(mongoSanitize());
  if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

  const authLimiter = rateLimit({
    windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many attempts, please try again later" },
  });

  app.get("/api/health", (_req, res) => res.json({ success: true, message: "OK" }));

  app.use("/api/auth", authLimiter, authRoutes);
  app.use("/api/questions", questionRoutes);
  app.use("/api/tests", testRoutes);
  app.use("/api/attempts", attemptRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/bookmarks", bookmarkRoutes);
  app.use("/api/admin", adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
