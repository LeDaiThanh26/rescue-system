const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");

const router = express.Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Thiếu username hoặc password" });
    }

    try {
        // Tìm user trong DB
        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            return res.status(401).json({ error: "Tài khoản không tồn tại" });
        }

        // Kiểm tra password
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: "Mật khẩu không đúng" });
        }

        // Tạo JWT token
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role,
                fullName: user.fullName,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Lỗi server" });
    }
});

// POST /api/auth/seed — Tạo tài khoản mẫu để test (chỉ dùng khi dev)
router.post("/seed", async (req, res) => {
    if (process.env.NODE_ENV === "production") {
        return res.status(403).json({ error: "Không khả dụng trên production" });
    }

    try {
        const hashedPassword = await bcrypt.hash("123456", 10);

        // Tạo admin
        const admin = await prisma.user.upsert({
            where: { username: "admin" },
            update: {},
            create: {
                username: "admin",
                passwordHash: hashedPassword,
                fullName: "Quản trị viên",
                role: "ADMIN",
            },
        });

        // Tạo volunteer
        const volunteer = await prisma.user.upsert({
            where: { username: "volunteer1" },
            update: {},
            create: {
                username: "volunteer1",
                passwordHash: hashedPassword,
                fullName: "Nguyễn Văn A",
                role: "VOLUNTEER",
            },
        });

        return res.json({
            message: "Seed thành công",
            accounts: [
                { username: "admin", password: "123456", role: "ADMIN" },
                { username: "volunteer1", password: "123456", role: "VOLUNTEER" },
            ],
        });
    } catch (error) {
        console.error("Seed error:", error);
        return res.status(500).json({ error: "Lỗi seed data" });
    }
});

// GET /api/auth/me — Lấy thông tin user hiện tại từ token
router.get("/me", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Không có token" });
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, username: true, fullName: true, role: true },
        });

        if (!user) return res.status(404).json({ error: "User không tồn tại" });

        return res.json({ user });
    } catch {
        return res.status(401).json({ error: "Token không hợp lệ" });
    }
});

module.exports = router;