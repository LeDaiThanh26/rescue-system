const express = require("express");
const prisma = require("../config/db");
const MOCK_REPORTS = require("../data/mapMockReports");
const { mapDbToReport, applyQueryFilters } = require("../utils/mapReportMapper");

const router = express.Router();

async function loadReports() {
  const requests = await prisma.rescueRequest.findMany({
    orderBy: { createdAt: "desc" },
  });
  return requests.map(mapDbToReport);
}


router.get("/reports", async (req, res) => {
  try {
    const reports = await loadReports();
    const filtered = applyQueryFilters(reports, req.query);
    res.json(filtered);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});


router.get("/mock/reports", (req, res) => {
  res.json(MOCK_REPORTS);
});


router.get("/reports/track/:caseCode", async (req, res) => {
  try {
    const code = req.params.caseCode.trim();
    const reports = await loadReports();
    const found = reports.find((r) => r.caseCode.toLowerCase() === code.toLowerCase());

    if (!found) {
      return res.status(404).json({ error: `Không tìm thấy case "${code}"` });
    }

    res.json(found);
  } catch (error) {
    console.error("Error tracking case:", error);
    res.status(500).json({ error: "Failed to track case" });
  }
});


router.get("/reports/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const reports = await loadReports();
    const found = reports.find((r) => r.id === id);

    if (!found) {
      const db = await prisma.rescueRequest.findUnique({ where: { id } });
      if (!db) {
        return res.status(404).json({ error: "Report not found" });
      }
      return res.json(mapDbToReport(db));
    }

    res.json(found);
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});


router.patch("/reports/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const dbToPrisma = {
      PENDING: "PENDING",
      IN_PROGRESS: "ASSIGNED",
      COMPLETED: "COMPLETED",
      CANCELLED: "COMPLETED",
    };

    const prismaStatus = dbToPrisma[status];
    if (!prismaStatus) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updated = await prisma.rescueRequest.update({
      where: { id: parseInt(id, 10) },
      data: { status: prismaStatus },
    });

    res.json({ success: true, data: mapDbToReport(updated) });
  } catch (error) {
    console.error("Error updating report status:", error);
    res.status(500).json({ error: "Failed to update report status" });
  }
});

module.exports = router;
