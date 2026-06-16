import PDFDocument from 'pdfkit';

const COLORS = {
    orange: '#f97316',
    blue: '#3b82f6',
    green: '#22c55e',
    red: '#ef4444',
    violet: '#8b5cf6',
    amber: '#f59e0b',
    teal: '#14b8a6',
    slate: '#64748b',
    bg: '#fff7ed',
    text: '#111827',
    muted: '#6b7280',
    border: '#e5e7eb'
};

const CATEGORY_COLORS = {
    road: COLORS.orange,
    water: COLORS.blue,
    electricity: COLORS.violet,
    sanitation: COLORS.teal,
    other: COLORS.amber
};

const PRIORITY_COLORS = {
    critical: COLORS.red,
    high: COLORS.orange,
    medium: COLORS.amber,
    low: COLORS.green
};

const STATUS_COLORS = {
    pending: COLORS.amber,
    'in-progress': COLORS.blue,
    resolved: COLORS.green,
    rejected: COLORS.red
};

const safeText = (value) => String(value ?? '').replace(/\n/g, ' ').trim();

const titleCase = (value) =>
    safeText(value)
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const drawCard = (doc, x, y, w, h, label, value, color) => {
    doc.save();
    doc.roundedRect(x, y, w, h, 14).fillAndStroke('#ffffff', COLORS.border);
    doc.roundedRect(x + 10, y + 10, 8, 8, 4).fill(color);
    doc.fillColor(COLORS.muted).fontSize(9).text(label, x + 24, y + 8, { width: w - 34 });
    doc.fillColor(COLORS.text).fontSize(18).font('Helvetica-Bold').text(String(value), x + 10, y + 28, {
        width: w - 20,
        align: 'left'
    });
    doc.restore();
};

const drawBarRow = (doc, x, y, w, label, value, maxValue, color) => {
    const barHeight = 16;
    const barWidth = Math.max(0, maxValue > 0 ? Math.round((value / maxValue) * w) : 0);
    doc.fillColor(COLORS.text).fontSize(9).font('Helvetica').text(titleCase(label), x, y - 11, { width: w });
    doc.roundedRect(x, y, w, barHeight).fill('#f3f4f6');
    doc.roundedRect(x, y, barWidth, barHeight).fill(color);
    doc.fillColor(COLORS.muted).fontSize(8).text(String(value), x + w + 6, y + 2, { width: 40 });
};

const drawMiniTrend = (doc, x, y, w, dailyData) => {
    const maxValue = Math.max(1, ...dailyData.map((d) => d.count));
    const gap = 6;
    const barWidth = dailyData.length ? Math.max(12, Math.floor((w - gap * (dailyData.length - 1)) / dailyData.length)) : w;

    dailyData.forEach((item, index) => {
        const barH = Math.max(6, Math.round((item.count / maxValue) * 90));
        const bx = x + index * (barWidth + gap);
        const by = y + 110 - barH;
        doc.roundedRect(bx, by, barWidth, barH, 4).fill(item.color);
        doc.fillColor(COLORS.muted).fontSize(7).text(item.label, bx, y + 114, {
            width: barWidth,
            align: 'center'
        });
        if (barWidth >= 20) {
            doc.fillColor(COLORS.text).fontSize(7).text(String(item.count), bx, by - 10, {
                width: barWidth,
                align: 'center'
            });
        }
    });
};

const summarizeComplaintData = (complaints) => {
    const totals = {
        total: complaints.length,
        resolved: 0,
        pending: 0,
        inProgress: 0,
        rejected: 0
    };

    const categoryStats = {};
    const priorityStats = {};
    const statusStats = {};
    const staffStats = {};
    const dailyStats = {};

    complaints.forEach((complaint) => {
        const status = complaint.status || 'pending';
        const category = complaint.category || 'other';
        const priority = complaint.priority || 'medium';
        const assignee = complaint.assignedTo?.name || 'Unassigned';

        statusStats[status] = (statusStats[status] || 0) + 1;
        categoryStats[category] = (categoryStats[category] || 0) + 1;
        priorityStats[priority] = (priorityStats[priority] || 0) + 1;
        staffStats[assignee] = (staffStats[assignee] || 0) + 1;

        if (status === 'resolved') totals.resolved += 1;
        if (status === 'pending') totals.pending += 1;
        if (status === 'in-progress') totals.inProgress += 1;
        if (status === 'rejected') totals.rejected += 1;

        const day = formatDate(complaint.createdAt);
        dailyStats[day] = (dailyStats[day] || 0) + 1;
    });

    const avgResolutionTime = complaints
        .filter((complaint) => complaint.status === 'resolved' && complaint.createdAt && complaint.updatedAt)
        .map((complaint) => (new Date(complaint.updatedAt) - new Date(complaint.createdAt)) / (24 * 60 * 60 * 1000));

    totals.resolutionRate = totals.total > 0 ? ((totals.resolved / totals.total) * 100).toFixed(1) : '0.0';
    totals.avgResolutionDays = avgResolutionTime.length > 0
        ? (avgResolutionTime.reduce((sum, value) => sum + value, 0) / avgResolutionTime.length).toFixed(1)
        : '0.0';

    const topCategories = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]);
    const topStaff = Object.entries(staffStats).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const daily = Object.entries(dailyStats).slice(-10).map(([label, count]) => ({ label, count }));

    return { totals, categoryStats, priorityStats, statusStats, topCategories, topStaff, daily };
};

export const generateCSVData = (complaints) => {
    const headers = [
        'ID', 'Title', 'Category', 'Priority', 'Status', 
        'Created Date', 'Resolved Date', 'Resolution Time (days)',
        'User', 'Assigned Staff', 'Location', 'Votes', 'Description'
    ];
    
    let csv = headers.join(',') + '\n';
    
    complaints.forEach(complaint => {
        const resolvedDate = complaint.status === 'resolved' ? 
            new Date(complaint.updatedAt).toLocaleDateString() : 'N/A';
        
        const resolutionTime = complaint.status === 'resolved' && complaint.createdAt && complaint.updatedAt ?
            Math.round((new Date(complaint.updatedAt) - new Date(complaint.createdAt)) / (24 * 60 * 60 * 1000)) : 'N/A';
        
        const location = complaint.latitude && complaint.longitude ? 
            `${complaint.latitude},${complaint.longitude}` : 'N/A';
        
        const row = [
            `"${complaint._id}"`,
            `"${(complaint.title || '').replace(/"/g, '""')}"`,
            `"${complaint.category}"`,
            `"${complaint.priority}"`,
            `"${complaint.status}"`,
            `"${new Date(complaint.createdAt).toLocaleDateString()}"`,
            `"${resolvedDate}"`,
            `"${resolutionTime}"`,
            `"${(complaint.user?.name || 'Anonymous').replace(/"/g, '""')}"`,
            `"${(complaint.assignedTo?.name || 'Unassigned').replace(/"/g, '""')}"`,
            `"${location}"`,
            `"${complaint.votes || 0}"`,
            `"${(complaint.description || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
        ];
        
        csv += row.join(',') + '\n';
    });
    
    return csv;
};

export const generatePDFReport = async (complaints) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 36 });
            const buffers = [];
            
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            const { totals, categoryStats, priorityStats, statusStats, topCategories, topStaff, daily } = summarizeComplaintData(complaints);
            const pageLeft = doc.page.margins.left;
            const pageRight = doc.page.width - doc.page.margins.right;
            const contentWidth = pageRight - pageLeft;

            // Header banner
            doc.save();
            doc.roundedRect(pageLeft, 36, contentWidth, 88, 18).fill(COLORS.bg);
            doc.fillColor(COLORS.orange).font('Helvetica-Bold').fontSize(22).text('ResolveX Analytics Report', pageLeft + 18, 56);
            doc.fillColor(COLORS.text).font('Helvetica').fontSize(10).text(`Generated ${new Date().toLocaleString('en-IN')}`, pageLeft + 18, 86);
            doc.fillColor(COLORS.muted).fontSize(9).text('Workspace-level complaint overview with visual summaries, trends, and operational signals.', pageLeft + 18, 104, { width: contentWidth - 36 });
            doc.restore();

            // Summary cards
            const cardY = 140;
            const cardGap = 8;
            const cardW = Math.floor((contentWidth - cardGap * 4) / 5);
            const cardXs = Array.from({ length: 5 }, (_, i) => pageLeft + i * (cardW + cardGap));
            drawCard(doc, cardXs[0], cardY, cardW, 64, 'Total', totals.total, COLORS.orange);
            drawCard(doc, cardXs[1], cardY, cardW, 64, 'Resolved', totals.resolved, COLORS.green);
            drawCard(doc, cardXs[2], cardY, cardW, 64, 'Pending', totals.pending, COLORS.amber);
            drawCard(doc, cardXs[3], cardY, cardW, 64, 'In Progress', totals.inProgress, COLORS.blue);
            drawCard(doc, cardXs[4], cardY, cardW, 64, 'Resolution %', `${totals.resolutionRate}%`, COLORS.violet);

            // Trend chart
            let y = 224;
            doc.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(13).text('Daily Intake Trend', pageLeft, y);
            doc.fillColor(COLORS.muted).font('Helvetica').fontSize(9).text('Last 10 recorded days in this report window', pageLeft, y + 16);
            doc.roundedRect(pageLeft, y + 34, contentWidth, 150, 14).fillAndStroke('#ffffff', COLORS.border);
            drawMiniTrend(doc, pageLeft + 12, y + 52, contentWidth - 24, daily.map((item) => ({
                ...item,
                color: COLORS.orange
            })));

            // Category breakdown
            y += 198;
            doc.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(13).text('Complaint Mix by Category', pageLeft, y);
            const halfWidth = Math.floor((contentWidth - 12) / 2);
            doc.roundedRect(pageLeft, y + 22, halfWidth, 180, 14).fillAndStroke('#ffffff', COLORS.border);
            doc.roundedRect(pageLeft + halfWidth + 12, y + 22, halfWidth, 180, 14).fillAndStroke('#ffffff', COLORS.border);

            const maxCategory = Math.max(1, ...Object.values(categoryStats));
            let catY = y + 42;
            const categoryEntries = Object.entries(categoryStats)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);
            categoryEntries.forEach(([category, count]) => {
                    drawBarRow(doc, pageLeft + 12, catY, halfWidth - 70, category, count, maxCategory, CATEGORY_COLORS[category] || COLORS.slate);
                    catY += 24;
                });

            doc.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(11).text('Priority Distribution', pageLeft + halfWidth + 24, y + 40);
            const maxPriority = Math.max(1, ...Object.values(priorityStats));
            let priY = y + 64;
            Object.entries(priorityStats)
                .sort((a, b) => b[1] - a[1])
                .forEach(([priority, count]) => {
                    drawBarRow(doc, pageLeft + halfWidth + 24, priY, halfWidth - 82, priority, count, maxPriority, PRIORITY_COLORS[priority] || COLORS.slate);
                    priY += 24;
                });

            // Status and staff insights
            y += 224;
            doc.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(13).text('Operational Snapshot', pageLeft, y);
            doc.roundedRect(pageLeft, y + 22, halfWidth, 154, 14).fillAndStroke('#ffffff', COLORS.border);
            doc.roundedRect(pageLeft + halfWidth + 12, y + 22, halfWidth, 154, 14).fillAndStroke('#ffffff', COLORS.border);

            doc.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(11).text('Status Breakdown', pageLeft + 12, y + 40);
            const maxStatus = Math.max(1, ...Object.values(statusStats));
            let statY = y + 64;
            Object.entries(statusStats)
                .sort((a, b) => b[1] - a[1])
                .forEach(([status, count]) => {
                    drawBarRow(doc, pageLeft + 12, statY, halfWidth - 70, status, count, maxStatus, STATUS_COLORS[status] || COLORS.slate);
                    statY += 22;
                });

            doc.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(11).text('Top Assigned Staff', pageLeft + halfWidth + 24, y + 40);
            let staffY = y + 64;
            topStaff.forEach(([name, count], index) => {
                doc.fillColor(COLORS.muted).font('Helvetica').fontSize(8).text(`#${index + 1}`, pageLeft + halfWidth + 24, staffY + 1, { width: 18 });
                doc.fillColor(COLORS.text).font('Helvetica').fontSize(9).text(titleCase(name), pageLeft + halfWidth + 43, staffY, { width: halfWidth - 120 });
                doc.fillColor(COLORS.orange).font('Helvetica-Bold').fontSize(9).text(String(count), pageLeft + halfWidth + 24, staffY, { width: halfWidth - 24, align: 'right' });
                staffY += 22;
            });

            // Footer insights
            doc.addPage();
            doc.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(13).text('Detailed Complaint Export', 36, 36);
            doc.fillColor(COLORS.muted).font('Helvetica').fontSize(9).text('Recent complaints included for operational follow-up.', 36, 54);

            const headers = ['Title', 'Category', 'Priority', 'Status', 'Created', 'Assigned'];
            const colWidths = [165, 72, 62, 68, 70, 112];
            let rowY = 78;

            doc.roundedRect(36, rowY, 523, 22, 8).fill(COLORS.orange);
            let x = 46;
            headers.forEach((header, index) => {
                doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8.5).text(header, x, rowY + 6, { width: colWidths[index] - 10 });
                x += colWidths[index];
            });

            rowY += 28;
            complaints.slice(0, 18).forEach((complaint, index) => {
                if (rowY > 730) {
                    doc.addPage();
                    rowY = 36;
                }

                const fill = index % 2 === 0 ? '#fff7ed' : '#ffffff';
                doc.roundedRect(36, rowY, 523, 24, 6).fillAndStroke(fill, COLORS.border);
                const values = [
                    safeText(complaint.title || 'Untitled'),
                    titleCase(complaint.category || 'other'),
                    titleCase(complaint.priority || 'medium'),
                    titleCase(complaint.status || 'pending'),
                    formatDate(complaint.createdAt),
                    safeText(complaint.assignedTo?.name || 'Unassigned')
                ];

                x = 46;
                values.forEach((value, colIndex) => {
                    const textColor = colIndex === 3 ? (STATUS_COLORS[complaint.status] || COLORS.text) : COLORS.text;
                    doc.fillColor(textColor).font('Helvetica').fontSize(7.8).text(value, x, rowY + 7, {
                        width: colWidths[colIndex] - 10,
                        ellipsis: true
                    });
                    x += colWidths[colIndex];
                });
                rowY += 28;
            });

            doc.end();
        } catch (error) {
            reject(new Error('Failed to generate PDF report: ' + error.message));
        }
    });
};