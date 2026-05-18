const prisma = require("../config/db");
const { Parser } = require("json2csv");

// =========================================================================
// MỤC 5: QUẢN LÝ DANH SÁCH CASE (/admin/cases)
// =========================================================================

// 5.1 & 5.2: Bảng danh sách & Bộ lọc nâng cao (Sort & Filter)
exports.getCases = async (req, res) => {
    try {
        const { status, urgencyLevel, district, sortBy = "createdAt", sortOrder = "desc" } = req.query;

        // Xây dựng bộ lọc (Filter)
        const whereClause = {};
        if (status) whereClause.status = status;
        if (urgencyLevel) whereClause.urgencyLevel = urgencyLevel;
        if (district) {
            // Lọc theo quận/huyện dựa vào text trong địa chỉ AI trích xuất
            whereClause.aiAddress = { contains: district, mode: "insensitive" };
        }

        // Truy vấn DB có sắp xếp (Sort)
        const cases = await prisma.incident.findMany({
            where: whereClause,
            orderBy: { [sortBy]: sortOrder },
            include: {
                missions: {
                    include: { volunteer: { select: { fullName: true } } }
                }
            }
        });

        res.status(200).json(cases);
    } catch (error) {
        console.error("Lỗi getCases:", error);
        res.status(500).json({ error: "Lỗi Server" });
    }
};

// 5.3: Phân công đội cứu hộ
exports.assignVolunteer = async (req, res) => {
    try {
        const { id } = req.params; // ID của case (Incident)
        const { volunteerId, adminId } = req.body; // Lấy từ form FE

        // Tạo mission mới
        const mission = await prisma.mission.create({
            data: {
                incidentId: parseInt(id),
                volunteerId: parseInt(volunteerId),
                assignedById: parseInt(adminId), // ID của admin đang thao tác
                missionStatus: "EN_ROUTE",
                startedAt: new Date()
            }
        });

        // Cập nhật trạng thái case thành ASSIGNED
        await prisma.incident.update({
            where: { id: parseInt(id) },
            data: { status: "ASSIGNED" }
        });

        res.status(200).json({ message: "Phân công thành công", mission });
    } catch (error) {
        console.error("Lỗi assignVolunteer:", error);
        res.status(500).json({ error: "Lỗi Server" });
    }
};

// 5.4: Chỉnh sửa thủ công (Sửa sai sót của AI)
exports.updateCaseManual = async (req, res) => {
    try {
        const { id } = req.params;
        const { aiAddress, urgencyLevel, needs, geomLocation } = req.body;

        const updatedCase = await prisma.incident.update({
            where: { id: parseInt(id) },
            data: { aiAddress, urgencyLevel, needs, geomLocation }
        });

        res.status(200).json({ message: "Cập nhật thành công", updatedCase });
    } catch (error) {
        console.error("Lỗi updateCaseManual:", error);
        res.status(500).json({ error: "Lỗi Server" });
    }
};

// 5.5: Xuất báo cáo (Export CSV)
exports.exportCases = async (req, res) => {
    try {
        // Lấy lại bộ lọc từ query y như hàm getCases
        const { status, urgencyLevel } = req.query;
        const whereClause = {};
        if (status) whereClause.status = status;
        if (urgencyLevel) whereClause.urgencyLevel = urgencyLevel;

        const cases = await prisma.incident.findMany({ where: whereClause });

        if (cases.length === 0) {
            return res.status(404).json({ error: "Không có dữ liệu để xuất" });
        }

        // Cấu hình các cột xuất ra CSV
        const fields = ['id', 'rawMessage', 'aiAddress', 'urgencyLevel', 'status', 'createdAt'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(cases);

        // Trả file CSV về cho Frontend tải xuống
        res.header('Content-Type', 'text/csv');
        res.attachment('danh-sach-case-cuu-ho.csv');
        return res.send(csv);
    } catch (error) {
        console.error("Lỗi exportCases:", error);
        res.status(500).json({ error: "Lỗi xuất báo cáo" });
    }
};

// =========================================================================
// MỤC 6: CHI TIẾT CASE (/admin/cases/:id)
// =========================================================================

// Tổng hợp cả 5 module của chi tiết case vào 1 API này để FE dễ gọi
exports.getCaseDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const caseDetail = await prisma.incident.findUnique({
            where: { id: parseInt(id) },
            include: {
                // Lấy thông tin đội cứu hộ (Module: Thông tin đội phụ trách)
                missions: {
                    include: {
                        volunteer: {
                            select: { id: true, fullName: true, currentLocation: true }
                            // Lưu ý: Nếu schema User chưa có số điện thoại (SĐT), 
                            // bạn nên bổ sung 'phoneNumber' vào Schema sau này nhé.
                        }
                    }
                }
            }
        });

        if (!caseDetail) return res.status(404).json({ error: "Không tìm thấy case" });

        // Xây dựng logic cho Module: Lịch sử cập nhật trạng thái (Timeline)
        const timeline = [];
        timeline.push({ status: "Tiếp nhận", time: caseDetail.createdAt });
        
        if (caseDetail.missions.length > 0) {
            const activeMission = caseDetail.missions[0]; // Lấy mission mới nhất
            timeline.push({ status: "Phân công", time: activeMission.createdAt || activeMission.startedAt });
            
            if (activeMission.missionStatus === "ON_SITE") {
                timeline.push({ status: "Đã tiếp cận", time: new Date() }); // Hoặc lấy từ log
            }
            if (activeMission.missionStatus === "DONE" || caseDetail.status === "COMPLETED") {
                timeline.push({ status: "Hoàn thành", time: activeMission.completedAt });
            }
        }

        // Trả về dữ liệu được format sẵn cho Frontend 
        res.status(200).json({
            // Module: Text gốc & JSON AI
            rawMessage: caseDetail.rawMessage,
            aiData: {
                address: caseDetail.aiAddress,
                urgency: caseDetail.urgencyLevel,
                needs: caseDetail.needs,
                location: caseDetail.geomLocation // Module: Mini-map vị trí
            },
            status: caseDetail.status,
            timeline: timeline, // Module: Lịch sử trạng thái
            teamInfo: caseDetail.missions.length > 0 ? caseDetail.missions[0].volunteer : null // Module: Thông tin đội
        });

    } catch (error) {
        console.error("Lỗi getCaseDetail:", error);
        res.status(500).json({ error: "Lỗi Server" });
    }
};