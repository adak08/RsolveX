import express from "express";
import {
    generateAnalytics,
    getHeatmapData,
    exportAnalytics,
    getStaffPerformance
} from "../controllers/analytics.controllers.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { workspaceResolver } from "../middleware/workspaceAuth.js";

const router = express.Router();

// All analytics routes require adminAuth + workspaceResolver
router.use(adminAuth, workspaceResolver);

router.get("/", generateAnalytics);
router.get("/heatmap", getHeatmapData);
router.get("/export", exportAnalytics);
router.get("/staff-performance", getStaffPerformance);

export default router;