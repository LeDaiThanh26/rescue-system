/**
 * geocodingService.ts
 * Geocoding miễn phí 100% bằng Nominatim (OpenStreetMap).
 * Không cần API key, không cần tài khoản.
 *
 * Nominatim Usage Policy: https://operations.osmfoundation.org/policies/nominatim/
 * - Phải gửi kèm User-Agent header
 * - Giới hạn 1 request/giây (đủ dùng cho hệ thống cứu trợ)
 */

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const USER_AGENT = "RescueSystem/1.0 (emergency-rescue-application)";

export interface GeocodingResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  /** true nếu tọa độ tìm được bằng địa chỉ đã đơn giản hóa (bỏ số nhà/hẻm/kiệt) */
  isApproximate?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

function ensureVN(query: string): string {
  return /việt nam/i.test(query) ? query : `${query}, Việt Nam`;
}

/** Gọi Nominatim search với 1 query cụ thể. Trả về null nếu không có kết quả. */
async function nominatimSearch(query: string): Promise<GeocodingResult | null> {
  const params = new URLSearchParams({
    q: query,
    format: "json",
    limit: "1",
    countrycodes: "vn",
    "accept-language": "vi",
    addressdetails: "0",
  });

  const resp = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
    headers: { "User-Agent": USER_AGENT, "Accept-Language": "vi" },
  });

  const data: Array<{ lat: string; lon: string; display_name: string }> =
    await resp.json();

  if (Array.isArray(data) && data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      formattedAddress: data[0].display_name,
    };
  }
  return null;
}

/**
 * Sinh danh sách địa chỉ đơn giản hóa dần để thử fallback.
 *
 * VD: "HO1/52, K49 Võ Duy Ninh, thành phố Đà Nẵng"
 *   → "K49 Võ Duy Ninh, thành phố Đà Nẵng"   (bỏ số nhà đầu)
 *   → "Võ Duy Ninh, thành phố Đà Nẵng"        (bỏ thêm tiền tố K49/kiệt)
 *   → "thành phố Đà Nẵng"                      (chỉ còn tỉnh/thành)
 */
function buildFallbackQueries(address: string): string[] {
  const parts = address
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const queries: string[] = [];

  // Bỏ lần lượt từ phần đầu tiên (số nhà → kiệt/hẻm → đường → …)
  for (let i = 1; i < parts.length; i++) {
    queries.push(parts.slice(i).join(", "));
  }

  // Nếu phần đầu có dạng "K49 Tên đường" hoặc "Kiệt 49 Tên đường"
  // → thêm phiên bản chỉ giữ "Tên đường" mà không có tiền tố kiệt
  const kietRegex = /^(?:[Kk]iệt\s+\d+|[Kk]\d+)\s+(.+)$/;
  for (const part of parts) {
    const m = kietRegex.exec(part);
    if (m) {
      const streetOnly = m[1].trim();
      const idx = parts.indexOf(part);
      const q = [streetOnly, ...parts.slice(idx + 1)].join(", ");
      if (!queries.includes(q)) queries.push(q);
    }
  }

  return queries;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Chuyển địa chỉ text → tọa độ lat/lng qua Nominatim API.
 *
 * Chiến lược:
 *  1. Thử địa chỉ đầy đủ.
 *  2. Nếu không ra, thử lần lượt các phiên bản đơn giản hóa (bỏ số nhà, bỏ kiệt/hẻm...).
 *  3. Trả về kết quả đầu tiên tìm được, kèm flag `isApproximate = true` nếu là fallback.
 */
export async function geocodeAddress(
  address: string
): Promise<GeocodingResult | null> {
  if (!address || address === "Không xác định") return null;

  try {
    // 1) Thử với địa chỉ đầy đủ
    const full = await nominatimSearch(ensureVN(address));
    if (full) return full;

    // 2) Thử lần lượt các địa chỉ đơn giản hóa
    for (const fallback of buildFallbackQueries(address)) {
      const r = await nominatimSearch(ensureVN(fallback));
      if (r) return { ...r, isApproximate: true };
    }

    console.warn("[geocodingService] Không tìm thấy kết quả cho:", address);
    return null;
  } catch (err) {
    console.error("[geocodingService] Lỗi Nominatim:", err);
    return null;
  }
}

/**
 * Reverse geocode: tọa độ GPS (lat/lng) → địa chỉ văn bản.
 * Dùng cho nút "Vị trí của tôi".
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      format: "json",
      "accept-language": "vi",
      zoom: "18",
    });
    const resp = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "vi" },
    });
    const data = await resp.json();
    return (data as { display_name?: string }).display_name ?? null;
  } catch {
    return null;
  }
}
