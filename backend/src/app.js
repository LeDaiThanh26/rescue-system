const express = require("express");
const cors = require("cors");
const prisma = require("./config/db");
const reportRouter = require("./routes/report");
const authRouter = require("./routes/auth");

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/report", reportRouter);

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

module.exports = app;