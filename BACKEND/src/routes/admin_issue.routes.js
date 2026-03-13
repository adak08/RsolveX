import express from "express";
import {
    handleFetchAllUserIssues,
    handleFetchStaffList,
    handleUpdateIssue,
    handleGetComplaintDetails,
    handleBulkAssign
} from "../controllers/admin_issue.controllers.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { workspaceResolver } from "../middleware/workspaceAuth.js";
import { getComplaintChat, sendComplaintChat } from "../controllers/admin_chat.controllers.js";

const router = express.Router();

// All admin issue routes require adminAuth + workspaceResolver
router.use(adminAuth, workspaceResolver);

router.get("/", handleFetchAllUserIssues);
router.get("/staff", handleFetchStaffList);
router.get("/:id", handleGetComplaintDetails);
router.put("/:id", handleUpdateIssue);
router.post("/bulk-assign", handleBulkAssign);
router.get("/:id/chat", getComplaintChat);
router.post("/:id/chat", sendComplaintChat);

export default router;