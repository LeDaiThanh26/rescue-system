const VolunteerModel = require("../models/volunteer.model");

const getVolunteers = async (req, res) => {
    try {
        const volunteers = await VolunteerModel.getVolunteersWithMissions();

        const mapped = volunteers.map(v => {
            const activeMissions = v.missions.filter(m => ["EN_ROUTE", "ON_SITE"].includes(m.missionStatus));
            const completedMissions = v.missions.filter(m => m.missionStatus === "DONE");

            return {
                id: v.id,
                username: v.username,
                name: v.fullName,
                area: v.currentLocation || "Chưa xác định",
                status: activeMissions.length > 0 ? "busy" : "active",
                activeCases: activeMissions.length,
                completedCases: completedMissions.length,
                totalMissions: v.missions.length
            };
        });

        res.json(mapped);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi server" });
    }
};

const getVolunteer = async (req, res) => {
    const { id } = req.params;
    try {
        const volunteer = await VolunteerModel.getVolunteerById(id);

        if (!volunteer) {
            return res.status(404).json({ error: "Không tìm thấy tình nguyện viên" });
        }

        const activeMissions = volunteer.missions.filter(m => ["EN_ROUTE", "ON_SITE"].includes(m.missionStatus));
        const completedMissions = volunteer.missions.filter(m => m.missionStatus === "DONE");

        const responseData = {
            id: volunteer.id,
            username: volunteer.username,
            name: volunteer.fullName,
            area: volunteer.currentLocation || "Chưa xác định",
            status: activeMissions.length > 0 ? "busy" : "active",
            stats: {
                activeCases: activeMissions.length,
                completedCases: completedMissions.length,
                totalMissions: volunteer.missions.length
            },
            missions: volunteer.missions.map(m => ({
                id: m.id,
                status: m.missionStatus,
                startedAt: m.startedAt,
                completedAt: m.completedAt,
                incident: m.incident ? {
                    id: m.incident.id,
                    rawMessage: m.incident.rawMessage,
                    urgencyLevel: m.incident.urgencyLevel,
                    address: m.incident.aiAddress || m.incident.geomLocation || "Chưa có địa chỉ",
                    status: m.incident.status
                } : null
            }))
        };

        res.json(responseData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi server" });
    }
};

const getVolunteerLocations = async (req, res) => {
    try {
        const volunteers = await VolunteerModel.getVolunteerLocations();

        const mapped = volunteers.map(v => {
            const activeMission = v.missions[0];
            return {
                id: v.id,
                name: v.fullName,
                location: v.currentLocation || null,
                status: activeMission ? "busy" : "active",
                currentIncident: activeMission ? {
                    incidentId: activeMission.incident.id,
                    location: activeMission.incident.geomLocation,
                    address: activeMission.incident.aiAddress || "Chưa có địa chỉ"
                } : null
            };
        });

        res.json(mapped);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi server" });
    }
};

const getIncidentLocations = async (req, res) => {
    try {
        const incidents = await VolunteerModel.getIncidentLocations();

        const mapped = incidents.map(inc => ({
            id: inc.id,
            location: inc.geomLocation || null,
            address: inc.aiAddress || "Chưa có địa chỉ",
            urgencyLevel: inc.urgencyLevel,
            status: inc.status,
            volunteers: inc.missions.map(m => ({
                id: m.volunteer.id,
                name: m.volunteer.fullName,
                missionStatus: m.missionStatus
            }))
        }));

        res.json(mapped);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi server" });
    }
};

const getVolunteerStats = async (req, res) => {
    try {
        const stats = await VolunteerModel.getVolunteerStats();
        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi server" });
    }
};

module.exports = {
    getVolunteers,
    getVolunteer,
    getVolunteerLocations,
    getIncidentLocations,
    getVolunteerStats
};
