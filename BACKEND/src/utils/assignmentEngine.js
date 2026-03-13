import UserComplaint from "../models/UserComplaint.models.js";
import Staff from "../models/Staff.models.js";

// Finds the least-loaded active staff member in a workspace
// Optionally filters by category if department matching is available in future
export const getSmartAssignee = async (workspaceId, category = null) => {
    try {
        // Get all active staff in this workspace
        const staffList = await Staff.find({ workspaceId, isActive: true }).select("_id name");

        if (!staffList.length) {
            console.log("Smart assign: No active staff found in workspace", workspaceId);
            return null;
        }

        // Count non-resolved complaints per staff member in this workspace
        const workloadData = await UserComplaint.aggregate([
            {
                $match: {
                    workspaceId,
                    status: { $in: ["pending", "in-progress"] },
                    assignedTo: { $in: staffList.map(s => s._id) }
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

        // Sort staff by workload (least loaded first)
        staffList.sort((a, b) => {
            const loadA = loadMap[a._id.toString()] || 0;
            const loadB = loadMap[b._id.toString()] || 0;
            return loadA - loadB;
        });

        console.log(`Smart assign: Assigning to ${staffList[0].name} (load: ${loadMap[staffList[0]._id.toString()] || 0})`);
        return staffList[0]._id;

    } catch (error) {
        console.error("Smart assignment engine error:", error);
        return null;
    }
};