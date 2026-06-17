
import express from "express";
import {
    requestOTP,
    verifyOTP,
    userSignupWithOTP,
    userLoginWithOTP,
    staffLoginWithOTP,
    adminLoginWithOTP,
    requestPasswordResetOTP,
    resetPasswordWithOTP,
    resendOTP
} from "../controllers/otp.controllers.js";
import { otpLimiter, loginLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Request OTP (for login/signup)
// api/otp/request
router.post("/request", otpLimiter, requestOTP);

// Verify OTP
router.post("/verify", verifyOTP);

// Resend OTP
router.post("/resend", otpLimiter, resendOTP);

// User Signup with OTP
router.post("/signup/user", userSignupWithOTP);

// User Login with OTP
router.post("/login/user", loginLimiter, userLoginWithOTP);

// Staff Login with OTP
router.post("/login/staff", loginLimiter, staffLoginWithOTP);

// Admin Login with OTP
router.post("/login/admin", loginLimiter, adminLoginWithOTP);

// Password Reset - Request OTP
router.post("/password-reset/request", otpLimiter, requestPasswordResetOTP);

// Password Reset - Verify and Reset
router.post("/password-reset/verify", resetPasswordWithOTP);

export default router;