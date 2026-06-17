#!/usr/bin/env bash
# build.sh — Linux / macOS build helper
# Usage: bash build.sh
set -e

echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing frontend dependencies..."
cd client
npm install

echo "🔨 Building React frontend..."
npm run build
cd ..

echo "📂 Copying dist → BACKEND/public ..."
node scripts/copy-dist.js

echo ""
echo "✅ Build complete! Run 'npm start' to start the server."
