import Leaderboard from "../models/LeaderBoard.models.js";
import Rating from "../models/Rating.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET full workspace leaderboard
export const getLeaderboard = asyncHandler(async (req, res) => {
    const { limit = 10, page = 1 } = req.query;
    const limitNum = parseInt(limit);
    const skip = (parseInt(page) - 1) * limitNum;

    const leaderboard = await Leaderboard.find({ workspaceId: req.workspaceId })
        .populate("userId", "name profileImage")
        .sort({ points: -1 })
        .skip(skip)
        .limit(limitNum);

    const total = await Leaderboard.countDocuments({ workspaceId: req.workspaceId });

    // Attach rank position
    const ranked = leaderboard.map((entry, index) => ({
        ...entry.toObject(),
        rank: skip + index + 1
    }));

    res.status(200).json({
        success: true,
        message: "Leaderboard fetched successfully",
        data: ranked,
        pagination: {
            page: parseInt(page),
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
        }
    });
});

// GET current user's leaderboard stats
export const getMyLeaderboardStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const entry = await Leaderboard.findOne({
        workspaceId: req.workspaceId,
        userId
    }).populate("userId", "name profileImage");

    if (!entry) {
        return res.status(200).json({
            success: true,
            message: "No leaderboard entry yet. Submit a complaint to start earning points!",
            data: { points: 0, complaintsSubmitted: 0, votesGiven: 0, ratingsGiven: 0, rank: null }
        });
    }

    // Calculate rank
    const higherCount = await Leaderboard.countDocuments({
        workspaceId: req.workspaceId,
        points: { $gt: entry.points }
    });

    res.status(200).json({
        success: true,
        message: "Your leaderboard stats fetched successfully",
        data: { ...entry.toObject(), rank: higherCount + 1 }
    });
});

// GET average rating for a staff member (admin use)
export const getStaffRatings = asyncHandler(async (req, res) => {
    const { staffId } = req.params;

    const ratings = await Rating.find({
        workspaceId: req.workspaceId,
        staffId
    }).populate("userId", "name");

    if (ratings.length === 0) {
        return res.status(200).json({
            success: true,
            data: { avgScore: 0, totalRatings: 0, ratings: [] }
        });
    }

    const avgScore = (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(1);

    res.status(200).json({
        success: true,
        message: "Staff ratings fetched successfully",
        data: { avgScore: parseFloat(avgScore), totalRatings: ratings.length, ratings }
    });
});