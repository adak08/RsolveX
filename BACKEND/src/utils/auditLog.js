import AuditLog from "../models/AuditLog.models.js";

// Helper to create an audit log entry — call this from controllers after important actions
export const createAuditLog = async ({
    workspaceId,
    actorId,
    actorModel,
    action,
    targetId = null,
    targetModel = null,
    metadata = {},
    req = null  // optional, pass req to capture ip and userAgent
}) => {
    try {
        await AuditLog.create({
            workspaceId,
            actorId,
            actorModel,
            action,
            targetId,
            targetModel,
            metadata,
            ip: req ? (req.ip || req.headers["x-forwarded-for"]) : null,
            userAgent: req ? req.headers["user-agent"] : null
        });
    } catch (error) {
        // Audit log failure should never break the main flow
        console.error("Audit log creation failed:", error.message);
    }
};

// Common action constants to keep things consistent across controllers
export const AUDIT_ACTIONS = {
    // Complaint actions
    COMPLAINT_CREATED: "complaint.created",
    COMPLAINT_ASSIGNED: "complaint.assigned",
    COMPLAINT_BULK_ASSIGNED: "complaint.bulk_assigned",
    COMPLAINT_STATUS_CHANGED: "complaint.status_changed",
    COMPLAINT_PRIORITY_CHANGED: "complaint.priority_changed",
    COMPLAINT_REJECTED: "complaint.rejected",
    COMPLAINT_RESOLVED: "complaint.resolved",
    COMPLAINT_VOTED: "complaint.voted",
    COMPLAINT_RATED: "complaint.rated",
    COMPLAINT_UPDATED: "complaint.updated",

    // User/Auth actions
    USER_REGISTERED: "user.registered",
    USER_JOINED_WORKSPACE: "user.joined_workspace",
    STAFF_REGISTERED: "staff.registered",
    STAFF_JOINED_WORKSPACE: "staff.joined_workspace",
    ADMIN_REGISTERED: "admin.registered",
    ADMIN_LOGIN: "admin.login",

    // Workspace actions
    WORKSPACE_CREATED: "workspace.created",
    WORKSPACE_SETTINGS_UPDATED: "workspace.settings_updated",
    WORKSPACE_MEMBER_REMOVED: "workspace.member_removed",

    // Staff actions
    STAFF_COMPLAINT_UPDATED: "staff.complaint_updated"
};