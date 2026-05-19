/**
 * Chuyển đổi RescueRequest (DB) → Report (module map)
 */

function parseGeom(geomLocation) {
  if (!geomLocation) return { latitude: 16.0544, longitude: 108.2022 };
  try {
    const parsed = typeof geomLocation === "string" ? JSON.parse(geomLocation) : geomLocation;
    if (parsed.lat != null && parsed.lng != null) {
      return { latitude: parsed.lat, longitude: parsed.lng };
    }
    if (parsed.latitude != null && parsed.longitude != null) {
      return { latitude: parsed.latitude, longitude: parsed.longitude };
    }
  } catch {
    /* ignore */
  }
  return { latitude: 16.0544, longitude: 108.2022 };
}

function extractAddress(aiExtractedAddress) {
  if (!aiExtractedAddress) return { address: "Địa chỉ không xác định", province: "Đà Nẵng", district: "" };
  let obj = aiExtractedAddress;
  if (typeof aiExtractedAddress === "string") {
    try {
      obj = JSON.parse(aiExtractedAddress);
    } catch {
      return { address: aiExtractedAddress, province: "Đà Nẵng", district: "" };
    }
  }
  return {
    address: obj.address || obj.text || "Địa chỉ không xác định",
    province: obj.province || "Đà Nẵng",
    district: obj.district || "",
  };
}

function extractCategory(aiNeeds) {
  if (!aiNeeds) return "Khác";
  const needs = Array.isArray(aiNeeds) ? aiNeeds : typeof aiNeeds === "string" ? JSON.parse(aiNeeds) : [];
  if (needs.length === 0) return "Khác";
  const first = needs[0];
  const map = { medical: "Y tế", food: "Lương thực", shelter: "Nhà ở", infrastructure: "Cơ sở hạ tầng" };
  return map[first] || first || "Khác";
}

function mapPriority(aiUrgency, status) {
  if (status === "COMPLETED") return "RESOLVED";
  const u = (aiUrgency || "").toUpperCase();
  if (u === "RED" || u === "CRITICAL" || u === "HIGH") return "HIGH";
  if (u === "YELLOW" || u === "MEDIUM") return "MEDIUM";
  if (status === "ASSIGNED") return "MEDIUM";
  return "MEDIUM";
}

function mapStatus(dbStatus) {
  if (dbStatus === "ASSIGNED") return "IN_PROGRESS";
  if (dbStatus === "COMPLETED") return "COMPLETED";
  if (dbStatus === "PENDING") return "PENDING";
  return dbStatus || "PENDING";
}

function mapDbToReport(req) {
  const { address, province, district } = extractAddress(req.aiExtractedAddress);
  const { latitude, longitude } = parseGeom(req.geomLocation);
  const status = mapStatus(req.status);

  return {
    id: req.id,
    caseCode: `RC${String(req.id).padStart(6, "0")}`,
    fullName: req.aiContact || `Yêu cầu #${req.id}`,
    phone: req.aiContact || "N/A",
    address,
    province,
    district,
    latitude,
    longitude,
    priority: mapPriority(req.aiUrgency, req.status),
    status,
    category: extractCategory(req.aiNeeds),
    description: req.rawText || "Không có mô tả",
    assignedUnit: status === "PENDING" ? null : "Trung tâm điều phối cứu trợ",
    assignedVolunteer: status === "IN_PROGRESS" ? "Đội tình nguyện viên" : null,
    createdAt: req.createdAt,
    updatedAt: req.createdAt,
  };
}

function applyQueryFilters(reports, query) {
  let result = [...reports];
  const { province, priority, status, category, keyword } = query;

  if (province) {
    result = result.filter((r) => r.province === province);
  }
  if (priority) {
    result = result.filter((r) => r.priority === priority);
  }
  if (status) {
    result = result.filter((r) => r.status === status);
  }
  if (category) {
    result = result.filter((r) => r.category === category);
  }
  if (keyword) {
    const kw = String(keyword).toLowerCase();
    result = result.filter(
      (r) =>
        (r.caseCode && r.caseCode.toLowerCase().includes(kw)) ||
        r.fullName.toLowerCase().includes(kw) ||
        r.address.toLowerCase().includes(kw)
    );
  }

  return result;
}

module.exports = {
  mapDbToReport,
  applyQueryFilters,
  parseGeom,
  mapPriority,
  mapStatus,
};
