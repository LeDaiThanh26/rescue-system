const prisma = require("../config/db");
const { Parser } = require("json2csv");

const parseLocation = (geomLocation) => {
    let formattedLoc = "16.0544,108.2022"; 
    if (geomLocation && geomLocation.startsWith("POINT(")) {
        const parts = geomLocation.replace("POINT(", "").replace(")", "").split(" ");
        if (parts.length === 2) {
            formattedLoc = `${parts[1]},${parts[0]}`; 
        }
    } else if (geomLocation && geomLocation.includes(",")) {
        formattedLoc = geomLocation;
    }
    return formattedLoc;
};

exports.getCases = async (req, res) => {
    try {
        const { status, urgencyLevel, sortBy = "createdAt", sortOrder = "desc" } = req.query;

        const whereClause = {};
        if (status) whereClause.status = status;

        if (urgencyLevel === "Đỏ") whereClause.urgencyLevel = "CRITICAL";
        else if (urgencyLevel === "Cam") whereClause.urgencyLevel = "HIGH";
        else if (urgencyLevel === "Vàng") whereClause.urgencyLevel = "MEDIUM";
        else if (urgencyLevel === "Xanh") whereClause.urgencyLevel = "LOW";

        const incidents = await prisma.incident.findMany({
            where: whereClause,
            orderBy: { [sortBy]: sortOrder }
        });

        const formattedCases = incidents.map(item => {
            let urgencyVietnamese = "Xanh";
            if (item.urgencyLevel === "CRITICAL") urgencyVietnamese = "Đỏ";
            else if (item.urgencyLevel === "HIGH") urgencyVietnamese = "Cam";
            else if (item.urgencyLevel === "MEDIUM") urgencyVietnamese = "Vàng";
            else if (item.urgencyLevel === "LOW") urgencyVietnamese = "Xanh";

            return {
                id: item.id,
                aiAddress: item.aiAddress || "Không xác định",
                urgencyLevel: urgencyVietnamese,
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

        const incidents = await prisma.incident.findMany({ where: whereClause });

        if (incidents.length === 0) {
            return res.status(404).json({ error: "Không có dữ liệu để xuất" });
        }

        const fields = ['id', 'rawMessage', 'aiAddress', 'urgencyLevel', 'status', 'createdAt'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(incidents);

        const csvWithBOM = '\uFEFF' + csv;

        res.header('Content-Type', 'text/csv; charset=utf-8');
        res.attachment('danh-sach-case-cuu-ho.csv');

        return res.send(csvWithBOM);
    } catch (error) {
        console.error("Lỗi exportCases:", error);
        res.status(500).json({ error: "Lỗi Server" });
    }
};

exports.getCaseDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const incident = await prisma.incident.findUnique({
            where: { id: parseInt(id) },
            include: {
                missions: {
                    include: {
                        volunteer: { select: { id: true, fullName: true, currentLocation: true } }
                    }
                }
            }
        });

        if (!incident) return res.status(404).json({ error: "Không tìm thấy case" });

        const timeline = [];
        timeline.push({ status: "Tiếp nhận", time: incident.createdAt });
        
        if (incident.missions.length > 0) {
            const activeMission = incident.missions[0]; 
            timeline.push({ status: "Phân công", time: activeMission.createdAt || activeMission.startedAt || new Date() });
            
            if (activeMission.missionStatus === "ON_SITE") {
                timeline.push({ status: "Đã tiếp cận", time: new Date() }); 
            }
            if (activeMission.missionStatus === "DONE" || incident.status === "COMPLETED") {
                timeline.push({ status: "Hoàn thành", time: activeMission.completedAt || new Date() });
            }
        }

        let urgencyVietnamese = "Xanh";
        if (incident.urgencyLevel === "CRITICAL") urgencyVietnamese = "Đỏ";
        else if (incident.urgencyLevel === "HIGH") urgencyVietnamese = "Cam";
        else if (incident.urgencyLevel === "MEDIUM") urgencyVietnamese = "Vàng";
        else if (incident.urgencyLevel === "LOW") urgencyVietnamese = "Xanh";

        res.status(200).json({
            rawMessage: incident.rawMessage,
            aiData: {
                address: incident.aiAddress,
                urgency: urgencyVietnamese,
                needs: incident.needs,
                location: parseLocation(incident.geomLocation) 
            },
            status: incident.status,
            timeline: timeline,
            teamInfo: incident.missions.length > 0 ? incident.missions[0].volunteer : null
        });

    } catch (error) {
        console.error("Lỗi getCaseDetail:", error);
        res.status(500).json({ error: "Lỗi Server" });
    }
};

exports.syncFromRescueRequest = async (req, res) => {
    try {
        const pendingRequests = await prisma.rescueRequest.findMany({
            where: { status: "PENDING" }
        });

        if (pendingRequests.length === 0) {
            return res.status(200).json({ message: "Không có tin nhắn báo cáo nào mới." });
        }

        let syncedCount = 0;
        for (const request of pendingRequests) {
            try {
                const aiResponse = await fetch("http://ai-service:8000/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: request.rawText })
                });

                if (aiResponse.ok) {
                    const aiData = await aiResponse.json();

                    if (aiData.urgency !== "LOW") {
                        let geomString = null;
                        if (aiData.lat && aiData.lng) {
                            geomString = `${aiData.lat},${aiData.lng}`; 
                        }

                        await prisma.incident.create({
                            data: {
                                rawMessage: request.rawText,
                                aiAddress: aiData.address || "Không xác định",
                                urgencyLevel: aiData.urgency || "MEDIUM",
                                needs: aiData.needs || [],
                                geomLocation: geomString,
                                status: "PENDING"
                            }
                        });
                        syncedCount++;
                    }

                    await prisma.rescueRequest.update({
                        where: { id: request.id },
                        data: { status: "COMPLETED" }
                    });
                }
            } catch (err) {
                console.error(`Lỗi khi xử lý request ID ${request.id}:`, err.message);
            }
        }

        res.status(200).json({ message: `Đã chuẩn hóa và đồng bộ thành công ${syncedCount} ca sự cố.` });
    } catch (error) {
        console.error("Lỗi syncFromRescueRequest:", error);
        res.status(500).json({ error: "Lỗi Server" });
    }
};