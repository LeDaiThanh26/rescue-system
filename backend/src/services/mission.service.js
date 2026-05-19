const prisma = require("../config/db");

const getMissionsByVolunteerId = (volunteerId) => prisma.mission.findMany({
    where: { volunteerId: parseInt(volunteerId) },
    include: { incident: true },
    orderBy: { id: 'desc' }
});

const getMissionById = (missionId, volunteerId) => prisma.mission.findFirst({
    where: { id: parseInt(missionId), volunteerId: parseInt(volunteerId) },
    include: { incident: true }
});

const acceptMission = (missionId) => prisma.mission.update({
    where: { id: parseInt(missionId) },
    data: { startedAt: new Date(), missionStatus: "EN_ROUTE" }
});

const rejectMission = async (missionId) => {
    const mission = await prisma.mission.findUnique({ where: { id: parseInt(missionId) } });
    if (!mission) throw new Error("Mission not found");
    return prisma.$transaction([
        prisma.mission.delete({ where: { id: parseInt(missionId) } }),
        prisma.incident.update({ where: { id: mission.incidentId }, data: { status: "PENDING" } })
    ]);
};

const updateMissionStatus = async (missionId, incidentId, status) => {
    if (status === "DONE") {
        return prisma.$transaction([
            prisma.mission.update({ where: { id: parseInt(missionId) }, data: { missionStatus: status, completedAt: new Date() } }),
            prisma.incident.update({ where: { id: parseInt(incidentId) }, data: { status: "COMPLETED" } })
        ]);
    }
    return prisma.mission.update({ where: { id: parseInt(missionId) }, data: { missionStatus: status } });
};

module.exports = { getMissionsByVolunteerId, getMissionById, acceptMission, rejectMission, updateMissionStatus };
