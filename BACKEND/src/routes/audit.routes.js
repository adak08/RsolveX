import express from "express";
import AuditLog from "../models/AuditLog.models.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { workspaceResolver } from "../middleware/workspaceAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Admin from "../models/Admin.models.js";
import User from "../models/User.models.js";
import Staff from "../models/Staff.models.js";
import UserComplaint from "../models/UserComplaint.models.js";
import Workspace from "../models/Workspace.models.js";

const router = express.Router();

const MODEL_LOOKUPS = {
    Admin,
    User,
    Staff,
    UserComplaint,
    Workspace
};

const NAME_FIELDS = {
    Admin: "name",
    User: "name",
    Staff: "name",
    UserComplaint: "title",
    Workspace: "name"
};

const LABEL_MAP = {
    title: "Complaint",
    originalCategory: "Original category",
    resolvedCategory: "Resolved category",
    priority: "Priority",
    priorityMode: "Priority mode",
    aiClassified: "AI classified",
    aiReasoning: "AI reasoning",
    status: "Status",
    oldStatus: "Old status",
    newStatus: "New status",
    oldPriority: "Old priority",
    newPriority: "New priority",
    workspaceName: "Workspace",
    workspaceType: "Workspace type",
    removedEmail: "Removed email",
    workspaceCode: "Workspace code",
    assignedTo: "Assigned to",
    complaintIds: "Complaints assigned",
    count: "Count",
    changes: "Changes"
};

const safeString = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
};

const titleCase = (value) =>
    String(value || "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

const resolveEntityName = async (modelName, entityId) => {
    if (!modelName || !entityId || !MODEL_LOOKUPS[modelName]) return null;
    const field = NAME_FIELDS[modelName] || "name";
    const doc = await MODEL_LOOKUPS[modelName].findById(entityId).select(field).lean();
    return doc?.[field] || null;
};

const formatMetadata = async (log) => {
    const metadata = log.metadata || {};
    const items = [];

    for (const [key, rawValue] of Object.entries(metadata)) {
        if (rawValue === null || rawValue === undefined || rawValue === "") continue;

        let value = rawValue;

        if (key === "assignedTo" || key === "actorId" || key === "targetId") {
            const entityName = await resolveEntityName(
                key === "actorId" ? log.actorModel : (key === "targetId" ? log.targetModel : "Staff"),
                rawValue
            );
            if (entityName) {
                value = entityName;
            }
        }

        if (key === "complaintIds" && Array.isArray(rawValue)) {
            value = `${rawValue.length} complaints`;
        }

        if (typeof rawValue === "object" && !Array.isArray(rawValue)) {
            const nested = Object.entries(rawValue)
                .map(([nestedKey, nestedValue]) => `${titleCase(nestedKey)}: ${safeString(nestedValue)}`)
                .join(", ");
            value = nested || safeString(rawValue);
        }

        items.push({
            key,
            label: LABEL_MAP[key] || titleCase(key),
            value: safeString(value)
        });
    }

    return items;
};

const enrichAuditLog = async (log) => {
    const actorName = await resolveEntityName(log.actorModel, log.actorId);
    const targetName = await resolveEntityName(log.targetModel, log.targetId);
    const metadata = await formatMetadata(log);

    const focus = [];
    if (targetName) focus.push(targetName);
    if (actorName) focus.push(actorName);

    return {
        ...log,
        actorName: actorName || log.actorModel,
        targetName,
        metadata,
        summary: focus.filter(Boolean).join(" • ")
    };
};

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

    const enrichedLogs = await Promise.all(logs.map(enrichAuditLog));

    res.status(200).json({
        success: true,
        message: "Audit logs fetched successfully",
        data: enrichedLogs,
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

    const enrichedLogs = await Promise.all(logs.map(enrichAuditLog));

    res.status(200).json({
        success: true,
        message: "Entity audit logs fetched successfully",
        data: enrichedLogs
    });
}));

export default router;