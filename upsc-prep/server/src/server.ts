import dotenv from "dotenv";
dotenv.config();

import { createApp } from "./app";
import { connectDB } from "./config/db";

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await connectDB();
    const app = createApp();
    app.listen(PORT, () => {
      console.log(`[server] listening on port ${PORT} (${process.env.NODE_ENV || "development"})`);
    });
  } catch (err) {
    console.error("[server] failed to start:", err);
    process.exit(1);
  }
}

bootstrap();
