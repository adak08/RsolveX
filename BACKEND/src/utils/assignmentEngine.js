import UserComplaint from "../models/UserComplaint.models.js";
import Staff from "../models/Staff.models.js";
import { COMPLAINT_CATEGORIES } from "../constants.js";

const ACTIVE_STATUSES = ["pending", "in-progress"];
const NON_ASSIGNABLE_STATUSES = new Set(["offline", "on-leave"]);

const normalizeCategory = (category) => {
    const value = typeof category === "string" ? category.trim().toLowerCase() : "";
    return COMPLAINT_CATEGORIES.includes(value) ? value : "other";
};

const supportsCategory = (staffCategories, category) => {
    if (!Array.isArray(staffCategories) || staffCategories.length === 0) {
        return true;
    }

    if (!category) {
        return true;
    }

    return staffCategories.includes(category);
};

const getStaffScore = (staff, loadMap) => {
    const currentLoad = loadMap[staff._id.toString()] || 0;
    const maxLoad = Math.max(Number(staff.maxActiveComplaints) || 5, 1);
    const loadRatio = currentLoad / maxLoad;
    const availabilityStatus = staff.availabilityStatus || "available";

    let score = 0;

    if (availabilityStatus === "available") {
        score += 1000;
    } else if (availabilityStatus === "busy") {
        score += 500;
    }

    if (currentLoad >= maxLoad) {
        score -= 250;
    }

    score -= loadRatio * 200;
    score -= currentLoad * 10;

    return score;
};

// Finds the best staff member in a workspace using category match, availability, and workload
export const getSmartAssignee = async (workspaceId, category = null) => {
    try {
        const normalizedCategory = normalizeCategory(category);

        // Get all active staff in this workspace
        const staffList = await Staff.find({ workspaceId, isActive: true })
            .select("_id name issueCategories availabilityStatus maxActiveComplaints");

        if (!staffList.length) {
            console.log("Smart assign: No active staff found in workspace", workspaceId);
            return null;
        }

        const assignableStaff = staffList.filter(staff => !NON_ASSIGNABLE_STATUSES.has((staff.availabilityStatus || "available").toLowerCase()));
        const pool = assignableStaff.length > 0 ? assignableStaff : staffList;

        const categoryMatchedStaff = pool.filter(staff => supportsCategory(staff.issueCategories, normalizedCategory));
        const candidateStaff = categoryMatchedStaff.length > 0 ? categoryMatchedStaff : pool;

        // Count non-resolved complaints per staff member in this workspace
        const workloadData = await UserComplaint.aggregate([
            {
                $match: {
                    workspaceId,
                    status: { $in: ACTIVE_STATUSES },
                    assignedTo: { $in: candidateStaff.map(s => s._id) }
                }
            },
            {
                $group: {
                    _id: "$assignedTo",
                    activeCount: { $sum: 1 }
                }
            }
        ]);

        // Build a map of staffId -> active complaint count
        const loadMap = {};
        workloadData.forEach(item => {
            loadMap[item._id.toString()] = item.activeCount;
        });

        // Sort by category match first, then availability, then workload
        candidateStaff.sort((a, b) => {
            const scoreA = getStaffScore(a, loadMap);
            const scoreB = getStaffScore(b, loadMap);
            return scoreB - scoreA;
        });

        const selectedStaff = candidateStaff[0];
        console.log(
            `Smart assign: Assigning ${normalizedCategory} complaint to ${selectedStaff.name} ` +
            `(availability: ${selectedStaff.availabilityStatus || "available"}, load: ${loadMap[selectedStaff._id.toString()] || 0}/${selectedStaff.maxActiveComplaints || 5})`
        );
        return selectedStaff._id;

    } catch (error) {
        console.error("Smart assignment engine error:", error);
        return null;
    }
};