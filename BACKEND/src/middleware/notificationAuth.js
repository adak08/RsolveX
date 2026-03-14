import jwt from "jsonwebtoken";
import User from "../models/User.models.js";
import Staff from "../models/Staff.models.js";
import Admin from "../models/Admin.models.js";

export const notificationAuth = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        const token = authHeader.replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        let actor = await User.findById(decoded.id).select("-password");
        let actorRole = "user";

        if (!actor) {
            actor = await Staff.findById(decoded.id).select("-password");
            actorRole = "staff";
        }

        if (!actor) {
            actor = await Admin.findById(decoded.id).select("-password");
            actorRole = "admin";
        }

        if (!actor) {
            return res.status(401).json({
                success: false,
                message: "Invalid token. Actor not found."
            });
        }

        req.actor = actor;
        req.actorRole = actorRole;
        next();
    } catch (error) {
        console.error("Notification auth error:", error);
        res.status(401).json({
            success: false,
            message: "Unauthorized access."
        });
    }
};
