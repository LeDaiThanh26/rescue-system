const clients = new Map();

const addClient = (volunteerId, res) => {
    clients.set(volunteerId, res);
};

const removeClient = (volunteerId) => {
    clients.delete(volunteerId);
};

const notifyVolunteer = (volunteerId, data) => {
    const res = clients.get(volunteerId);
    if (res) {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
};

module.exports = {
    addClient,
    removeClient,
    notifyVolunteer
};
