import mongoose from "mongoose";

const userComplaintSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    category:{
        type:String,
        enum:["road","water","electricity","sanitation","other"],
        required:true
    },
    status:{
        type:String,
        enum:["pending","in-progress","resolved","rejected"],
        default:"pending"
    },
    priority:{
        type:String,
        enum:["low","medium","high"],
        default:"medium"
    },
    priorityMode: {
        type: String,
        enum: ["auto", "manual"],
        default: "auto"
    },
    location:{
        latitude:Number,
        longitude:Number,
        address:String
    },
    images:[{
        type: String
    }],
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    voteCount: {
        type: Number,
        default: 0
    },
    rating: {
        score: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String,
        ratedAt: Date
    },
    department:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Department"
    },
    assignedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Staff"
    },
    comments:[
        {
            staff:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Staff"
            },
            message:String,
            createdAt:{
                type:Date,
                default:Date.now
            }
        }
    ],

    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
        required: true
    },

    createdAt:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date,
        default:Date.now
    }
});


userComplaintSchema.index({ title: "text", description: "text" });
 

userComplaintSchema.index({ workspaceId: 1, status: 1 });
userComplaintSchema.index({ workspaceId: 1, assignedTo: 1 });
userComplaintSchema.index({ workspaceId: 1, user: 1 });
userComplaintSchema.index({ workspaceId: 1, createdAt: -1 });
userComplaintSchema.index({ workspaceId: 1, priority: -1, createdAt: -1 });

export default mongoose.model("UserComplaint",userComplaintSchema);