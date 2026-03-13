import mongoose from "mongoose";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 8);

const workspaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    workspaceCode: {
        type: String,
        unique: true,
        uppercase: true,
        trim: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    logo: {
        type: String  // cloudinary url
    },
    type: {
        type: String,
        enum: ["college", "municipality", "society", "rwa", "other"],
        default: "other"
    },
    domainRestriction: {
        enabled: {
            type: Boolean,
            default: false
        },
        domains: [String]  // e.g. ["@college.edu", "@dept.org"]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    settings: {
        allowPublicComplaints: {
            type: Boolean,
            default: true
        },
        autoAssign: {
            type: Boolean,
            default: false
        },
        maxComplaintsPerUser: {
            type: Number,
            default: 10
        }
    }
}, { timestamps: true });

// Auto-generate workspaceCode before saving
workspaceSchema.pre("save", async function (next) {
    if (!this.workspaceCode) {
        let code;
        let exists = true;
        // Keep generating until we get a unique one
        while (exists) {
            code = nanoid();
            exists = await mongoose.model("Workspace").findOne({ workspaceCode: code });
        }
        this.workspaceCode = code;
    }
    next();
});

export default mongoose.model("Workspace", workspaceSchema);