const prisma = require("../config/db");

exports.createReport = async (req, res) => {
  try {
    const { rawText, aiExtractedAddress, aiUrgency, aiNeeds, aiContact, geomLocation, geocodingConfidence } = req.body;

    if (!rawText || rawText.trim() === "") {
      return res.status(400).json({ error: "Nội dung kêu cứu không được để trống." });
    }

    const request = await prisma.rescueRequest.create({
      data: {
        rawText: rawText.trim(),
        aiExtractedAddress: aiExtractedAddress || null,
        aiUrgency: aiUrgency || null,
        aiNeeds: aiNeeds || null,
        aiContact: aiContact || null,
        geomLocation: geomLocation || null,
        geocodingConfidence: geocodingConfidence || null,
        status: "PENDING",
      },
    });

    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
    const caseCode = `RES-${datePart}-${String(request.id).padStart(4, "0")}`;

    res.status(201).json({
      success: true,
      caseCode,
      requestId: request.id,
      status: request.status,
      createdAt: request.createdAt,
    });
  } catch (error) {
    console.error("Report route error:", error);
    res.status(500).json({ error: "Lỗi hệ thống, vui lòng thử lại." });
  }
};

exports.getReportStatus = async (req, res) => {
  try {
    const { caseCode } = req.params;

    const parts = caseCode.split("-");
    if (parts.length !== 3 || parts[0] !== "RES") {
      return res.status(400).json({ error: "Mã case không hợp lệ." });
    }

    const id = parseInt(parts[2], 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Mã case không hợp lệ." });
    }

    const request = await prisma.rescueRequest.findUnique({ where: { id } });

    if (!request) {
      return res.status(404).json({ error: "Không tìm thấy case này." });
    }

    res.json({
      caseCode,
      status: request.status,
      createdAt: request.createdAt,
      aiUrgency: request.aiUrgency,
      aiExtractedAddress: request.aiExtractedAddress,
    });
  } catch (error) {
    console.error("Status route error:", error);
    res.status(500).json({ error: "Lỗi hệ thống, vui lòng thử lại." });
  }
};
