import Admin from "../models/Admin.models.js"; 
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);

export const adminLogin=async(req,res) =>{
    try{
        const{ adminId, email, phone, password } = req.body;
        const adminIdentifier = adminId || email || phone;
        console.log("Received Admin Login Data:", req.body);
        if (!adminIdentifier || !password) {
            return res.status(400).json({ message: "Admin identifier and password are required" });
        }
        // Find admin by email or phone (using adminId for the combined identifier, like the User login)
        const admin=await Admin.findOne({
            $or:[{ email:adminIdentifier },{phone:adminIdentifier }],
        });
        if(!admin) {
            return res.status(404).json({ message: "Admin not found or Invalid Credentials" });
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }
        
        const payload={ id:admin._id,role:admin.role};
        const accessToken=jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        const refreshToken=jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
        res.cookie("refreshToken", refreshToken,{
            httpOnly: true,
            secure: process.env.NODE_ENV==="production",
            sameSite:"strict",
            maxAge: 7*24*60*60*1000, 
        });
        const adminPagePath=path.join(__dirname,"..","..","..","admin.html");
        res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken,
            admin: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                permissions: admin.permissions,
                workspaceId: admin.workspaceId
            }
});

    }
    catch(err){
        console.error("Admin Login Error",err);
        res.status(500).send("Server Error during admin login")
    }
};
