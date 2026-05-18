const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Không có token xác thực" });
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ error: "Token không hợp lệ hoặc đã hết hạn" });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Chưa xác thực" });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Không có quyền truy cập" });
        }
        next();
    };
};

module.exports = { authenticate, authorize };