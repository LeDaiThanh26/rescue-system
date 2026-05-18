const express = require("express");
const cors = require("cors");
const prisma = require("./config/db");

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Backend Running" });
});

app.get("/test-db", async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Database Error" });
    }
});

// ==================== MAP ROUTES ====================

// GET /api/reports - Lấy tất cả rescue requests (reports)
app.get("/api/reports", async (req, res) => {
    try {
        const { priority, status } = req.query;

        let filters = {};
        if (status) filters.status = status;
        if (priority) filters.aiUrgency = priority;

        const requests = await prisma.rescueRequest.findMany({
            where: filters,
            orderBy: { createdAt: 'desc' },
        });

        // Transform database data to map format
        const reports = requests.map((req, idx) => ({
            id: req.id,
            fullName: req.aiContact || `Yêu cầu #${req.id}`,
            phone: req.aiContact || "N/A",
            latitude: 16.0544 + (Math.random() - 0.5) * 0.1, // Mock location
            longitude: 108.2022 + (Math.random() - 0.5) * 0.1,
            priority: req.aiUrgency === 'RED' ? 'HIGH' : req.aiUrgency === 'YELLOW' ? 'MEDIUM' : 'LOW',
            status: req.status || 'PENDING',
            description: req.rawText || "Không có mô tả",
            address: req.aiExtractedAddress?.address || "Địa chỉ không xác định",
            createdAt: req.createdAt,
        }));

        res.json(reports);
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ error: "Failed to fetch reports" });
    }
});

// GET /api/reports/:id - Lấy report theo ID
app.get("/api/reports/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const request = await prisma.rescueRequest.findUnique({
            where: { id: parseInt(id) },
        });

        if (!request) {
            return res.status(404).json({ error: "Report not found" });
        }

        const report = {
            id: request.id,
            fullName: request.aiContact || `Yêu cầu #${request.id}`,
            phone: request.aiContact || "N/A",
            latitude: 16.0544,
            longitude: 108.2022,
            priority: request.aiUrgency === 'RED' ? 'HIGH' : request.aiUrgency === 'YELLOW' ? 'MEDIUM' : 'LOW',
            status: request.status || 'PENDING',
            description: request.rawText || "Không có mô tả",
            address: request.aiExtractedAddress?.address || "Địa chỉ không xác định",
            createdAt: request.createdAt,
        };

        res.json(report);
    } catch (error) {
        console.error("Error fetching report:", error);
        res.status(500).json({ error: "Failed to fetch report" });
    }
});

// PATCH /api/reports/:id/status - Cập nhật status report
app.patch("/api/reports/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['PENDING', 'ASSIGNED', 'COMPLETED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const updated = await prisma.rescueRequest.update({
            where: { id: parseInt(id) },
            data: { status },
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        console.error("Error updating report status:", error);
        res.status(500).json({ error: "Failed to update report status" });
    }
});

// GET /api/volunteers - Lấy tất cả volunteers
app.get("/api/volunteers", async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { role: 'VOLUNTEER' },
        });

        const volunteers = users.map((user, idx) => ({
            id: user.id,
            fullName: user.fullName,
            phone: "N/A",
            latitude: 16.0544 + (Math.random() - 0.5) * 0.15,
            longitude: 108.2022 + (Math.random() - 0.5) * 0.15,
            status: 'AVAILABLE',
        }));

        res.json(volunteers);
    } catch (error) {
        console.error("Error fetching volunteers:", error);
        res.status(500).json({ error: "Failed to fetch volunteers" });
    }
});

// GET /api/volunteers/:id - Lấy volunteer theo ID
app.get("/api/volunteers/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
        });

        if (!user || user.role !== 'VOLUNTEER') {
            return res.status(404).json({ error: "Volunteer not found" });
        }

        const volunteer = {
            id: user.id,
            fullName: user.fullName,
            phone: "N/A",
            latitude: 16.0544,
            longitude: 108.2022,
            status: 'AVAILABLE',
        };

        res.json(volunteer);
    } catch (error) {
        console.error("Error fetching volunteer:", error);
        res.status(500).json({ error: "Failed to fetch volunteer" });
    }
});

// Mock data for testing — tọa độ đã xác minh theo từng quận Đà Nẵng
const mockReports = [
    {
        id: 1,
        fullName: "Nguyễn Văn An",
        phone: "0901234567",
        latitude: 16.0472,   // Hải Châu
        longitude: 108.2199,
        priority: "HIGH",
        status: "PENDING",
        description: "Nhà bị ngập sâu 1m, cần hỗ trợ khẩn cấp",
        address: "45 Trần Phú, Hải Châu, Đà Nẵng"
    },
    {
        id: 2,
        fullName: "Trần Thị Bình",
        phone: "0912345678",
        latitude: 16.1160,   // Sơn Trà
        longitude: 108.2770,
        priority: "HIGH",
        status: "PENDING",
        description: "Người già bị mắc kẹt, cần cấp cứu khẩn cấp",
        address: "12 Ngô Quyền, Sơn Trà, Đà Nẵng"
    },
    {
        id: 3,
        fullName: "Lê Văn Cường",
        phone: "0923456789",
        latitude: 16.0038,   // Ngũ Hành Sơn
        longitude: 108.2644,
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        description: "Mái nhà bị tốc hoàn toàn sau bão",
        address: "78 Lê Văn Hiến, Ngũ Hành Sơn, Đà Nẵng"
    },
    {
        id: 4,
        fullName: "Phạm Thị Dung",
        phone: "0934567890",
        latitude: 16.0673,   // Thanh Khê
        longitude: 108.1846,
        priority: "MEDIUM",
        status: "PENDING",
        description: "Cây đổ chắn đường, không thoát ra được",
        address: "33 Điện Biên Phủ, Thanh Khê, Đà Nẵng"
    },
    {
        id: 5,
        fullName: "Đinh Văn Em",
        phone: "0945678901",
        latitude: 16.1148,   // Liên Chiểu
        longitude: 108.1243,
        priority: "LOW",
        status: "COMPLETED",
        description: "Dọn dẹp vệ sinh sau bão, cần nhân lực",
        address: "201 Nguyễn Lương Bằng, Liên Chiểu, Đà Nẵng"
    }
];

// GET /api/mock/reports - Seed mock data
app.get("/api/mock/reports", (req, res) => {
    res.json(mockReports);
});

module.exports = app;