import { Server } from "socket.io";
import Notification from "../models/Notification.models.js";
import User from "../models/User.models.js";
import Staff from "../models/Staff.models.js";
import Admin from "../models/Admin.models.js";
import { sendEmail } from "./email.js";
import { sendSMS } from "./sms.js";

let io;

export const initIo = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "*",
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        socket.on("register", (userId) => {
            socket.join(userId);
            console.log(`User ${userId} registered`);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });

    global.io = io;
};

const getRecipientDetails = async (userId) => {
    try {
        let recipient = await User.findById(userId).select("email phone name");
        if (recipient) return recipient;

        recipient = await Staff.findById(userId).select("email phone name");
        if (recipient) return recipient;

        recipient = await Admin.findById(userId).select("email phone name");
        return recipient;
    } catch (error) {
        console.error(`Error fetching recipient for ${userId}:`, error);
        return null;
    }
};

// workspaceId is optional — pass it when sending workspace-scoped notifications
const notificationHandler = async (userId, type, message, subject, workspaceId = null) => {
    try {
        const details = await getRecipientDetails(userId);

        if (!details) {
            console.error(`Recipient not found: ${userId}`);
            return null;
        }

        // Save notification to DB
        const notification = await Notification.create({
            userId,
            type,
            message,
            workspaceId
        });

        // Real-time push via Socket.IO
        if (global.io) {
            global.io.to(userId.toString()).emit("notification", {
                ...notification.toObject(),
                timestamp: new Date()
            });
            console.log(`✅ Real-time notification sent to ${details.name}`);
        }

        // Email first — SMS only as fallback if email fails
        try {
            await sendEmail(details.email, subject || "Notification", message);
            console.log(`✅ Email notification sent to ${details.email}`);
            // Email succeeded — do NOT send SMS
        } catch (emailErr) {
            console.error(`Email failed for ${details.email}, trying SMS fallback:`, emailErr.message);
            if (details.phone) {
                sendSMS(details.phone, `[ResolveX]: ${message}`)
                    .then(() => console.log(`✅ SMS fallback sent to ${details.phone}`))
                    .catch(smsErr => console.error(`SMS fallback also failed for ${details.phone}:`, smsErr.message));
            } else {
                console.log(`No phone number found for ${details.name} — SMS fallback skipped`);
            }
        }

        return notification;
    } catch (error) {
        console.error("Error in notificationHandler:", error);
        return null;
    }
};

export default notificationHandler;