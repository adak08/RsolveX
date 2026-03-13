import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema({
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    points: {
        type: Number,
        default: 0
    },
    complaintsSubmitted: {
        type: Number,
        default: 0
    },
    votesGiven: {
        type: Number,
        default: 0
    },
    ratingsGiven: {
        type: Number,
        default: 0
    },
    rank: {
        type: Number
    }
}, { timestamps: true });


leaderboardSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });
// For fetching ranked lists efficiently
leaderboardSchema.index({ workspaceId: 1, points: -1 });

export default mongoose.model("Leaderboard", leaderboardSchema);