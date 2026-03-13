import express from "express";
import { getLeaderboard, getMyLeaderboardStats } from "../controllers/leaderboard.controllers.js";
import { auth } from "../middleware/auth.js";
import { workspaceResolver } from "../middleware/workspaceAuth.js";

const router = express.Router();

// GET /api/leaderboard — workspace-scoped leaderboard (public within workspace)
router.get("/", auth, workspaceResolver, getLeaderboard);

// GET /api/leaderboard/me — logged-in user's rank and stats
router.get("/me", auth, workspaceResolver, getMyLeaderboardStats);

export default router;