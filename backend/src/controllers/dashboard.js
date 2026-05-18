// backend/src/controllers/dashboard.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getAdminDashboardData = async (req, res) => {
  try {
    // 1. MODULE 1: Thẻ thống kê tổng hợp (Từ Incident & RescueRequest)
    const [pendingRequests, pendingIncidents, assignedIncidents, completedIncidents] = await Promise.all([
      prisma.rescueRequest.count({ where: { status: 'PENDING' } }),
      prisma.incident.count({ where: { status: 'PENDING' } }),
      prisma.incident.count({ where: { status: 'ASSIGNED' } }),
      prisma.incident.count({ where: { status: 'COMPLETED' } }),
    ]);

    const totalStats = {
      total: pendingRequests + pendingIncidents + assignedIncidents + completedIncidents,
      pending: pendingRequests + pendingIncidents, // Ca thô chưa xử lý + Ca duyệt đang đợi
      processing: assignedIncidents,
      completed: completedIncidents
    };

    // 2. MODULE 4: Bảng điểm nóng (Lấy từ bảng HotspotCluster do AI tính toán)
    const hotSpots = await prisma.hotspotCluster.findMany({
      orderBy: { totalRequests: 'desc' },
      take: 5
    });

    // 3. MODULE 5: Feed ca mới nhất (Lấy các RescueRequest thô vừa quét qua NLP AI)
    const recentFeeds = await prisma.rescueRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // 4. MODULE 6: Trạng thái đội cứu hộ (Thống kê số tình nguyện viên dựa trên MissionStatus)
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

    // 5. MODULE 3: Biểu đồ ca theo thời gian (Thống kê gom nhóm theo giờ trong ngày hôm nay)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const incidentsToday = await prisma.incident.findMany({
      where: { createdAt: { gte: today } },
      select: { createdAt: true, status: true }
    });

    // Gom dữ liệu theo khung 2 giờ một lần (e.g., 0-2h, 2-4h...)
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