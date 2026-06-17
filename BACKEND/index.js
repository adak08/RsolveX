/**
 * BACKEND/index.js  — Root entry point for production and development.
 *
 * The BACKEND/package.json "main" and "start"/"dev" scripts all reference
 * THIS file (not src/index.js).  It imports from src/ so that the existing
 * source structure is untouched.
 *
 * CHANGED:  Added graceful shutdown (SIGTERM / SIGINT) for Render.com.
 *           Added frontend-path log message.
 *           Imports now use relative paths from this file's location.
 */

import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./src/db/index.js";
import { server } from "./src/app.js";

// ─── Resolve paths ────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const publicPath = path.join(__dirname, "public");

const PORT = process.env.PORT || 3000;

// ─── Connect to DB, then start the HTTP + Socket.IO server ───────────────────
connectDB()
  .then(() => {
    const httpServer = server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📂 Serving frontend from: ${publicPath}`);
      console.log(`✅ Socket.IO server is running on the same port`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    });

    // ─── Graceful Shutdown (required by Render.com) ──────────────────────────
    const shutdown = (signal) => {
      console.log(`\n${signal} received — shutting down gracefully ...`);
      httpServer.close(() => {
        console.log("✅ HTTP server closed.");
        process.exit(0);
      });

      // Force-exit after 10 s if connections haven't drained
      setTimeout(() => {
        console.error("⚠️  Forcing exit after 10 s timeout.");
        process.exit(1);
      }, 10_000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT",  () => shutdown("SIGINT"));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });
