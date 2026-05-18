const express = require("express");
const prisma = require("./config/db");
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/admin/dashboard", require("./routes/admin.routes"));
app.get("/", (req, res) => {
    res.json({
        message: "Backend Running"
    });
});

app.get("/test-db", async (req, res) => {

    try {

        const users = await prisma.user.findMany();

        res.json(users);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            error: "Database Error"
        });

    }

});

module.exports = app;