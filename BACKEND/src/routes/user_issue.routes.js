import express from "express";

import {
    handleAllIssueFetch,
    handleSingleUserIssueFetch,
    handleIssueGeneration,
    handleSingleIssueFetch,
    handleVoteCount,
    handleComplaintLocations
} from "../controllers/user_issue.controllers.js";
import { auth, optionalAuth } from "../middleware/auth.js";
import { workspaceResolver } from "../middleware/workspaceAuth.js";
import { complaintLimiter } from "../middleware/rateLimiter.js";
import { complaintValidator } from "../middleware/validators.js";

const router = express.Router();

// GET /api/user_issues — All complaints (workspace scoped, optionally public)
router.get("/", optionalAuth, workspaceResolver, handleAllIssueFetch);

// POST /api/user_issues — Create complaint (requires auth + workspace)
router.post("/", auth, workspaceResolver, complaintLimiter, complaintValidator, handleIssueGeneration);

// GET /api/user_issues/my-issues — Current user's complaints
router.get("/my-issues", auth, workspaceResolver, handleSingleUserIssueFetch);

// GET /api/user_issues/locations — Map pin data
router.get("/locations", optionalAuth, workspaceResolver, handleComplaintLocations);

// GET /api/user_issues/:id — Single complaint details
router.get("/:id", optionalAuth, workspaceResolver, handleSingleIssueFetch);

// PUT /api/user_issues/:id/vote — Vote on a complaint
router.put("/:id/vote", optionalAuth, workspaceResolver, handleVoteCount);

export default router;