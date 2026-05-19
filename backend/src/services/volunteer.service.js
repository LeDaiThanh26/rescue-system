const prisma = require("../config/db");

const getVolunteersWithMissions = () => prisma.user.findMany({ where: { role: "VOLUNTEER" }, include: { missions: true } });

const getVolunteerById = (id) => prisma.user.findFirst({
    where: { id: parseInt(id), role: "VOLUNTEER" },
    include: { missions: { include: { incident: true } } }
});

const getVolunteerLocations = () => prisma.user.findMany({
    where: { role: "VOLUNTEER" },
    include: { missions: { where: { missionStatus: { in: ["EN_ROUTE", "ON_SITE"] } }, include: { incident: true } } }
});

const getIncidentLocations = () => prisma.incident.findMany({
    include: { missions: { include: { volunteer: true } } }
});

const getVolunteerStats = async () => {
    const [totalVolunteers, totalCompletedMissions, busyVolunteers] = await Promise.all([
        prisma.user.count({ where: { role: "VOLUNTEER" } }),
        prisma.mission.count({ where: { missionStatus: "DONE" } }),
        prisma.user.count({
            where: { role: "VOLUNTEER", missions: { some: { missionStatus: { in: ["EN_ROUTE", "ON_SITE"] } } } }
        })
    ]);
    return { totalVolunteers, busyVolunteers, availableVolunteers: totalVolunteers - busyVolunteers, totalCompletedMissions };
};

const updateLocation = (userId, location) => prisma.user.update({
    where: { id: parseInt(userId) },
    data: { currentLocation: location }
});

module.exports = { getVolunteersWithMissions, getVolunteerById, getVolunteerLocations, getIncidentLocations, getVolunteerStats, updateLocation };
