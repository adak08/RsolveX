import Admin from "../models/Admin.models.js";
import User from "../models/User.models.js";
import Staff from "../models/Staff.models.js";
import Workspace from "../models/Workspace.models.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createAuditLog, AUDIT_ACTIONS } from "../utils/auditLog.js";

// Admin registers and creates a workspace in one step
export const adminRegisterWithWorkspace = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        phone,
        password,
        workspaceName,
        workspaceType,
        workspaceDescription,
        domainRestrictionEnabled,
        domainRestrictionDomains  // array of strings e.g. ["@college.edu"]
    } = req.body;

    if (!name || !email || !password || !workspaceName) {
        return res.status(400).json({
            success: false,
            message: "Name, email, password, and workspace name are required."
        });
    }

    // Check if admin email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
        return res.status(400).json({
            success: false,
            message: "Email already registered."
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin without workspaceId first
    const newAdmin = await Admin.create({
        name,
        email,
        phone,
        password: hashedPassword,
        role: "admin"
    });

    // Create workspace linked to this admin
    const workspace = await Workspace.create({
        name: workspaceName,
        adminId: newAdmin._id,
        description: workspaceDescription || "",
        type: workspaceType || "other",
        domainRestriction: {
            enabled: domainRestrictionEnabled || false,
            domains: domainRestrictionDomains || []
        }
    });

    // Link workspace back to admin
    newAdmin.workspaceId = workspace._id;
    await newAdmin.save();

    // Audit log
    await createAuditLog({
        workspaceId: workspace._id,
        actorId: newAdmin._id,
        actorModel: "Admin",
        action: AUDIT_ACTIONS.WORKSPACE_CREATED,
        targetId: workspace._id,
        targetModel: "Workspace",
        metadata: { workspaceName, workspaceType },
        req
    });

    const payload = { id: newAdmin._id, role: newAdmin.role };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
        success: true,
        message: "Admin registered and workspace created successfully.",
        accessToken,
        admin: {
            _id: newAdmin._id,
            name: newAdmin.name,
            email: newAdmin.email,
            role: newAdmin.role
        },
        workspace: {
            _id: workspace._id,
            name: workspace.name,
            workspaceCode: workspace.workspaceCode,
            type: workspace.type
        }
    });
});

// User or Staff joins an existing workspace using workspaceCode
export const joinWorkspace = asyncHandler(async (req, res) => {
    const { workspaceCode } = req.body;
    const actor = req.user || req.staff;

    if (!workspaceCode) {
        return res.status(400).json({
            success: false,
            message: "Workspace code is required."
        });
    }

    const workspace = await Workspace.findOne({
        workspaceCode: workspaceCode.toUpperCase(),
        isActive: true
    });

    if (!workspace) {
        return res.status(404).json({
            success: false,
            message: "Invalid workspace code. Please check and try again."
        });
    }

    // Domain restriction check
    if (workspace.domainRestriction.enabled && actor.email) {
        const emailDomain = "@" + actor.email.split("@")[1];
        const isAllowed = workspace.domainRestriction.domains.includes(emailDomain);
        if (!isAllowed) {
            return res.status(403).json({
                success: false,
                message: `Your email domain (${emailDomain}) is not allowed in this workspace.`
            });
        }
    }

    // Check if already in a workspace
    if (actor.workspaceId) {
        return res.status(400).json({
            success: false,
            message: "You are already part of a workspace."
        });
    }

    // Set workspace on actor
    actor.workspaceId = workspace._id;
    await actor.save();

    const actorModel = req.user ? "User" : "Staff";

    await createAuditLog({
        workspaceId: workspace._id,
        actorId: actor._id,
        actorModel,
        action: req.user ? AUDIT_ACTIONS.USER_JOINED_WORKSPACE : AUDIT_ACTIONS.STAFF_JOINED_WORKSPACE,
        metadata: { workspaceCode },
        req
    });

    res.status(200).json({
        success: true,
        message: `Successfully joined workspace: ${workspace.name}`,
        workspace: {
            _id: workspace._id,
            name: workspace.name,
            workspaceCode: workspace.workspaceCode,
            type: workspace.type
        }
    });
});

// Get workspace info (admin only)
export const getWorkspaceInfo = asyncHandler(async (req, res) => {
    const workspace = await Workspace.findById(req.workspaceId)
        .populate("adminId", "name email");

    if (!workspace) {
        return res.status(404).json({
            success: false,
            message: "Workspace not found."
        });
    }

    // Count members
    const [userCount, staffCount] = await Promise.all([
        User.countDocuments({ workspaceId: req.workspaceId }),
        Staff.countDocuments({ workspaceId: req.workspaceId })
    ]);

    res.status(200).json({
        success: true,
        message: "Workspace info fetched successfully.",
        data: {
            ...workspace.toObject(),
            memberCount: { users: userCount, staff: staffCount }
        }
    });
});

// Update workspace settings (admin only)
export const updateWorkspaceSettings = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        type,
        domainRestrictionEnabled,
        domainRestrictionDomains,
        allowPublicComplaints,
        autoAssign,
        maxComplaintsPerUser
    } = req.body;

    const workspace = await Workspace.findById(req.workspaceId);
    if (!workspace) {
        return res.status(404).json({
            success: false,
            message: "Workspace not found."
        });
    }

    if (name) workspace.name = name;
    if (description !== undefined) workspace.description = description;
    if (type) workspace.type = type;

    if (domainRestrictionEnabled !== undefined) {
        workspace.domainRestriction.enabled = domainRestrictionEnabled;
    }
    if (domainRestrictionDomains) {
        workspace.domainRestriction.domains = domainRestrictionDomains;
    }

    if (allowPublicComplaints !== undefined) workspace.settings.allowPublicComplaints = allowPublicComplaints;
    if (autoAssign !== undefined) workspace.settings.autoAssign = autoAssign;
    if (maxComplaintsPerUser !== undefined) workspace.settings.maxComplaintsPerUser = maxComplaintsPerUser;

    await workspace.save();

    await createAuditLog({
        workspaceId: workspace._id,
        actorId: req.admin._id,
        actorModel: "Admin",
        action: AUDIT_ACTIONS.WORKSPACE_SETTINGS_UPDATED,
        targetId: workspace._id,
        targetModel: "Workspace",
        metadata: { changes: req.body },
        req
    });

    res.status(200).json({
        success: true,
        message: "Workspace settings updated successfully.",
        data: workspace
    });
});

// List all members of a workspace (admin only)
export const getWorkspaceMembers = asyncHandler(async (req, res) => {
    const [users, staff] = await Promise.all([
        User.find({ workspaceId: req.workspaceId }).select("name email phone role profileImage createdAt"),
        Staff.find({ workspaceId: req.workspaceId }).select("name email phone staffId department isActive profileImage createdAt")
    ]);

    res.status(200).json({
        success: true,
        message: "Workspace members fetched successfully.",
        data: { users, staff }
    });
});

// Remove a member from workspace (admin only)
export const removeWorkspaceMember = asyncHandler(async (req, res) => {
    const { id, memberType } = req.params;  // memberType: "user" or "staff"

    let member;
    if (memberType === "user") {
        member = await User.findOne({ _id: id, workspaceId: req.workspaceId });
    } else if (memberType === "staff") {
        member = await Staff.findOne({ _id: id, workspaceId: req.workspaceId });
    } else {
        return res.status(400).json({ success: false, message: "Invalid memberType. Use 'user' or 'staff'." });
    }

    if (!member) {
        return res.status(404).json({
            success: false,
            message: "Member not found in this workspace."
        });
    }

    member.workspaceId = null;
    await member.save();

    await createAuditLog({
        workspaceId: req.workspaceId,
        actorId: req.admin._id,
        actorModel: "Admin",
        action: AUDIT_ACTIONS.WORKSPACE_MEMBER_REMOVED,
        targetId: member._id,
        targetModel: memberType === "user" ? "User" : "Staff",
        metadata: { removedEmail: member.email },
        req
    });

    res.status(200).json({
        success: true,
        message: `${memberType.charAt(0).toUpperCase() + memberType.slice(1)} removed from workspace.`
    });
});