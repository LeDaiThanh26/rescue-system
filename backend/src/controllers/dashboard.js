
const prisma = require("../config/db");

const getAdminDashboardData = async (req, res) => {
    try {
        
        const [pendingRequests, pendingIncidents, assignedIncidents, completedIncidents] = await Promise.all([
            prisma.rescueRequest.count({ where: { status: 'PENDING' } }),
            prisma.incident.count({ where: { status: 'PENDING' } }),
            prisma.incident.count({ where: { status: 'ASSIGNED' } }),
            prisma.incident.count({ where: { status: 'COMPLETED' } }),
        ]);

        const totalStats = {
            total: pendingRequests + pendingIncidents + assignedIncidents + completedIncidents,
            pending: pendingRequests + pendingIncidents, 
            processing: assignedIncidents,
            completed: completedIncidents
        };

        
        const hotSpots = await prisma.hotspotCluster.findMany({
            orderBy: { totalRequests: 'desc' },
            take: 5
        });

        
        const recentFeeds = await prisma.rescueRequest.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        
        const totalVolunteers = await prisma.user.count({ where: { role: 'VOLUNTEER' } });

        const activeMissions = await prisma.mission.findMany({
            where: { missionStatus: { in: ['EN_ROUTE', 'ON_SITE'] } },
            select: { missionStatus: true }
        });

        const enRouteCount = activeMissions.filter(m => m.missionStatus === 'EN_ROUTE').length;
        const onSiteCount = activeMissions.filter(m => m.missionStatus === 'ON_SITE').length;

        const rescueTeamsStatus = {
            total: totalVolunteers,
            enRoute: enRouteCount,
            onSite: onSiteCount,
            ready: Math.max(0, totalVolunteers - (enRouteCount + onSiteCount))
        };

        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const incidentsToday = await prisma.incident.findMany({
            where: { createdAt: { gte: today } },
            select: { createdAt: true, status: true }
        });

        
        const chartData = Array.from({ length: 12 }, (_, i) => ({
            timeFrame: `${i * 2}h-${i * 2 + 2}h`,
            newCases: 0,
            resolvedCases: 0
        }));

        incidentsToday.forEach(inc => {
            const hour = inc.createdAt.getHours();
            const idx = Math.floor(hour / 2);
            if (idx >= 0 && idx < 12) {
                chartData[idx].newCases += 1;
                if (inc.status === 'COMPLETED') {
                    chartData[idx].resolvedCases += 1;
                }
            }
        });

        // Trả về toàn bộ dữ liệu gói gọn cho Dashboard
        return res.status(200).json({
            success: true,
            stats: totalStats,
            hotSpots,
            recentFeeds,
            rescueTeamsStatus,
            chartData
        });

    } catch (error) {
        console.error("Error at getAdminDashboardData:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = { getAdminDashboardData };