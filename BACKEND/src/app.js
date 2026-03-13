import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

import userRoutes from "./routes/user.routes.js";
import staffRoutes from "./routes/staf.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import user_issue from "./routes/user_issue.routes.js";
import uploadRouter from "./routes/upload.routes.js";
import adminIssueRoutes from "./routes/admin_issue.routes.js";
import staffIssueRoutes from "./routes/staff_issue.routes.js";
import otpRoutes from "./routes/otp.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import workspaceRoutes from "./routes/workspace.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import ratingRoutes from "./routes/rating.routes.js";
import auditRoutes from "./routes/audit.routes.js";

import { otpLimiter, loginLimiter, generalLimiter } from "./middleware/rateLimiter.js";

const app = express();
const server = createServer(app);

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ─── Socket.IO Setup ──────────────────────────────────────────────────────────
const io = new Server(server, {
    cors: {
        origin: [
            "http://127.0.0.1:5500",
            "http://localhost:5500",
            "http://127.0.0.1:3000",
            "http://localhost:3000",
            "https://adak08.github.io",
            "https://webster-2025.onrender.com"
        ],
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ["websocket", "polling"]
});

// Make io available globally
global.io = io;

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "https://adak08.github.io"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = "The CORS policy for this site does not allow access from the specified Origin.";
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options(/.*/, cors());

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ─── General Rate Limit ───────────────────────────────────────────────────────
app.use(generalLimiter);

// ─── Debug Route ──────────────────────────────────────────────────────────────
app.get("/api/debug/routes", (req, res) => {
    res.json({
        message: "Server is running",
        routes: [
            "/api/workspace/register",
            "/api/workspace/join/user",
            "/api/workspace/join/staff",
            "/api/admin/issues",
            "/api/staff/issues",
            "/api/admin/analytics",
            "/api/leaderboard",
            "/api/ratings",
            "/api/audit"
        ]
    });
});

// ─── Auth / Upload Routes (rate limited) ─────────────────────────────────────
app.use("/api/otp", otpLimiter, otpRoutes);
app.use("/api/upload", uploadRouter);
app.use("/api/users", loginLimiter, userRoutes);
app.use("/api/staff", loginLimiter, staffRoutes);
app.use("/api/admin", loginLimiter, adminRoutes);

// ─── Workspace ────────────────────────────────────────────────────────────────
app.use("/api/workspace", workspaceRoutes);

// ─── Issue Routes ─────────────────────────────────────────────────────────────
app.use("/api/admin/issues", adminIssueRoutes);
app.use("/api/staff/issues", staffIssueRoutes);
app.use("/api/user_issues", user_issue);

// ─── Feature Routes ───────────────────────────────────────────────────────────
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin/analytics", analyticsRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/audit", auditRoutes);

app.use(express.static("public"));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running healthy" });
});

// ─── Socket.IO — JWT auth + workspace room isolation ─────────────────────────
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) {
            socket.user = null;
            return next();
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        socket.user = decoded;
        next();
    } catch (error) {
        // Don't block connection — just mark as unauthenticated
        socket.user = null;
        next();
    }
});

io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    // Join personal notification room
    socket.on("join", (userId) => {
        socket.join(userId.toString());
        console.log(`User ${userId} joined personal room`);
    });

    // Join workspace room for broadcast isolation between workspaces
    socket.on("join_workspace", (workspaceId) => {
        socket.join(`ws_${workspaceId}`);
        console.log(`Socket ${socket.id} joined workspace room: ws_${workspaceId}`);
    });

    // Auto-join workspace room if JWT had workspaceId
    if (socket.user?.workspaceId) {
        socket.join(`ws_${socket.user.workspaceId}`);
    }

    socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
    });

    socket.on("error", (error) => {
        console.error("Socket error:", error);
    });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error("Error:", err.message);

    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
            success: false,
            message: "File too large. Max 10MB allowed."
        });
    }

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Server error"
    });
});

export { app, server, io };