from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import os, json, re, logging
import httpx

logger = logging.getLogger("ai-service")

app = FastAPI(title="Rescue AI Service")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

GROQ_API_KEY        = os.environ.get("GROQ_API_KEY", "")
# Nominatim (OpenStreetMap) — miễn phí, không cần API key

groq_client: Groq | None = None

if GROQ_API_KEY:
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
        logger.info("✅ Groq client initialized")
    except Exception as e:
        logger.warning(f"Groq init failed: {e}")

class AnalyzeRequest(BaseModel):
    text: str

SYSTEM_PROMPT = """Bạn là AI phân tích tin nhắn kêu cứu khẩn cấp thiên tai tại Việt Nam.
Trả về ĐÚNG định dạng JSON (không markdown, không giải thích):
{
  "address": "địa chỉ đầy đủ hoặc 'Không xác định'",
  "urgency": "CRITICAL | HIGH | MEDIUM | LOW",
  "needs": ["Xuồng cứu thương","Y tế","Lương thực","Nước uống","Hỗ trợ sơ tán"],
  "contact": "số điện thoại hoặc 'Không có'",
  "confidence": 80
}
urgency: CRITICAL=chết/nguy kịch/kẹt, HIGH=ngập nặng/sơ tán ngay, MEDIUM=cần tiếp tế, LOW=ổn định.
needs: chỉ chọn những mục phù hợp từ danh sách trên.
confidence: 0-100, mức chắc chắn về địa chỉ.
Lưu ý: KHÔNG trả về lat/lng — hệ thống sẽ tự geocode địa chỉ."""

def _parse_json(raw: str) -> dict:
    raw = re.sub(r"^```(?:json)?\s*", "", raw.strip())
    raw = re.sub(r"\s*```$", "", raw)
    result = json.loads(raw)
    result.setdefault("address", "Không xác định")
    result.setdefault("urgency", "MEDIUM")
    result.setdefault("needs", ["Hỗ trợ sơ tán"])
    result.setdefault("contact", "Không có")
    result.setdefault("confidence", 70)
    result["confidence"] = max(0, min(100, int(result["confidence"])))
    return result

def _keyword_analyze(text: str) -> dict:
    lower = text.lower()

    if any(w in lower for w in ["chết", "nguy kịch", "cấp cứu", "khẩn cấp", "kẹt chặt"]):
        urgency = "CRITICAL"
    elif any(w in lower for w in ["bị thương", "lụt", "ngập", "kẹt", "sơ tán ngay"]):
        urgency = "HIGH"
    elif any(w in lower for w in ["cần", "thiếu", "tiếp tế"]):
        urgency = "MEDIUM"
    else:
        urgency = "LOW"

    needs = []
    if any(w in lower for w in ["xuồng", "thuyền", "ghe", "sơ tán"]):
        needs.append("Xuồng cứu thương")
    if any(w in lower for w in ["y tế", "bác sĩ", "thuốc", "bị thương", "cấp cứu"]):
        needs.append("Y tế")
    if any(w in lower for w in ["thức ăn", "lương thực", "gạo"]):
        needs.append("Lương thực")
    if any(w in lower for w in ["nước", "uống"]):
        needs.append("Nước uống")
    if not needs:
        needs.append("Hỗ trợ sơ tán")

    addr = re.search(r"(?:tại|ở|địa chỉ|số)\s+([^,.\n]{5,60})", text, re.IGNORECASE)
    phone = re.search(r"0\d{9}", text)

    return {
        "address": addr.group(1).strip() if addr else "Không xác định",
        "urgency": urgency,
        "needs": needs,
        "contact": phone.group(0) if phone else "Không có",
        "lat": None, "lng": None,
        "confidence": 45,
        "source": "keyword-fallback",
    }

async def _geocode_address(address: str) -> tuple[float | None, float | None]:
    """
    Geocode địa chỉ → lat/lng bằng Nominatim (OpenStreetMap).
    Hoàn toàn miễn phí, không cần API key.
    Nominatim policy: https://operations.osmfoundation.org/policies/nominatim/
    """
    if not address or address == "Không xác định":
        return None, None

    # Thêm 'Việt Nam' nếu chưa có
    query = address if "việt nam" in address.lower() else f"{address}, Việt Nam"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                "https://nominatim.openstreetmap.org/search",
                params={
                    "q": query,
                    "format": "json",
                    "limit": 1,
                    "countrycodes": "vn",
                    "accept-language": "vi",
                },
                headers={
                    # Bắt buộc theo Nominatim Usage Policy
                    "User-Agent": "RescueSystem/1.0 (emergency-rescue-application)",
                },
            )
        results = resp.json()
        logger.info(f"Nominatim: {len(results)} result(s) for '{query}'")

        if isinstance(results, list) and results:
            return float(results[0]["lat"]), float(results[0]["lon"])

        logger.warning(f"Nominatim: no results for '{query}'")
        return None, None

    except Exception as e:
        logger.warning(f"Nominatim geocoding failed: {e}")
        return None, None

@app.get("/")
def home():
    return {
        "message": "AI Service Running",
        "active_model": "groq-llama3.3-70b" if groq_client else "keyword-fallback",
        "geocoding": "nominatim (OpenStreetMap, free)",
    }

@app.post("/analyze")
async def analyze(req: AnalyzeRequest):
    text = (req.text or "").strip()
    if len(text) < 5:
        raise HTTPException(status_code=400, detail="Nội dung quá ngắn.")

    result: dict = {}

    # ── Bước 1: Phân tích bằng Groq hoặc keyword fallback ──────────────────
    if groq_client:
        try:
            chat = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Tin nhắn kêu cứu:\n{text}"},
                ],
                temperature=0.1,
                max_tokens=512,
            )
            result = _parse_json(chat.choices[0].message.content)
            result["source"] = "groq-llama3.3-70b"
        except Exception as e:
            logger.warning(f"Groq failed ({type(e).__name__}), fallback keyword.")

    if not result:
        result = _keyword_analyze(text)

    # ── Bước 2: Geocode địa chỉ đã trích xuất → lat/lng ────────────────────
    lat, lng = await _geocode_address(result.get("address", ""))

    result["lat"] = lat
    result["lng"] = lng

    # Nếu geocoding thành công → tăng confidence
    if lat is not None and lng is not None:
        result["confidence"] = min(100, result.get("confidence", 70) + 15)
        result["geocoded"] = True
    else:
        result["geocoded"] = False

    return result