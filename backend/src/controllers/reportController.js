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


    const incident = await prisma.incident.create({
      data: {
        rawMessage: rawText.trim(),
        aiAddress: aiExtractedAddress ? (aiExtractedAddress.text || aiExtractedAddress) : "Không xác định",
        geomLocation: geomLocation || null,
        urgencyLevel: aiUrgency || "MEDIUM",
        needs: aiNeeds || {},
        status: "PENDING",
      }
    });

    res.status(201).json({
      success: true,
      requestId: request.id,
      incidentId: incident.id,
      status: incident.status,
      createdAt: incident.createdAt,
    });
  } catch (error) {
    console.error("Report route error:", error);
    res.status(500).json({ error: "Lỗi hệ thống, vui lòng thử lại." });
  }
};
