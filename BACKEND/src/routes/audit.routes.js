import express from "express";
import AuditLog from "../models/AuditLog.models.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { workspaceResolver } from "../middleware/workspaceAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

// GET /api/audit — full audit log for the workspace (admin only)
router.get("/", adminAuth, workspaceResolver, asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, action, actorModel } = req.query;
    const limitNum = parseInt(limit);
    const skip = (parseInt(page) - 1) * limitNum;

    let filter = { workspaceId: req.workspaceId };
    if (action) filter.action = action;
    if (actorModel) filter.actorModel = actorModel;

    const [logs, total] = await Promise.all([
        AuditLog.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        AuditLog.countDocuments(filter)
    ]);

    res.status(200).json({
        success: true,
        message: "Audit logs fetched successfully",
        data: logs,
        pagination: {
            page: parseInt(page),
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
        }
    });
}));

// GET /api/audit/:entityId — audit logs for a specific complaint / entity
router.get("/:entityId", adminAuth, workspaceResolver, asyncHandler(async (req, res) => {
    const { entityId } = req.params;

    const logs = await AuditLog.find({
        workspaceId: req.workspaceId,
        targetId: entityId
    }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        message: "Entity audit logs fetched successfully",
        data: logs
    });
}));

export default router;