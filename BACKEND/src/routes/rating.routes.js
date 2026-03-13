import express from "express";
import {
    handleRateComplaint,
    handleGetComplaintRating
} from "../controllers/user_issue.controllers.js";
import { getStaffRatings } from "../controllers/leaderboard.controllers.js";
import { auth } from "../middleware/auth.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { workspaceResolver } from "../middleware/workspaceAuth.js";

const router = express.Router();

// POST /api/user_issues/:id/rate — user rates a resolved complaint
router.post("/:id/rate", auth, workspaceResolver, handleRateComplaint);

// GET /api/user_issues/:id/rating — get rating for a complaint
router.get("/:id/rating", auth, workspaceResolver, handleGetComplaintRating);

// GET /api/ratings/staff/:staffId — admin views staff ratings
router.get("/staff/:staffId", adminAuth, workspaceResolver, getStaffRatings);

export default router;