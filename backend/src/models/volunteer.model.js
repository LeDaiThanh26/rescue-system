const prisma = require("../config/db");

const getVolunteersWithMissions = async () => {
    return await prisma.user.findMany({
        where: { role: "VOLUNTEER" },
        include: {
            missions: true 
        }
    });
};

const getVolunteerById = async (id) => {
    return await prisma.user.findFirst({
        where: { 
            id: parseInt(id),
            role: "VOLUNTEER" 
        },
        include: {
            missions: {
                include: {
                    incident: true
                }
            }
        }
    });
};

const getVolunteerLocations = async () => {
    return await prisma.user.findMany({
        where: { role: "VOLUNTEER" },
        include: {
            missions: {
                where: { missionStatus: { in: ["EN_ROUTE", "ON_SITE"] } },
                include: { incident: true }
            }
        }
    });
};

const getIncidentLocations = async () => {
    return await prisma.incident.findMany({
        include: {
            missions: {
                include: { volunteer: true }
            }
        }
    });
};

const getVolunteerStats = async () => {
    const totalVolunteers = await prisma.user.count({ where: { role: "VOLUNTEER" } });
    
    const totalCompletedMissions = await prisma.mission.count({
        where: { missionStatus: "DONE" }
    });

    const busyVolunteers = await prisma.user.count({
        where: {
            role: "VOLUNTEER",
            missions: {
                some: {
                    missionStatus: { in: ["EN_ROUTE", "ON_SITE"] }
                }
            }
        }
    });

    return {
        totalVolunteers,
        busyVolunteers,
        availableVolunteers: totalVolunteers - busyVolunteers,
        totalCompletedMissions
    };
};

const updateLocation = async (userId, location) => {
    return await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { currentLocation: location }
    });
};

module.exports = {
    getVolunteersWithMissions,
    getVolunteerById,
    getVolunteerLocations,
    getIncidentLocations,
    getVolunteerStats,
    updateLocation
};
