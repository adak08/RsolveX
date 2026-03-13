import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        // The recipient ID (can be User, Staff, or Admin ObjectId)
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        workspaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace"
        },
        type: {
            type: String,
            enum: ["info", "success", "warning", "error", "update", "new_complaint", "new_message"],
            default: "info"
        },
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false }
    },
    { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ workspaceId: 1, userId: 1 });

export default mongoose.model("Notification", notificationSchema);