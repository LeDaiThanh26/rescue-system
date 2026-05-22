const express = require("express");
const router = express.Router();
const caseController = require("../controllers/case.controller");




router.get("/export", caseController.exportCases);

router.post("/sync", caseController.syncFromRescueRequest);

router.get("/", caseController.getCases);


router.post("/:id/assign", caseController.assignVolunteer);


router.put("/:id", caseController.updateCaseManual);




router.get("/:id", caseController.getCaseDetail);

module.exports = router;