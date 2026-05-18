const express = require("express");
const cors = require("cors");
const prisma = require("./config/db");
const mapRoutes = require("./routes/mapRoutes");

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Backend Running" });
});

app.get("/test-db", async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Database Error" });
    }
});

// ==================== MAP MODULE ROUTES ====================
app.use("/api", mapRoutes);

// ==================== VOLUNTEER ROUTES ====================

app.get("/api/volunteers", async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { role: "VOLUNTEER" },
        });

        const volunteers = users.map((user) => ({
            id: user.id,
            fullName: user.fullName,
            phone: "N/A",
            latitude: 16.0544,
            longitude: 108.2022,
            status: "AVAILABLE",
        }));

        res.json(volunteers);
    } catch (error) {
        console.error("Error fetching volunteers:", error);
        res.status(500).json({ error: "Failed to fetch volunteers" });
    }
});

app.get("/api/volunteers/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id, 10) },
        });

        if (!user || user.role !== "VOLUNTEER") {
            return res.status(404).json({ error: "Volunteer not found" });
        }

        res.json({
            id: user.id,
            fullName: user.fullName,
            phone: "N/A",
            latitude: 16.0544,
            longitude: 108.2022,
            status: "AVAILABLE",
        });
    } catch (error) {
        console.error("Error fetching volunteer:", error);
        res.status(500).json({ error: "Failed to fetch volunteer" });
    }
});

module.exports = app;
