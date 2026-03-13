import UserComplaint from "../models/UserComplaint.models.js";
import Staff from "../models/Staff.models.js";
import { createAuditLog, AUDIT_ACTIONS } from "../utils/auditLog.js";
import notificationHandler from "../utils/notificationHandler.js";

// --- 1. Fetch ALL Complaints for Admin Dashboard — workspace scoped ---
export const handleFetchAllUserIssues = async (req, res) => {
    try {
        let { status, priority, category, assignedTo, search, page = 1, limit = 10 } = req.query;
        let filter = {
            workspaceId: req.workspaceId  // Always scope to workspace
        };

        if (status) {
            let dbStatus = "";
            switch (status) {
                case "New (Triage)": dbStatus = "pending"; break;
                case "Assigned":
                case "In-Progress": dbStatus = "in-progress"; break;
                case "On Hold": dbStatus = "in-progress"; break;
                case "Resolved (Audit)": dbStatus = "resolved"; break;
                case "Rejected": dbStatus = "rejected"; break;
                default: dbStatus = status.toLowerCase();
            }
            filter.status = dbStatus;
        }

        if (priority && priority !== "all") filter.priority = priority;
        if (category && category !== "all") filter.category = category;
        if (assignedTo && assignedTo !== "all") {
            if (assignedTo === "unassigned") {
                filter.assignedTo = { $exists: false };
            } else {
                filter.assignedTo = assignedTo;
            }
        }

        // Full-text search
        if (search && search.trim()) {
            filter.$text = { $search: search.trim() };
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const [issues, total] = await Promise.all([
            UserComplaint.find(filter)
                .populate("user", "name email")
                .populate("assignedTo", "name staffId")
                .populate("department", "name")
                .populate("comments.staff", "name staffId")
                .sort({ priority: -1, createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            UserComplaint.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            message: "All user complaints fetched successfully.",
            data: issues,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error("Error fetching complaints:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching complaints."
        });
    }
};

// --- 2. Fetch Staff List — workspace scoped ---
export const handleFetchStaffList = async (req, res) => {
    try {
        const staffList = await Staff.find({ workspaceId: req.workspaceId })
            .select("name _id staffId email department")
            .populate("department", "name");

        if (staffList.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No staff members found in this workspace."
            });
        }

        res.status(200).json({
            success: true,
            message: "Staff list fetched successfully.",
            data: staffList
        });
    } catch (error) {
        console.error("Error fetching staff list:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching staff list."
        });
    }
};

// --- 3. Update / Alter Issue — workspace scoped + audit log ---
export const handleUpdateIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            status,
            priority,
            priorityMode,
            assignedTo,
            comments,
            department,
            category,
            title,
            description,
            rejectionReason
        } = req.body;

        const adminId = req.admin?._id;

        const complaint = await UserComplaint.findOne({
            _id: id,
            workspaceId: req.workspaceId  // Ensure complaint belongs to this workspace
        });

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }

        const updates = {};
        const activityLog = [];

        // 1. STATUS MANAGEMENT
        if (status && complaint.status !== status) {
            updates.status = status;
            complaint.status = status;
            activityLog.push(`Status changed to ${status}`);
        }

        // 2. PRIORITY MANAGEMENT — supports auto and manual mode
        if (priority && complaint.priority !== priority) {
            updates.priority = priority;
            complaint.priority = priority;
            // If admin explicitly sets priority, mark it as manual
            complaint.priorityMode = priorityMode || "manual";
            updates.priorityMode = complaint.priorityMode;
            activityLog.push(`Priority set to ${priority} (${complaint.priorityMode})`);
        }

        // 3. STAFF ASSIGNMENT
        if (assignedTo !== undefined) {
            complaint.assignedTo = assignedTo || null;
            updates.assignedTo = assignedTo;

            if (assignedTo) {
                activityLog.push("Assigned to staff member");
                if (complaint.status === "pending") {
                    complaint.status = "in-progress";
                    updates.status = "in-progress";
                    activityLog.push("Auto-changed status to in-progress");
                }

                // Notify assigned staff
                await notificationHandler(
                    assignedTo,
                    "info",
                    `You have been assigned a new complaint: "${complaint.title}"`,
                    "New Complaint Assigned",
                    req.workspaceId
                );
            } else {
                activityLog.push("Assignment removed");
            }
        }

        // 4. DEPARTMENT ASSIGNMENT
        if (department !== undefined) {
            complaint.department = department || null;
            updates.department = department;
            if (department) activityLog.push("Department assigned");
        }

        // 5. CATEGORY CORRECTION
        if (category && complaint.category !== category) {
            complaint.category = category;
            updates.category = category;
            activityLog.push(`Category changed to ${category}`);
        }

        // 6. TITLE/DESCRIPTION CORRECTION
        if (title && complaint.title !== title) {
            complaint.title = title;
            updates.title = title;
            activityLog.push("Title updated");
        }

        if (description && complaint.description !== description) {
            complaint.description = description;
            updates.description = description;
            activityLog.push("Description updated");
        }

        // 7. REJECTION WITH REASON
        if (status === "rejected" && rejectionReason) {
            complaint.comments.push({
                staff: adminId,
                message: `[REJECTED]: ${rejectionReason}`,
                createdAt: new Date()
            });
            activityLog.push("Complaint rejected with reason");

            // Notify the user who raised the complaint
            await notificationHandler(
                complaint.user,
                "error",
                `Your complaint "${complaint.title}" was rejected. Reason: ${rejectionReason}`,
                "Complaint Rejected",
                req.workspaceId
            );
        }

        // 8. ADMIN NOTES
        if (comments) {
            complaint.comments.push({
                staff: adminId,
                message: `[ADMIN NOTE]: ${comments}`,
                createdAt: new Date()
            });
            updates.comments = comments;
            activityLog.push("Admin note added");
        }

        // 9. NOTIFY ON RESOLUTION
        if (status === "resolved") {
            await notificationHandler(
                complaint.user,
                "success",
                `Your complaint "${complaint.title}" has been resolved!`,
                "Complaint Resolved",
                req.workspaceId
            );
        }

        complaint.updatedAt = new Date();
        await complaint.save();

        await complaint.populate("user", "name email phone");
        await complaint.populate("assignedTo", "name staffId email");
        await complaint.populate("department", "name");
        await complaint.populate("comments.staff", "name staffId");

        // Audit log
        await createAuditLog({
            workspaceId: req.workspaceId,
            actorId: adminId,
            actorModel: "Admin",
            action: AUDIT_ACTIONS.COMPLAINT_UPDATED,
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
        console.error("Error updating complaint:", error);
        res.status(500).json({
            success: false,
            message: "Error updating complaint"
        });
    }
};

// Get single complaint details — workspace scoped
export const handleGetComplaintDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const complaint = await UserComplaint.findOne({ _id: id, workspaceId: req.workspaceId })
            .populate("user", "name email phone")
            .populate("assignedTo", "name staffId email department")
            .populate("department", "name")
            .populate("comments.staff", "name staffId");

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Complaint details fetched successfully",
            data: complaint
        });
    } catch (error) {
        console.error("Error fetching complaint details:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching complaint details"
        });
    }
};

// Bulk assign complaints to staff — workspace scoped
export const handleBulkAssign = async (req, res) => {
    try {
        const { complaintIds, assignedTo } = req.body;
        const adminId = req.admin?._id;

        if (!complaintIds || !Array.isArray(complaintIds) || complaintIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide complaint IDs to assign"
            });
        }

        if (!assignedTo) {
            return res.status(400).json({
                success: false,
                message: "Please specify staff member to assign"
            });
        }

        const result = await UserComplaint.updateMany(
            {
                _id: { $in: complaintIds },
                workspaceId: req.workspaceId  // Only update complaints in this workspace
            },
            {
                $set: {
                    assignedTo,
                    status: "in-progress",
                    updatedAt: new Date()
                },
                $push: {
                    comments: {
                        staff: adminId,
                        message: "[BULK ASSIGNED]: Assigned to staff member",
                        createdAt: new Date()
                    }
                }
            }
        );

        await createAuditLog({
            workspaceId: req.workspaceId,
            actorId: adminId,
            actorModel: "Admin",
            action: AUDIT_ACTIONS.COMPLAINT_BULK_ASSIGNED,
            metadata: { complaintIds, assignedTo, count: result.modifiedCount },
            req
        });

        res.json({
            success: true,
            message: `Successfully assigned ${result.modifiedCount} complaints to staff`,
            data: {
                assignedCount: result.modifiedCount,
                assignedTo
            }
        });
    } catch (error) {
        console.error("Error in bulk assignment:", error);
        res.status(500).json({
            success: false,
            message: "Error during bulk assignment"
        });
    }
};