import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import csrf from "csurf";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
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

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── CHANGED: Resolve public dir relative to BACKEND/ (one level up from src/) ─
// app.js lives at BACKEND/src/app.js → __dirname = BACKEND/src/
// The built frontend is copied to  BACKEND/public/
// So we go one level up: path.join(__dirname, '..', 'public')
const PUBLIC_DIR = path.join(__dirname, "..", "public");

const app = express();
const server = createServer(app);

// ─── HTTPS Redirect (Production) ─────────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(`https://${req.header('host')}${req.url}`);
        } else {
            next();
        }
    });
}

// ─── Security Headers ─────────────────────────────────────────────────────────
const isDevelopment = process.env.NODE_ENV === "development";

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'", 
                "'unsafe-inline'",
                "https://unpkg.com",
                "https://*.leafletjs.com"
            ],
            styleSrc: [
                "'self'", 
                "'unsafe-inline'",
                "https://fonts.googleapis.com",
                "https://unpkg.com",
                "https://*.leafletjs.com"
            ],
            imgSrc: [
                "'self'", 
                "data:", 
                "https://res.cloudinary.com",
                "https://unpkg.com",
                "https://*.leafletjs.com",
                "https://*.tile.openstreetmap.org"
            ],
            connectSrc: [
                "'self'", 
                "wss://*.onrender.com", 
                "https://*.onrender.com",
                "https://unpkg.com",
                ...(isDevelopment ? ["http://localhost:3000", "http://localhost:5173", "ws://localhost:5173", "ws://127.0.0.1:5173"] : [])
            ],
            fontSrc: [
                "'self'", 
                "data:",
                "https://fonts.gstatic.com"
            ],
            mediaSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameSrc: ["'none'"],
            workerSrc: ["'self'", "blob:"]
        }
    },
    crossOriginEmbedderPolicy: false, // Required to allow loading cross-origin images/fonts (like maps and google fonts)
}));

// ─── Socket.IO Setup ──────────────────────────────────────────────────────────
const io = new Server(server, {
    cors: {
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl)
            if (!origin) return callback(null, true);
            
            // Allow localhost for development
            if (/^https?:\/\/localhost:\d+$/.test(origin) || origin === 'http://127.0.0.1:5500' || origin === 'http://127.0.0.1:3000' || origin === 'http://127.0.0.1:5173') {
                return callback(null, true);
            }
            
            // Allow all Render domains securely
            if (/^https:\/\/[a-zA-Z0-9-]+\.onrender\.com$/.test(origin)) {
                return callback(null, true);
            }
            
            // Allow specific origins (keep existing)
            const allowedOrigins = [
                "http://127.0.0.1:5500",
                "http://localhost:5500",
                "http://127.0.0.1:3000",
                "http://localhost:3000",
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "https://adak08.github.io"
            ];
            
            if (allowedOrigins.indexOf(origin) !== -1) {
                return callback(null, true);
            }
            
            callback(new Error('Not allowed by CORS'));
        },
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000
});

// Make io available globally
global.io = io;

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        // Allow localhost for development
        if (/^https?:\/\/localhost:\d+$/.test(origin) || origin === 'http://127.0.0.1:5500' || origin === 'http://127.0.0.1:3000' || origin === 'http://127.0.0.1:5173') {
            return callback(null, true);
        }
        
        // Allow all Render domains securely
        if (/^https:\/\/[a-zA-Z0-9-]+\.onrender\.com$/.test(origin)) {
            return callback(null, true);
        }
        
        // Allow specific origins
        const allowedOrigins = [
            "http://127.0.0.1:5500",
            "http://localhost:5500",
            "http://127.0.0.1:3000",
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "https://adak08.github.io"
        ];
        
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = "The CORS policy for this site does not allow access from the specified Origin.";
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"]
}));

app.options(/.*/, cors());

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cookieParser());

// ─── JSON Body Parsers ──────────────────────────────────────────────────────
app.use("/api/upload", express.json({ limit: "10mb" }));
app.use("/api/users", express.json({ limit: "1mb" }));
app.use("/api/complaints", express.json({ limit: "2mb" }));
app.use(express.json({ limit: "2mb" })); // Default for other routes
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// ─── CSRF Protection ──────────────────────────────────────────────────────────
const csrfProtection = csrf({ 
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" || process.env.FORCE_HTTPS === "true",
        sameSite: "strict"
    } 
});

// CSRF token endpoint (public)
app.get("/api/csrf-token", csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Apply CSRF protection to all non-GET routes
app.use((req, res, next) => {
    if (req.method === 'GET' || req.method === 'OPTIONS') {
        return next();
    }
    return csrfProtection(req, res, next);
});

// ─── Rate Limiting ──────────────────────────────────────────────────────────
app.use(generalLimiter);

// ─── Debug Route ──────────────────────────────────────────────────────────────
app.get("/api/debug/routes", (req, res) => {
    res.json({
        message: "Server is running",
        environment: process.env.NODE_ENV,
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

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
    res.json({ 
        status: "ok", 
        message: "Server is running healthy",
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// ─── Serve Frontend Static Files ────────────────────────────────────────────
// CHANGED: Use PUBLIC_DIR (BACKEND/public/) instead of __dirname/public (which
// would have incorrectly resolved to BACKEND/src/public/).
app.use(express.static(PUBLIC_DIR));

// All non-API routes go to index.html (for React Router SPA)
// CHANGED: Uses PUBLIC_DIR for the correct path.
app.get(/.*/, (req, res) => {
    // Skip API routes — return 404 JSON instead of the SPA shell
    if (req.path.startsWith("/api/")) {
        return res.status(404).json({ 
            success: false,
            message: "API endpoint not found" 
        });
    }
    res.sendFile(path.join(PUBLIC_DIR, "index.html"));
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

    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({
            success: false,
            message: "Invalid or missing CSRF token. Please refresh the page."
        });
    }

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