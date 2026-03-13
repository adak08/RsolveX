import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
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
    password:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true,
        match:/^[0-9]{10}$/
    },
    address:{
        street:String,
        city:String,
        state:String,
        pincode:String
    },
    role:{
        type:String,
        enum:["user","staff","admin"],
        default: "user"
    },
    profileImage:{
        type:String,
        default:""  //cloudinary ka url
    },
    isVerified:{
        type:Boolean,
        default:false   //email/otp verification
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

userSchema.index({ workspaceId: 1 });

export default mongoose.model("User",userSchema);