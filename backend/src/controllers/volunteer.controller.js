const MissionService = require("../services/mission.service");
const VolunteerService = require("../services/volunteer.service");
const sse = require("../utils/sse");

const handleError = (res, error) => {
    console.error(error);
    res.status(500).json({ error: "Lỗi server" });
};

const getMyMissions = async (req, res) => {
    try {
        const missions = await MissionService.getMissionsByVolunteerId(req.user.id);
        res.json(missions.map(m => ({
            id: m.id, status: m.missionStatus, startedAt: m.startedAt,
            incident: m.incident ? { id: m.incident.id, message: m.incident.rawMessage, urgency: m.incident.urgencyLevel, address: m.incident.aiAddress || "Chưa có địa chỉ" } : null
        })));
    } catch (error) { handleError(res, error); }
};

const getMissionDetail = async (req, res) => {
    try {
        const mission = await MissionService.getMissionById(req.params.id, req.user.id);
        if (!mission) return res.status(404).json({ error: "Không tìm thấy nhiệm vụ hoặc bạn không có quyền truy cập" });
        res.json({
            id: mission.id, status: mission.missionStatus, assignedById: mission.assignedById, startedAt: mission.startedAt, completedAt: mission.completedAt,
            incident: mission.incident ? { id: mission.incident.id, message: mission.incident.rawMessage, urgency: mission.incident.urgencyLevel, location: mission.incident.geomLocation, address: mission.incident.aiAddress || "Chưa có địa chỉ", status: mission.incident.status, needs: mission.incident.needs, createdAt: mission.incident.createdAt } : null
        });
    } catch (error) { handleError(res, error); }
};

const acceptMission = async (req, res) => {
    try {
        const mission = await MissionService.getMissionById(req.params.id, req.user.id);
        if (!mission) return res.status(404).json({ error: "Không tìm thấy nhiệm vụ hoặc bạn không có quyền truy cập" });
        if (mission.startedAt) return res.status(400).json({ error: "Nhiệm vụ này đã được nhận từ trước" });
        const updatedMission = await MissionService.acceptMission(req.params.id);
        res.json({ message: "Nhận nhiệm vụ thành công", mission: { id: updatedMission.id, status: updatedMission.missionStatus, startedAt: updatedMission.startedAt } });
    } catch (error) { handleError(res, error); }
};

const rejectMission = async (req, res) => {
    try {
        const mission = await MissionService.getMissionById(req.params.id, req.user.id);
        if (!mission) return res.status(404).json({ error: "Không tìm thấy nhiệm vụ hoặc bạn không có quyền truy cập" });
        if (mission.startedAt) return res.status(400).json({ error: "Không thể từ chối nhiệm vụ đã bắt đầu thực hiện" });
        await MissionService.rejectMission(req.params.id);
        res.json({ message: "Từ chối nhiệm vụ thành công. Sự cố đã được chuyển lại cho Admin phân công." });
    } catch (error) { handleError(res, error); }
};

const updateMissionStatus = async (req, res) => {
    const { status } = req.body;
    if (!["EN_ROUTE", "ON_SITE", "DONE"].includes(status)) return res.status(400).json({ error: "Trạng thái không hợp lệ" });
    try {
        const mission = await MissionService.getMissionById(req.params.id, req.user.id);
        if (!mission) return res.status(404).json({ error: "Không tìm thấy nhiệm vụ hoặc bạn không có quyền truy cập" });
        const result = await MissionService.updateMissionStatus(req.params.id, mission.incidentId, status);
        const updatedMission = Array.isArray(result) ? result[0] : result;
        res.json({ message: "Cập nhật trạng thái thành công", mission: { id: updatedMission.id, status: updatedMission.missionStatus, completedAt: updatedMission.completedAt } });
    } catch (error) { handleError(res, error); }
};

const updateLocation = async (req, res) => {
    if (!req.body.location) return res.status(400).json({ error: "Vị trí không hợp lệ" });
    try {
        const updatedUser = await VolunteerService.updateLocation(req.user.id, req.body.location);
        res.json({ message: "Cập nhật vị trí thành công", location: updatedUser.currentLocation });
    } catch (error) { handleError(res, error); }
};

const streamMissions = (req, res) => {
    const volunteerId = req.user.id;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    res.write(`data: {"type": "CONNECTED", "message": "SSE Connection Established"}\n\n`);
    sse.addClient(volunteerId, res);
    const testInterval = setInterval(() => sse.notifyVolunteer(volunteerId, { message: "Tự động ping sau mỗi 5s" }), 5000);
    req.on('close', () => {
        clearInterval(testInterval);
        sse.removeClient(volunteerId);
    });
};

module.exports = { getMyMissions, getMissionDetail, acceptMission, rejectMission, updateMissionStatus, updateLocation, streamMissions };
