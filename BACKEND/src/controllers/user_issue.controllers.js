import UserComplaint from "../models/UserComplaint.models.js";
import Leaderboard from "../models/Leaderboard.models.js";
import Rating from "../models/Rating.models.js";
import { getSmartAssignee } from "../utils/assignmentEngine.js";
import { createAuditLog, AUDIT_ACTIONS } from "../utils/auditLog.js";
import { classifyComplaintWithAI, calculatePriorityFromCategory } from "../utils/aiClassifier.js";

// GET all issues with workspace scope + search + pagination
export const handleAllIssueFetch = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 10 } = req.query;

        const statusMap = {
            "Open": "pending",
            "In-Progress": "in-progress",
            "Closed": ["resolved", "rejected"]
        };

        let filter = {};

        // Workspace scope — only show complaints from this workspace
        if (req.workspaceId) {
            filter.workspaceId = req.workspaceId;
        }

        if (status && status !== "All") {
            if (status === "Closed") {
                filter.status = { $in: statusMap[status] };
            } else {
                filter.status = statusMap[status];
            }
        }

        // Full-text search on title + description
        if (search && search.trim()) {
            filter.$text = { $search: search.trim() };
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const [complaints, total] = await Promise.all([
            UserComplaint.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .populate("user", "name email"),
            UserComplaint.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: complaints,
            count: complaints.length,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error("Error fetching complaints:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching complaints"
        });
    }
};

export const handleSingleUserIssueFetch = async (req, res) => {
    try {
        const filter = {
            user: req.user._id,
            workspaceId: req.workspaceId
        };

        const userIssues = await UserComplaint.find(filter).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: userIssues.length,
            data: userIssues
        });
    } catch (error) {
        console.error("Error fetching user issues:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// POST create issue — requires auth + workspaceResolver
export const handleIssueGeneration = async (req, res) => {
    try {
        const {
            title,
            description,
            location,
            category,           // frontend-selected category (may be "other")
            customOtherLabel,   // what user typed when they selected "other" e.g. "fire", "accident"
            images,
            priority: manualPriority,
            priorityMode        // "manual" or "auto"
        } = req.body;

        const userId = req.user._id;

        if (!title || !description || !location) {
            return res.status(400).json({
                success: false,
                message: "Title, description, and location are required"
            });
        }

        const frontendCategory = mapCategoryToBackend(category);

        // ─── Priority / Category Resolution ──────────────────────────────────
        let resolvedCategory = frontendCategory;
        let resolvedPriority = "medium";
        let resolvedPriorityMode = "auto";
        let aiReasoning = null;
        let aiClassified = false;

        if (priorityMode === "manual" && manualPriority) {
            // Admin/staff explicitly set priority — respect it
            resolvedPriority = manualPriority;
            resolvedPriorityMode = "manual";

        } else if (frontendCategory === "other" && (customOtherLabel || description)) {
            // User selected "other" — let AI figure out real category + priority
            console.log(`🤖 Calling AI classifier for: "${customOtherLabel || title}"`);

            const aiResult = await classifyComplaintWithAI(
                title,
                description,
                customOtherLabel || ""
            );

            resolvedCategory = aiResult.category;
            resolvedPriority = aiResult.priority;
            resolvedPriorityMode = "auto";
            aiReasoning = aiResult.reasoning;
            aiClassified = aiResult.aiClassified;

            console.log(`🤖 AI result → category: ${resolvedCategory}, priority: ${resolvedPriority}`);

        } else {
            // Non-other category — use rule-based priority
            resolvedPriority = calculatePriorityFromCategory(frontendCategory);
            resolvedPriorityMode = "auto";
        }

        const complaint = new UserComplaint({
            title,
            description,
            location: {
                address: location.address,
                latitude: location.latitude,
                longitude: location.longitude
            },
            images,
            category: resolvedCategory,
            customOtherLabel: customOtherLabel || "",
            user: userId,
            workspaceId: req.workspaceId,
            status: "pending",
            priority: resolvedPriority,
            // "ai" mode when Gemini classified it, "manual" if admin set it, "auto" for rule-based
            priorityMode: aiClassified ? "ai" : resolvedPriorityMode,
            aiClassification: {
                classified: aiClassified,
                reasoning: aiReasoning || "",
                originalInput: customOtherLabel || category || ""
            },
            // Inline comment so admins see AI reasoning directly in complaint thread
            ...(aiClassified && {
                comments: [{
                    message: `[AI CLASSIFIED]: ${aiReasoning} (user typed: "${customOtherLabel || category}")`,
                    createdAt: new Date()
                }]
            })
        });

        // Smart auto-assignment if workspace has it enabled
        if (req.workspace?.settings?.autoAssign) {
            const assigneeId = await getSmartAssignee(req.workspaceId, resolvedCategory);
            if (assigneeId) {
                complaint.assignedTo = assigneeId;
                complaint.status = "in-progress";
            }
        }

        await complaint.save();
        await complaint.populate("user", "name email");

        // Update leaderboard — add points for submitting a complaint
        await Leaderboard.findOneAndUpdate(
            { workspaceId: req.workspaceId, userId },
            { $inc: { points: 10, complaintsSubmitted: 1 } },
            { upsert: true, new: true }
        );

        await createAuditLog({
            workspaceId: req.workspaceId,
            actorId: userId,
            actorModel: "User",
            action: AUDIT_ACTIONS.COMPLAINT_CREATED,
            targetId: complaint._id,
            targetModel: "UserComplaint",
            metadata: {
                title,
                originalCategory: category,
                resolvedCategory,
                priority: resolvedPriority,
                priorityMode: resolvedPriorityMode,
                aiClassified,
                aiReasoning
            },
            req
        });

        res.status(201).json({
            success: true,
            message: "Complaint submitted successfully",
            data: complaint,
            // Give the frontend visibility into what the AI decided
            classification: {
                category: resolvedCategory,
                priority: resolvedPriority,
                priorityMode: resolvedPriorityMode,
                aiClassified,
                reasoning: aiReasoning
            }
        });
    } catch (error) {
        console.error("Error submitting complaint:", error);
        res.status(500).json({
            success: false,
            message: "Error submitting complaint"
        });
    }
};

// GET single issue — workspace scoped
export const handleSingleIssueFetch = async (req, res) => {
    try {
        const filter = { _id: req.params.id };
        if (req.workspaceId) filter.workspaceId = req.workspaceId;

        const complaint = await UserComplaint.findOne(filter)
            .populate("user", "name email");

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }

        res.json({
            success: true,
            data: complaint
        });
    } catch (error) {
        console.error("Error fetching complaint:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching complaint"
        });
    }
};

export const handleComplaintLocations = async (req, res) => {
    try {
        const filter = {
            "location.latitude": { $exists: true, $ne: null },
            "location.longitude": { $exists: true, $ne: null }
        };
        if (req.workspaceId) filter.workspaceId = req.workspaceId;

        const complaints = await UserComplaint.find(filter, {
            title: 1,
            category: 1,
            priority: 1,
            status: 1,
            "location.latitude": 1,
            "location.longitude": 1,
            "location.address": 1,
            createdAt: 1
        });

        const formatted = complaints.map(c => ({
            title: c.title,
            category: c.category,
            priority: c.priority,
            status: c.status,
            latitude: c.location?.latitude,
            longitude: c.location?.longitude,
            address: c.location?.address || "N/A",
            date: c.createdAt
        }));

        res.json({
            success: true,
            count: formatted.length,
            data: formatted
        });
    } catch (error) {
        console.error("Error fetching complaint locations:", error);
        res.status(500).json({
            success: false,
            message: "Server error fetching complaint locations"
        });
    }
};

// PUT vote on issue — workspace scoped, adds leaderboard points
export const handleVoteCount = async (req, res) => {
    try {
        const filter = { _id: req.params.id };
        if (req.workspaceId) filter.workspaceId = req.workspaceId;

        const complaint = await UserComplaint.findOne(filter);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }

        complaint.voteCount = (complaint.voteCount || 0) + 1;
        await complaint.save();

        // Leaderboard points for voting (if user is authenticated)
        if (req.user && req.workspaceId) {
            await Leaderboard.findOneAndUpdate(
                { workspaceId: req.workspaceId, userId: req.user._id },
                { $inc: { points: 2, votesGiven: 1 } },
                { upsert: true, new: true }
            );
        }

        res.json({
            success: true,
            message: "Vote added successfully",
            data: { voteCount: complaint.voteCount }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error voting on complaint"
        });
    }
};

// POST rate a resolved complaint
export const handleRateComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const { score, comment } = req.body;
        const userId = req.user._id;

        if (!score || score < 1 || score > 5) {
            return res.status(400).json({
                success: false,
                message: "Score must be between 1 and 5"
            });
        }

        const filter = { _id: id, workspaceId: req.workspaceId };
        const complaint = await UserComplaint.findOne(filter);

        if (!complaint) {
            return res.status(404).json({ success: false, message: "Complaint not found" });
        }

        if (complaint.user.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "You can only rate your own complaints" });
        }

        if (complaint.status !== "resolved") {
            return res.status(400).json({ success: false, message: "You can only rate resolved complaints" });
        }

        if (complaint.rating?.score) {
            return res.status(400).json({ success: false, message: "You have already rated this complaint" });
        }

        // Save rating on the complaint document
        complaint.rating = { score, comment, ratedAt: new Date() };
        await complaint.save();

        // Also save in Rating collection for aggregate staff-rating queries
        await Rating.create({
            workspaceId: req.workspaceId,
            complaintId: id,
            userId,
            staffId: complaint.assignedTo || null,
            score,
            comment
        });

        // Leaderboard points for giving a rating
        await Leaderboard.findOneAndUpdate(
            { workspaceId: req.workspaceId, userId },
            { $inc: { points: 3, ratingsGiven: 1 } },
            { upsert: true, new: true }
        );

        await createAuditLog({
            workspaceId: req.workspaceId,
            actorId: userId,
            actorModel: "User",
            action: AUDIT_ACTIONS.COMPLAINT_RATED,
            targetId: complaint._id,
            targetModel: "UserComplaint",
            metadata: { score, comment },
            req
        });

        res.status(201).json({
            success: true,
            message: "Rating submitted successfully",
            data: { score, comment }
        });
    } catch (error) {
        console.error("Error rating complaint:", error);
        res.status(500).json({
            success: false,
            message: "Error submitting rating"
        });
    }
};

// GET rating for a complaint
export const handleGetComplaintRating = async (req, res) => {
    try {
        const { id } = req.params;

        const complaint = await UserComplaint.findOne({
            _id: id,
            workspaceId: req.workspaceId
        }).select("rating");

        if (!complaint) {
            return res.status(404).json({ success: false, message: "Complaint not found" });
        }

        res.status(200).json({
            success: true,
            data: complaint.rating || null
        });
    } catch (error) {
        console.error("Error fetching rating:", error);
        res.status(500).json({ success: false, message: "Error fetching rating" });
    }
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function mapCategoryToBackend(frontendCategory) {
    const categoryMap = {
        "infrastructure": "road",
        "safety": "other",
        "environment": "sanitation",
        "other": "other"
    };
    return categoryMap[frontendCategory] || frontendCategory || "other";
}