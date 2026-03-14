import rateLimit from "express-rate-limit";

// OTP requests — 5 per 15 minutes per IP
export const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many OTP requests from this IP. Please try again after 15 minutes."
    }
});

// Login attempts — 10 per 15 minutes per IP
export const loginLimiter = rateLimit({
    windowMs: 80*15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts from this IP. Please try again after 15 minutes."
    }
});

// Complaint submission — 20 per hour per IP
export const complaintLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Complaint submission limit reached. Please try again after an hour."
    }
});

// General API — 200 per 15 minutes per IP
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests from this IP. Please try again after 15 minutes."
    }
});