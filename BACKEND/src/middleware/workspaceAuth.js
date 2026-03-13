import Workspace from "../models/Workspace.models.js";

// Apply this AFTER auth / staffAuth / adminAuth on any protected route
// It resolves the workspace from the authenticated actor and attaches req.workspaceId + req.workspace
export const workspaceResolver = async (req, res, next) => {
    try {
        // Actor could be admin, staff, or user depending on which auth ran before this
        const actor = req.admin || req.staff || req.user;

        if (!actor) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. No authenticated actor found."
            });
        }

        if (!actor.workspaceId) {
            return res.status(403).json({
                success: false,
                message: "You are not part of any workspace. Please join or create one."
            });
        }

        const workspace = await Workspace.findById(actor.workspaceId);

        if (!workspace || !workspace.isActive) {
            return res.status(403).json({
                success: false,
                message: "Workspace not found or has been deactivated."
            });
        }

        req.workspaceId = workspace._id;
        req.workspace = workspace;
        next();
    } catch (error) {
        console.error("Workspace resolver error:", error);
        res.status(500).json({
            success: false,
            message: "Server error resolving workspace."
        });
    }
};