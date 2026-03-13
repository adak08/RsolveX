import { body, param, query, validationResult } from "express-validator";

// Run this at the END of every validation chain
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array()
        });
    }
    next();
};

// Complaint creation validation
export const complaintValidator = [
    body("title")
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage("Title must be between 5 and 200 characters"),
    body("description")
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage("Description must be between 10 and 2000 characters"),
    body("category")
        .isIn(["road", "water", "electricity", "sanitation", "other"])
        .withMessage("Invalid category"),
    body("location")
        .notEmpty()
        .withMessage("Location is required"),
    validate
];

// User signup validation
export const userSignupValidator = [
    body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),
    body("email").isEmail().normalizeEmail().withMessage("Invalid email address"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("phone").matches(/^[0-9]{10}$/).withMessage("Phone must be 10 digits"),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
    validate
];

// Staff signup validation
export const staffSignupValidator = [
    body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),
    body("email").isEmail().normalizeEmail().withMessage("Invalid email address"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("staffId").trim().notEmpty().withMessage("Staff ID is required"),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
    validate
];

// Rating validation
export const ratingValidator = [
    body("score")
        .isInt({ min: 1, max: 5 })
        .withMessage("Score must be between 1 and 5"),
    body("comment")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Comment cannot exceed 500 characters"),
    validate
];

// Workspace creation validation
export const workspaceValidator = [
    body("workspaceName")
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage("Workspace name must be 3-100 characters"),
    body("workspaceType")
        .optional()
        .isIn(["college", "municipality", "society", "rwa", "other"])
        .withMessage("Invalid workspace type"),
    validate
];

// MongoDB ObjectId param validation
export const objectIdValidator = (paramName) => [
    param(paramName).isMongoId().withMessage(`Invalid ${paramName}`),
    validate
];