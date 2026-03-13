import express from "express";
import {
    handleGetStaffComplaints,
    handleUpdateStaffComplaint,
    handleGetStaffStats,
    getAdminsIdForStaff
} from "../controllers/staff_issue.controllers.js";
import { staffAuth } from "../middleware/staffAuth.js";
import { workspaceResolver } from "../middleware/workspaceAuth.js";
import { getComplaintChat, sendComplaintChat } from "../controllers/staff_chat.controllers.js";

const router = express.Router();

// All staff issue routes require staffAuth + workspaceResolver
router.use(staffAuth, workspaceResolver);

router.get("/", handleGetStaffComplaints);
router.put("/:id", handleUpdateStaffComplaint);
router.get("/stats", handleGetStaffStats);
router.get("/:id/chat", getComplaintChat);
router.post("/:id/chat", sendComplaintChat);
router.get("/admins/list", getAdminsIdForStaff);

export default router;