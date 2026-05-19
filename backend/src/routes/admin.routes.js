const express = require('express');
const router = express.Router();
const { getAdminDashboardData } = require('../controllers/dashboard.js'); 

// SỬA Ở ĐÂY: Đổi từ '/dashboard' thành '/'
// Vì ở app.js đã định nghĩa đầy đủ chuỗi /api/admin/dashboard rồi
router.get('/', getAdminDashboardData);

module.exports = router;
const express = require("express");
const adminController = require("../controllers/admin.controller");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const router = express.Router();

router.use(authenticate);
router.use(authorize("ADMIN"));

router.get("/volunteers", adminController.getVolunteers);
router.get("/volunteers/stats", adminController.getVolunteerStats);
router.get("/volunteers/locations", adminController.getVolunteerLocations);
router.get("/volunteers/incidents_lo", adminController.getIncidentLocations);
router.get("/volunteers/:id", adminController.getVolunteer);

module.exports = router;
