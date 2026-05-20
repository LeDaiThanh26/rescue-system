const express = require("express");
const cors = require("cors");
const prisma = require("./config/db");

const mapRoutes = require("./routes/mapRoutes");
const reportRouter = require("./routes/report");
const authRouter = require("./routes/auth");

// Import routes
const caseRoutes = require("./routes/case.routes");

const app = express();

// ==================== CORS ====================

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
  : ["http://localhost:3000", "http://localhost:5000"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ==================== MIDDLEWARE ====================

app.use(express.json());

// ==================== ROUTES ====================

app.use("/api/auth", authRouter);

app.use("/api/report", reportRouter);

// Admin Cases
app.use("/api/admin/cases", caseRoutes);

app.use("/api/admin", require("./routes/admin.routes"));

app.use("/api/volunteer", require("./routes/volunteer.routes"));



// Map routes
app.use("/api", mapRoutes);

// ==================== TEST ROUTES ====================

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
