import UserComplaint from "../models/UserComplaint.models.js";
import Admin from "../models/Admin.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createAuditLog, AUDIT_ACTIONS } from "../utils/auditLog.js";
import notificationHandler from "../utils/notificationHandler.js";

export const handleGetStaffComplaints = async (req, res) => {
    try {
        const staffId = req.staff._id;
        const { status } = req.query;

        let filter = {
            assignedTo: staffId,
            workspaceId: req.workspaceId  // Scope to workspace
        };

        if (status && status !== "all") {
            filter.status = status;
        }

        const complaints = await UserComplaint.find(filter)
            .populate("user", "name email phone")
            .populate("assignedTo", "name staffId email")
            .populate("department", "name")
            .populate("comments.staff", "name staffId")
            .sort({
                priority: -1,  // High priority first
                createdAt: -1  // Newest first
            });

        res.status(200).json({
            success: true,
            message: "Staff complaints fetched successfully",
            data: complaints,
            count: complaints.length
        });
    } catch (error) {
        console.error("Error fetching staff complaints:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching staff complaints"
        });
    }
};

// Staff updates complaint status — workspace scoped + audit log
export const handleUpdateStaffComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, comments } = req.body;
        const staffId = req.staff._id;

        const complaint = await UserComplaint.findOne({
            _id: id,
            workspaceId: req.workspaceId  // Scope to workspace
        });

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }

        // Check if this staff is actually assigned to this complaint
        if (complaint.assignedTo.toString() !== staffId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this complaint"
            });
        }

        const updates = {};
        const activityLog = [];

        if (status && complaint.status !== status) {
            complaint.status = status;
            updates.status = status;
            activityLog.push(`Status updated to ${status}`);
        }

        if (comments) {
            complaint.comments.push({
                staff: staffId,
                message: `[STAFF UPDATE]: ${comments}`,
                createdAt: new Date()
            });
            updates.comments = comments;
            activityLog.push("Work notes added");
        }

        complaint.updatedAt = new Date();
        await complaint.save();

        // Notify user on status change
        if (status) {
            await notificationHandler(
                complaint.user,
                "update",
                `Your complaint "${complaint.title}" status was updated to: ${status}`,
                "Complaint Status Update",
                req.workspaceId
            );
        }

        await complaint.populate("user", "name email phone");
        await complaint.populate("assignedTo", "name staffId email");
        await complaint.populate("department", "name");
        await complaint.populate("comments.staff", "name staffId");

        await createAuditLog({
            workspaceId: req.workspaceId,
            actorId: staffId,
            actorModel: "Staff",
            action: AUDIT_ACTIONS.STAFF_COMPLAINT_UPDATED,
            targetId: complaint._id,
            targetModel: "UserComplaint",
            metadata: { updates, activityLog },
            req
        });

        res.json({
            success: true,
            message: "Complaint updated successfully",
            data: complaint,
            updates,
            activity: activityLog
        });
    } catch (error) {
        console.error("Error updating staff complaint:", error);
        res.status(500).json({
            success: false,
            message: "Error updating complaint"
        });
    }
};

// Get staff workload statistics — workspace scoped
export const handleGetStaffStats = async (req, res) => {
    try {
        const staffId = req.staff._id;
        const workspaceFilter = { assignedTo: staffId, workspaceId: req.workspaceId };

        const stats = await UserComplaint.aggregate([
            { $match: { assignedTo: staffId, workspaceId: req.workspaceId } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const [totalAssigned, pendingCount, inProgressCount, resolvedCount] = await Promise.all([
            UserComplaint.countDocuments(workspaceFilter),
            UserComplaint.countDocuments({ ...workspaceFilter, status: "pending" }),
            UserComplaint.countDocuments({ ...workspaceFilter, status: "in-progress" }),
            UserComplaint.countDocuments({ ...workspaceFilter, status: "resolved" })
        ]);

        res.status(200).json({
            success: true,
            message: "Staff statistics fetched successfully",
            data: {
                totalAssigned,
                byStatus: {
                    pending: pendingCount,
                    inProgress: inProgressCount,
                    resolved: resolvedCount
                },
                detailedStats: stats
            }
        });
    } catch (error) {
        console.error("Error fetching staff stats:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching staff statistics"
        });
    }
};

// Get admin ID for staff — workspace scoped
export const getAdminsIdForStaff = asyncHandler(async (req, res) => {
    try {
        console.log("🔍 Fetching admin for workspace:", req.workspaceId);

        const admin = await Admin.findOne({
            workspaceId: req.workspaceId,
            role: "admin"
        }).select("_id name email role");

        if (!admin) {
            console.log("❌ No admin found for this workspace");
            return res.status(404).json({
                success: false,
                message: "No admin found for this workspace"
            });
        }

        console.log("✅ Admin found:", admin.name);

        res.status(200).json({
            success: true,
            data: {
                adminId: admin._id.toString(),
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        console.error("❌ SERVER ERROR in getAdminsIdForStaff:", error);
        res.status(500).json({
            success: false,
            message: "Server error: " + error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
    }
});