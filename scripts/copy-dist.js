/**
 * copy-dist.js
 * Cross-platform script to copy client/dist → BACKEND/public after Vite build.
 * Works on both Windows (local dev) and Linux (Render.com deployment).
 * Uses CommonJS for maximum compatibility with the root package.json.
 */

const { cpSync, mkdirSync, rmSync, existsSync } = require("fs");
const { resolve } = require("path");

const rootDir   = resolve(__dirname, "..");
const distDir   = resolve(rootDir, "client", "dist");
const publicDir = resolve(rootDir, "BACKEND", "public");

// Ensure the dist was actually built
if (!existsSync(distDir)) {
  console.error("❌  client/dist not found — did `npm run build` succeed in /client?");
  process.exit(1);
}

// Clean old public directory, then recreate
console.log(`🗑️  Clearing ${publicDir} ...`);
if (existsSync(publicDir)) {
  rmSync(publicDir, { recursive: true, force: true });
}
mkdirSync(publicDir, { recursive: true });

// Copy
console.log(`📦  Copying client/dist → BACKEND/public ...`);
cpSync(distDir, publicDir, { recursive: true });

console.log("✅  Frontend build copied to BACKEND/public successfully!");
