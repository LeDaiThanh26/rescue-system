const express = require("express");
const router = express.Router();
const caseController = require("../controllers/case.controller");

// ==========================================
// Routes Mục 5: Danh sách Case
// ==========================================

// Xuất file CSV (Lưu ý: Route này phải đặt TRƯỚC route /:id để không bị nhầm 'export' là 1 tham số ID)
router.get("/export", caseController.exportCases);

// Lấy danh sách, sort, filter
router.get("/", caseController.getCases);

// Phân công tình nguyện viên
router.post("/:id/assign", caseController.assignVolunteer);

// Chỉnh sửa thủ công
router.put("/:id", caseController.updateCaseManual);

// ==========================================
// Routes Mục 6: Chi tiết Case
// ==========================================

// Lấy chi tiết 1 case bao gồm (Text gốc, JSON, Map, Timeline, Thông tin đội)
router.get("/:id", caseController.getCaseDetail);

module.exports = router;