import express from "express";
import {
    adminRegisterWithWorkspace,
    joinWorkspace,
    getWorkspaceInfo,
    updateWorkspaceSettings,
    getWorkspaceMembers,
    removeWorkspaceMember
} from "../controllers/workspace.controllers.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { auth } from "../middleware/auth.js";
import { staffAuth } from "../middleware/staffAuth.js";
import { workspaceResolver } from "../middleware/workspaceAuth.js";

const router = express.Router();

// Admin creates a workspace during registration (no prior auth needed)
router.post("/register", adminRegisterWithWorkspace);

// User joins a workspace with a code
router.post("/join/user", auth, joinWorkspace);

// Staff joins a workspace with a code
router.post("/join/staff", staffAuth, joinWorkspace);

// Admin-only workspace management
router.get("/info", adminAuth, workspaceResolver, getWorkspaceInfo);
router.put("/settings", adminAuth, workspaceResolver, updateWorkspaceSettings);
router.get("/members", adminAuth, workspaceResolver, getWorkspaceMembers);
router.delete("/member/:memberType/:id", adminAuth, workspaceResolver, removeWorkspaceMember);

export default router;