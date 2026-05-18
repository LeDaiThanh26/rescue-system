const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const USER_AGENT = "RescueSystem/1.0 (emergency-rescue-application)";

export interface GeocodingResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  isApproximate?: boolean;
}

function ensureVN(query: string): string {
  return /việt nam/i.test(query) ? query : `${query}, Việt Nam`;
}

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

function buildFallbackQueries(address: string): string[] {
  const parts = address
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const queries: string[] = [];

  for (let i = 1; i < parts.length; i++) {
    queries.push(parts.slice(i).join(", "));
  }

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

export async function geocodeAddress(
  address: string
): Promise<GeocodingResult | null> {
  if (!address || address === "Không xác định") return null;

  try {
    const full = await nominatimSearch(ensureVN(address));
    if (full) return full;

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
