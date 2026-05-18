const MissionModel = require("../models/mission.model");
const VolunteerModel = require("../models/volunteer.model");
const sse = require("../utils/sse");

const getMyMissions = async (req, res) => {
    const volunteerId = req.user?.id || 2;

    try {
        const missions = await MissionModel.getMissionsByVolunteerId(volunteerId);

        const mapped = missions.map(m => ({
            id: m.id,
            status: m.missionStatus,
            startedAt: m.startedAt,
            incident: m.incident ? {
                id: m.incident.id,
                message: m.incident.rawMessage,
                urgency: m.incident.urgencyLevel,
                address: m.incident.aiAddress || "Chưa có địa chỉ"
            } : null
        }));

        res.json(mapped);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi server" });
    }
};

const getMissionDetail = async (req, res) => {
    const volunteerId = req.user?.id || 2;
    const { id } = req.params;

    try {
        const mission = await MissionModel.getMissionById(id, volunteerId);

        if (!mission) {
            return res.status(404).json({ error: "Không tìm thấy nhiệm vụ hoặc bạn không có quyền truy cập" });
        }

        const responseData = {
            id: mission.id,
            status: mission.missionStatus,
            assignedById: mission.assignedById, // Thêm ID người giao nhiệm vụ
            startedAt: mission.startedAt,
            completedAt: mission.completedAt,
            incident: mission.incident ? {
                id: mission.incident.id,
                message: mission.incident.rawMessage,
                urgency: mission.incident.urgencyLevel,
                location: mission.incident.geomLocation,
                address: mission.incident.aiAddress || "Chưa có địa chỉ",
                status: mission.incident.status,
                needs: mission.incident.needs,
                createdAt: mission.incident.createdAt
            } : null
        };

        res.json(responseData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi server" });
    }
};

const acceptMission = async (req, res) => {
    const volunteerId = req.user?.id || 2;
    const { id } = req.params;

    try {
        const mission = await MissionModel.getMissionById(id, volunteerId);

        if (!mission) {
            return res.status(404).json({ error: "Không tìm thấy nhiệm vụ hoặc bạn không có quyền truy cập" });
        }

        if (mission.startedAt) {
            return res.status(400).json({ error: "Nhiệm vụ này đã được nhận từ trước" });
        }

        const updatedMission = await MissionModel.acceptMission(id);

        res.json({
            message: "Nhận nhiệm vụ thành công",
            mission: {
                id: updatedMission.id,
                status: updatedMission.missionStatus,
                startedAt: updatedMission.startedAt
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi server" });
    }
};

const rejectMission = async (req, res) => {
    const volunteerId = req.user?.id || 2;
    const { id } = req.params;

    try {
        const mission = await MissionModel.getMissionById(id, volunteerId);

        if (!mission) {
            return res.status(404).json({ error: "Không tìm thấy nhiệm vụ hoặc bạn không có quyền truy cập" });
        }

        if (mission.startedAt) {
            return res.status(400).json({ error: "Không thể từ chối nhiệm vụ đã bắt đầu thực hiện" });
        }

        await MissionModel.rejectMission(id);

        res.json({ message: "Từ chối nhiệm vụ thành công. Sự cố đã được chuyển lại cho Admin phân công." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi server" });
    }
};

const updateMissionStatus = async (req, res) => {
    const volunteerId = req.user?.id || 2;
    const { id } = req.params;
    const { status } = req.body;

    if (!["EN_ROUTE", "ON_SITE", "DONE"].includes(status)) {
        return res.status(400).json({ error: "Trạng thái không hợp lệ" });
    }

    try {
        const mission = await MissionModel.getMissionById(id, volunteerId);

        if (!mission) {
            return res.status(404).json({ error: "Không tìm thấy nhiệm vụ hoặc bạn không có quyền truy cập" });
        }

        const result = await MissionModel.updateMissionStatus(id, mission.incidentId, status);
        const updatedMission = Array.isArray(result) ? result[0] : result;

        res.json({
            message: "Cập nhật trạng thái thành công",
            mission: {
                id: updatedMission.id,
                status: updatedMission.missionStatus,
                completedAt: updatedMission.completedAt
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi server" });
    }
};

const updateLocation = async (req, res) => {
    const volunteerId = req.user?.id || 2;
    const { location } = req.body;

    if (!location) {
        return res.status(400).json({ error: "Vị trí không hợp lệ" });
    }

    try {
        const updatedUser = await VolunteerModel.updateLocation(volunteerId, location);

        res.json({
            message: "Cập nhật vị trí thành công",
            location: updatedUser.currentLocation
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi server" });
    }
};

const streamMissions = (req, res) => {
    const volunteerId = req.user?.id || 2;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    res.write(`data: {"type": "CONNECTED", "message": "SSE Connection Established"}\n\n`);
    sse.addClient(volunteerId, res);
    // THÊM ĐOẠN NÀY ĐỂ TEST: Ép Node.js tự bắn data sau 5 giây
    const testInterval = setInterval(() => {
        sse.notifyVolunteer(volunteerId, { message: "Tự động ping sau mỗi 5s" });
    }, 5000);
    req.on('close', () => {
        clearInterval(testInterval); // Xoá timer khi đóng
        sse.removeClient(volunteerId);
    });
};

module.exports = {
    getMyMissions,
    getMissionDetail,
    acceptMission,
    rejectMission,
    updateMissionStatus,
    updateLocation,
    streamMissions
};
