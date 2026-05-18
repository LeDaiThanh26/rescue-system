const express = require('express');
const router = express.Router();
const { getAdminDashboardData } = require('../controllers/dashboard.js'); 

// SỬA Ở ĐÂY: Đổi từ '/dashboard' thành '/'
// Vì ở app.js đã định nghĩa đầy đủ chuỗi /api/admin/dashboard rồi
router.get('/', getAdminDashboardData);

module.exports = router;