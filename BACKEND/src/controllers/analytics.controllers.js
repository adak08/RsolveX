import UserComplaint from "../models/UserComplaint.models.js";
import Staff from "../models/Staff.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateCSVData, generatePDFReport } from "../utils/exportGenerator.js";

// Generate comprehensive analytics — workspace scoped
export const generateAnalytics = asyncHandler(async (req, res) => {
    const { period = "30", department = "all", startDate, endDate } = req.query;

    const dateFilter = calculateDateRange(period, startDate, endDate);

    let query = {
        createdAt: dateFilter,
        workspaceId: req.workspaceId
    };

    if (department !== "all") {
        query.category = department;
    }

    const complaints = await UserComplaint.find(query)
        .populate("user", "name email")
        .populate("assignedTo", "name department")
        .sort({ createdAt: -1 });

    const analytics = await generateComprehensiveAnalytics(complaints, period);

    return res.status(200).json(
        new ApiResponse(200, analytics, "Analytics data fetched successfully")
    );
});

// Get heatmap data — workspace scoped
export const getHeatmapData = asyncHandler(async (req, res) => {
    const { department = "all", period = "30" } = req.query;
    const dateFilter = calculateDateRange(period);

    let query = {
        createdAt: dateFilter,
        workspaceId: req.workspaceId,
        latitude: { $exists: true, $ne: null },
        longitude: { $exists: true, $ne: null }
    };

    if (department !== "all") {
        query.category = department;
    }

    const complaints = await UserComplaint.find(query)
        .select("latitude longitude priority category status title description createdAt votes")
        .lean();

    const heatmapData = generateHeatmapClusters(complaints);

    return res.status(200).json(
        new ApiResponse(200, {
            heatmapData,
            totalPoints: complaints.length,
            bounds: calculateMapBounds(complaints)
        }, "Heatmap data fetched successfully")
    );
});

// Export analytics — workspace scoped
export const exportAnalytics = asyncHandler(async (req, res) => {
    const { format = "csv", period = "30", department = "all" } = req.query;

    const dateFilter = calculateDateRange(period);
    let query = {
        createdAt: dateFilter,
        workspaceId: req.workspaceId
    };

    if (department !== "all") {
        query.category = department;
    }

    const complaints = await UserComplaint.find(query)
        .populate("user", "name email")
        .populate("assignedTo", "name department")
        .sort({ createdAt: -1 });

    if (format === "csv") {
        const csvData = generateCSVData(complaints);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=analytics-${Date.now()}.csv`);
        return res.send(csvData);
    } else if (format === "pdf") {
        const pdfBuffer = await generatePDFReport(complaints);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=analytics-${Date.now()}.pdf`);
        return res.send(pdfBuffer);
    } else {
        throw new ApiError(400, "Unsupported export format");
    }
});

// Staff performance analytics — workspace scoped
export const getStaffPerformance = asyncHandler(async (req, res) => {
    const staffMembers = await Staff.find({ workspaceId: req.workspaceId })
        .select("name email department position isActive createdAt");

    const performanceData = await Promise.all(
        staffMembers.map(async (staff) => {
            const assignedComplaints = await UserComplaint.find({
                assignedTo: staff._id,
                workspaceId: req.workspaceId
            });
            const resolvedComplaints = assignedComplaints.filter(c => c.status === "resolved");
            const avgResolutionTime = calculateAverageResolutionTime(resolvedComplaints);

            return {
                staffId: staff._id,
                name: staff.name,
                department: staff.department,
                totalAssigned: assignedComplaints.length,
                resolved: resolvedComplaints.length,
                resolutionRate: assignedComplaints.length > 0
                    ? (resolvedComplaints.length / assignedComplaints.length * 100).toFixed(1)
                    : 0,
                avgResolutionTime,
                performanceScore: calculatePerformanceScore(assignedComplaints, resolvedComplaints)
            };
        })
    );

    return res.status(200).json(
        new ApiResponse(200, performanceData, "Staff performance data fetched successfully")
    );
});

// ─── Helper Functions ──────────────────────────────────────────────────────────

const calculateDateRange = (period, startDate, endDate) => {
    if (startDate && endDate) {
        return { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (period === "all") return {};
    const start = new Date();
    start.setDate(start.getDate() - parseInt(period));
    return { $gte: start };
};

const generateComprehensiveAnalytics = async (complaints, period) => {
    const totalComplaints = complaints.length;
    const resolvedComplaints = complaints.filter(c => c.status === "resolved").length;
    const pendingComplaints = complaints.filter(c => c.status === "pending").length;
    const inProgressComplaints = complaints.filter(c => c.status === "in-progress").length;

    const departmentStats = complaints.reduce((acc, complaint) => {
        const dept = complaint.category || "other";
        if (!acc[dept]) acc[dept] = 0;
        acc[dept]++;
        return acc;
    }, {});

    const priorityStats = complaints.reduce((acc, complaint) => {
        const priority = complaint.priority || "medium";
        if (!acc[priority]) acc[priority] = 0;
        acc[priority]++;
        return acc;
    }, {});

    const statusStats = complaints.reduce((acc, complaint) => {
        const status = complaint.status || "pending";
        if (!acc[status]) acc[status] = 0;
        acc[status]++;
        return acc;
    }, {});

    const dailyTrends = calculateDailyTrends(complaints, period);
    const monthlyTrends = calculateMonthlyTrends(complaints);
    const resolutionMetrics = calculateResolutionMetrics(complaints);
    const geographicStats = calculateGeographicStats(complaints);

    return {
        summary: {
            totalComplaints,
            resolvedComplaints,
            pendingComplaints,
            inProgressComplaints,
            resolutionRate: totalComplaints > 0
                ? (resolvedComplaints / totalComplaints * 100).toFixed(1)
                : 0,
            avgResolutionTime: resolutionMetrics.avgResolutionTime,
            satisfactionScore: calculateSatisfactionScore(complaints)
        },
        distributions: { departments: departmentStats, priorities: priorityStats, status: statusStats },
        trends: { daily: dailyTrends, monthly: monthlyTrends },
        geographic: geographicStats,
        timestamps: { period, generatedAt: new Date().toISOString() }
    };
};

const generateHeatmapClusters = (complaints) => {
    if (complaints.length === 0) return [];
    const clusters = [];
    const clusterRadius = 0.01;
    complaints.forEach(complaint => {
        if (!complaint.latitude || !complaint.longitude) return;
        let addedToCluster = false;
        for (let cluster of clusters) {
            const distance = calculateDistance(cluster.center.lat, cluster.center.lng, complaint.latitude, complaint.longitude);
            if (distance <= clusterRadius) {
                cluster.complaints.push(complaint);
                cluster.count++;
                cluster.weight += getPriorityWeight(complaint.priority);
                cluster.center.lat = (cluster.center.lat * (cluster.count - 1) + complaint.latitude) / cluster.count;
                cluster.center.lng = (cluster.center.lng * (cluster.count - 1) + complaint.longitude) / cluster.count;
                addedToCluster = true;
                break;
            }
        }
        if (!addedToCluster) {
            clusters.push({
                center: { lat: complaint.latitude, lng: complaint.longitude },
                complaints: [complaint],
                count: 1,
                weight: getPriorityWeight(complaint.priority),
                radius: clusterRadius
            });
        }
    });
    return clusters.map(cluster => ({
        ...cluster,
        intensity: calculateClusterIntensity(cluster),
        color: getHeatmapColor(cluster.weight / cluster.count)
    }));
};

const calculateClusterIntensity = (cluster) => {
    const baseIntensity = Math.min(cluster.count / 10, 1);
    const priorityIntensity = cluster.weight / cluster.count;
    return (baseIntensity + priorityIntensity) / 2;
};

const getPriorityWeight = (priority) => {
    const weights = { high: 3, medium: 2, low: 1 };
    return weights[priority] || 1;
};

const getHeatmapColor = (intensity) => {
    if (intensity < 0.25) return "#4ade80";
    if (intensity < 0.5) return "#fbbf24";
    if (intensity < 0.75) return "#f97316";
    return "#ef4444";
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const calculateMapBounds = (complaints) => {
    if (complaints.length === 0) return null;
    const lats = complaints.map(c => c.latitude).filter(lat => lat != null);
    const lngs = complaints.map(c => c.longitude).filter(lng => lng != null);
    if (lats.length === 0 || lngs.length === 0) return null;
    return { north: Math.max(...lats), south: Math.min(...lats), east: Math.max(...lngs), west: Math.min(...lngs) };
};

const calculateDailyTrends = (complaints, period) => {
    const days = parseInt(period) || 30;
    const trends = [];
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const dayComplaints = complaints.filter(c =>
            new Date(c.createdAt).toISOString().split("T")[0] === dateStr
        );
        trends.push({
            date: dateStr,
            complaints: dayComplaints.length,
            resolved: dayComplaints.filter(c => c.status === "resolved").length
        });
    }
    return trends;
};

const calculateMonthlyTrends = (complaints) => {
    const monthlyData = {};
    complaints.forEach(complaint => {
        const date = new Date(complaint.createdAt);
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
        if (!monthlyData[monthYear]) monthlyData[monthYear] = 0;
        monthlyData[monthYear]++;
    });
    return monthlyData;
};

const calculateResolutionMetrics = (complaints) => {
    const resolvedComplaints = complaints.filter(c => c.status === "resolved");
    const resolutionTimes = resolvedComplaints.map(c =>
        (new Date(c.updatedAt) - new Date(c.createdAt)) / (1000 * 60 * 60 * 24)
    );
    const avgResolutionTime = resolutionTimes.length > 0
        ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
        : 0;
    return { avgResolutionTime: Math.round(avgResolutionTime * 100) / 100, totalResolved: resolvedComplaints.length };
};

const calculateAverageResolutionTime = (resolvedComplaints) => {
    if (resolvedComplaints.length === 0) return 0;
    const totalTime = resolvedComplaints.reduce((total, c) =>
        total + (new Date(c.updatedAt) - new Date(c.createdAt)), 0);
    return Math.round((totalTime / resolvedComplaints.length) / (1000 * 60 * 60 * 24) * 100) / 100;
};

const calculatePerformanceScore = (assignedComplaints, resolvedComplaints) => {
    if (assignedComplaints.length === 0) return 0;
    const resolutionRate = (resolvedComplaints.length / assignedComplaints.length) * 100;
    const avgResolutionTime = calculateAverageResolutionTime(resolvedComplaints);
    const resolutionScore = Math.min(resolutionRate, 100);
    const speedScore = Math.max(0, 100 - (avgResolutionTime * 10));
    return Math.round((resolutionScore * 0.7) + (speedScore * 0.3));
};

const calculateSatisfactionScore = (complaints) => {
    const resolved = complaints.filter(c => c.status === "resolved").length;
    const total = complaints.length;
    if (total === 0) return 0;
    const resolutionRate = (resolved / total) * 100;
    const resolutionMetrics = calculateResolutionMetrics(complaints);
    let score = resolutionRate;
    if (resolutionMetrics.avgResolutionTime < 7) score += 10;
    if (resolutionMetrics.avgResolutionTime > 30) score -= 15;
    return Math.min(Math.max(score, 0), 100).toFixed(1);
};

const calculateGeographicStats = (complaints) => {
    const withLocation = complaints.filter(c => c.latitude && c.longitude);
    const byArea = {};
    withLocation.forEach(complaint => {
        const areaKey = `${Math.round(complaint.latitude * 100) / 100},${Math.round(complaint.longitude * 100) / 100}`;
        if (!byArea[areaKey]) byArea[areaKey] = 0;
        byArea[areaKey]++;
    });
    return {
        totalWithLocation: withLocation.length,
        areas: byArea,
        coverage: complaints.length > 0 ? ((withLocation.length / complaints.length) * 100).toFixed(1) : "0"
    };
};