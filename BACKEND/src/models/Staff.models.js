import mongoose from "mongoose";
import { COMPLAINT_CATEGORIES, STAFF_AVAILABILITY_STATUSES } from "../constants.js";

const staffSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    staffId: {
        type: String,
        required: true, 
        unique: true,
        trim: true
    },
    phone:{
        type:String,
        match:/^[0-9]{10}$/
    },
    password:{
        type:String,
        required:true
    },
    department:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Department"
    },
    issueCategories: [{
        type: String,
        enum: COMPLAINT_CATEGORIES
    }],
    availabilityStatus: {
        type: String,
        enum: STAFF_AVAILABILITY_STATUSES,
        default: "available"
    },
    maxActiveComplaints: {
        type: Number,
        default: 5,
        min: 1
    },
    profileImage:{
        type:String
    },
    isActive:{
        type:Boolean,
        default:true
    },
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace"
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

staffSchema.index({ workspaceId: 1 });
staffSchema.index({ workspaceId: 1, isActive: 1 });
staffSchema.index({ workspaceId: 1, availabilityStatus: 1, isActive: 1 });
staffSchema.index({ workspaceId: 1, issueCategories: 1 });

export default mongoose.model("Staff",staffSchema);