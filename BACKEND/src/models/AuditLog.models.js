import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
        required: true,
        index: true
    },
    actorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    actorModel: {
        type: String,
        enum: ["User", "Staff", "Admin"],
        required: true
    },
    action: {
        type: String,
        required: true
        // e.g. "complaint.created", "complaint.assigned", "complaint.status_changed",
        //      "complaint.rejected", "staff.registered", "user.joined_workspace"
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId
    },
    targetModel: {
        type: String
        // e.g. "UserComplaint", "Staff", "User"
    },
    metadata: {
        type: Object  // any extra details like { oldStatus: "pending", newStatus: "in-progress" }
    },
    ip: {
        type: String
    },
    userAgent: {
        type: String
    }
}, { timestamps: true });

auditLogSchema.index({ workspaceId: 1, createdAt: -1 });
auditLogSchema.index({ workspaceId: 1, actorId: 1 });
auditLogSchema.index({ workspaceId: 1, targetId: 1 });

export default mongoose.model("AuditLog", auditLogSchema);