import jwt from "jsonwebtoken";
import Staff from "../models/Staff.models.js";

export const staffAuth = async (req, res, next) => {
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

        const staffId=decoded.id || decoded.staffId || decoded._id || decoded.userId;
        if(!staffId){
            return res.status(401).json({
                success: false,
                message: "Invalid token structure."
            });
        }
        const staff = await Staff.findById(staffId).select("-password");

        if (!staff) {
            return res.status(401).json({
                success: false,
                message: "Invalid token. Staff not found."
            });
        }

        req.staff = staff;
        next();
    } catch (error) {
        if (error?.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Session expired. Please sign in again."
            });
        }

        if (error?.name !== "JsonWebTokenError") {
            console.error("Staff auth error:", error);
        }

        res.status(401).json({
            success: false,
            message: "Unauthorized access."
        });
    }
};