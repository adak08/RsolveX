
import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../src/models/Admin.models.js";
import User from "../src/models/User.models.js";
import Staff from "../src/models/Staff.models.js";
import UserComplaint from "../src/models/UserComplaint.models.js";
import Notification from "../src/models/Notification.models.js";
import ChatMessage from "../src/models/chat.model.js";
import Workspace from "../src/models/Workspace.models.js";

dotenv.config({ path: "./.env" });

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // 1. Find the first admin — they'll own the default workspace
        const firstAdmin = await Admin.findOne({ role: "admin" });

        if (!firstAdmin) {
            console.error("❌ No admin found. Create an admin first, then run this script.");
            process.exit(1);
        }

        console.log(`✅ Found admin: ${firstAdmin.name} (${firstAdmin.email})`);

        // 2. Create the default workspace
        let defaultWorkspace = await Workspace.findOne({ adminId: firstAdmin._id });

        if (!defaultWorkspace) {
            defaultWorkspace = await Workspace.create({
                name: "Default Workspace",
                adminId: firstAdmin._id,
                description: "Migrated from pre-workspace setup",
                type: "other",
                isActive: true
            });
            console.log(`✅ Created default workspace: ${defaultWorkspace.name} (code: ${defaultWorkspace.workspaceCode})`);
        } else {
            console.log(`✅ Default workspace already exists: ${defaultWorkspace.workspaceCode}`);
        }

        const workspaceId = defaultWorkspace._id;

        // 3. Stamp all existing admins (without workspaceId)
        const adminResult = await Admin.updateMany(
            { workspaceId: { $exists: false } },
            { $set: { workspaceId } }
        );
        console.log(`✅ Updated ${adminResult.modifiedCount} admins`);

        // 4. Stamp all existing users
        const userResult = await User.updateMany(
            { workspaceId: { $exists: false } },
            { $set: { workspaceId } }
        );
        console.log(`✅ Updated ${userResult.modifiedCount} users`);

        // 5. Stamp all existing staff
        const staffResult = await Staff.updateMany(
            { workspaceId: { $exists: false } },
            { $set: { workspaceId } }
        );
        console.log(`✅ Updated ${staffResult.modifiedCount} staff`);

        // 6. Stamp all existing complaints
        const complaintResult = await UserComplaint.updateMany(
            { workspaceId: { $exists: false } },
            { $set: { workspaceId } }
        );
        console.log(`✅ Updated ${complaintResult.modifiedCount} complaints`);

        // 7. Stamp all existing notifications
        const notifResult = await Notification.updateMany(
            { workspaceId: { $exists: false } },
            { $set: { workspaceId } }
        );
        console.log(`✅ Updated ${notifResult.modifiedCount} notifications`);

        // 8. Stamp all existing chat messages
        const chatResult = await ChatMessage.updateMany(
            { workspaceId: { $exists: false } },
            { $set: { workspaceId } }
        );
        console.log(`✅ Updated ${chatResult.modifiedCount} chat messages`);

        console.log("\n🎉 Migration complete!");
        console.log(`\n📋 Default workspace code: ${defaultWorkspace.workspaceCode}`);
        console.log("Share this code with users and staff so they can join the workspace.");

    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log("✅ Disconnected from MongoDB");
    }
};

migrate();