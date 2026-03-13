import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
        required: true
    },
    complaintId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserComplaint",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff"
    },
    score: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        trim: true
    }
}, { timestamps: true });

// One rating per complaint per user
ratingSchema.index({ complaintId: 1, userId: 1 }, { unique: true });
ratingSchema.index({ workspaceId: 1, staffId: 1 });

export default mongoose.model("Rating", ratingSchema);