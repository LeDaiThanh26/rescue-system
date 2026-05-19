const express = require("express");
const volunteerController = require("../controllers/volunteer.controller");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const router = express.Router();

router.use(authenticate);
router.use(authorize("VOLUNTEER"));

router.get("/missions", volunteerController.getMyMissions);
router.get("/stream", volunteerController.streamMissions);
router.get("/missions/:id", volunteerController.getMissionDetail);
router.patch("/missions/:id/accept", volunteerController.acceptMission);
router.patch("/missions/:id/reject", volunteerController.rejectMission);
router.patch("/missions/:id/status", volunteerController.updateMissionStatus);
router.patch("/location", volunteerController.updateLocation);

module.exports = router;
