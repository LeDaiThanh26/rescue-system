const express = require("express");
const adminController = require("../controllers/admin.controller");
const router = express.Router();

router.get("/volunteers", adminController.getVolunteers);
router.get("/volunteers/stats", adminController.getVolunteerStats);
router.get("/volunteers/locations", adminController.getVolunteerLocations);
router.get("/volunteers/incidents_lo", adminController.getIncidentLocations);
router.get("/volunteers/:id", adminController.getVolunteer);

module.exports = router;
