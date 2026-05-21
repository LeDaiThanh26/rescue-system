const prisma = require("../config/db");
const { Parser } = require("json2csv");




exports.getCases = async (req, res) => {
    try {
        const { status, urgencyLevel, sortBy = "createdAt", sortOrder = "desc" } = req.query;


        const whereClause = {};
        if (status) whereClause.status = status;


        if (urgencyLevel === "Đỏ") {
            whereClause.urgencyLevel = { in: ["CRITICAL", "HIGH"] };
        } else if (urgencyLevel === "Vàng") {
            whereClause.urgencyLevel = "MEDIUM";
        }


        const incidents = await prisma.incident.findMany({
            where: whereClause,
            orderBy: { [sortBy]: sortOrder }
        });


        const formattedCases = incidents.map(item => {
            return {
                id: item.id,
                aiAddress: item.aiAddress || "Không xác định",
                urgencyLevel: item.urgencyLevel,
                status: item.status,
                rawMessage: item.rawMessage,
                createdAt: item.createdAt
            };
        });

        res.status(200).json(formattedCases);
    } catch (error) {
        console.error("Lỗi getCases:", error);
        res.status(500).json({ error: "Lỗi Server" });
    }
};


exports.assignVolunteer = async (req, res) => {
    try {
        const { id } = req.params;
        const { volunteerId, adminId } = req.body;


        const mission = await prisma.mission.create({
            data: {
                incidentId: parseInt(id),
                volunteerId: parseInt(volunteerId),
                assignedById: parseInt(adminId),
                missionStatus: "EN_ROUTE",
                startedAt: new Date()
            }
        });


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


exports.exportCases = async (req, res) => {
    try {

        const { status, urgencyLevel } = req.query;
        const whereClause = {};
        if (status) whereClause.status = status;
        if (urgencyLevel) whereClause.urgencyLevel = urgencyLevel;

        const cases = await prisma.incident.findMany({ where: whereClause });

        if (cases.length === 0) {
            return res.status(404).json({ error: "Không có dữ liệu để xuất" });
        }


        const fields = ['id', 'rawMessage', 'aiAddress', 'urgencyLevel', 'status', 'createdAt'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(cases);


        res.header('Content-Type', 'text/csv');
        res.attachment('danh-sach-case-cuu-ho.csv');
        return res.send(csv);
    } catch (error) {
        console.error("Lỗi exportCases:", error);
        res.status(500).json({ error: "Lỗi xuất báo cáo" });
    }
};




exports.getCaseDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const caseDetail = await prisma.incident.findUnique({
            where: { id: parseInt(id) },
            include: {
                missions: {
                    include: {
                        volunteer: {
                            select: { id: true, fullName: true, currentLocation: true }
                        }
                    }
                }
            }
        });

        if (!caseDetail) return res.status(404).json({ error: "Không tìm thấy case" });


        const timeline = [];
        timeline.push({ status: "Tiếp nhận", time: caseDetail.createdAt });

        if (caseDetail.missions.length > 0) {
            const activeMission = caseDetail.missions[0];
            timeline.push({ status: "Phân công", time: activeMission.createdAt || activeMission.startedAt });

            if (activeMission.missionStatus === "ON_SITE") {
                timeline.push({ status: "Đã tiếp cận", time: new Date() });
            }
            if (activeMission.missionStatus === "DONE" || caseDetail.status === "COMPLETED") {
                timeline.push({ status: "Hoàn thành", time: activeMission.completedAt });
            }
        }


        res.status(200).json({
            rawMessage: caseDetail.rawMessage,
            aiData: {
                address: caseDetail.aiAddress,
                urgency: caseDetail.urgencyLevel,
                needs: caseDetail.needs,
                location: caseDetail.geomLocation
            },
            status: caseDetail.status,
            timeline: timeline,
            teamInfo: caseDetail.missions.length > 0 ? caseDetail.missions[0].volunteer : null
        });

    } catch (error) {
        console.error("Lỗi getCaseDetail:", error);
        res.status(500).json({ error: "Lỗi Server" });
    }
};