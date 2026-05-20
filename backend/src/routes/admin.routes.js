const express = require("express");
const adminController = require("../controllers/admin.controller");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { getAdminDashboardData } = require('../controllers/dashboard.js');

const router = express.Router();

router.use(authenticate);
router.use(authorize("ADMIN"));

router.get("/volunteers", adminController.getVolunteers);
router.get("/volunteers/stats", adminController.getVolunteerStats);
router.get("/volunteers/locations", adminController.getVolunteerLocations);
router.get("/volunteers/incidents_lo", adminController.getIncidentLocations);
router.get("/volunteers/:id", adminController.getVolunteer);
router.get('/', getAdminDashboardData);

module.exports = router;
