"use client";

import { useState } from "react";
import { URGENCY_META } from "@/types/report";
import type { AIResult } from "@/types/report";
import GoogleMap from "@/components/features/report/GoogleMap";
import { geocodeAddress, reverseGeocode } from "@/services/geocodingService";

interface AddressConfirmProps {
  aiResult: AIResult;
  address: string;
  lat: string;
  lng: string;
  isSubmitting: boolean;
  onAddressChange: (v: string) => void;
  onLatChange: (v: string) => void;
  onLngChange: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export default function AddressConfirm({
  aiResult, address, lat, lng, isSubmitting,
  onAddressChange, onLatChange, onLngChange,
  onSubmit, onBack,
}: AddressConfirmProps) {
  const urgency = URGENCY_META[aiResult.urgency];
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isGpsLocating, setIsGpsLocating] = useState(false);
  const [geocodeMsg, setGeocodeMsg] = useState<{ type: "ok" | "warn" | "err"; text: string } | null>(null);

  const handleReverseGeocode = async () => {
    if (!address || address === "Không xác định") {
      setGeocodeMsg({ type: "err", text: "Vui lòng nhập địa chỉ trước khi tìm tọa độ." });
      return;
    }
    setIsGeocoding(true);
    setGeocodeMsg(null);
    try {
      const result = await geocodeAddress(address);
      if (result) {
        onLatChange(result.lat.toFixed(6));
        onLngChange(result.lng.toFixed(6));
        onAddressChange(result.formattedAddress);
        if (result.isApproximate) {
          setGeocodeMsg({ type: "warn", text: `⚠️ Tọa độ gần đúng (số nhà/kiệt không có trong bản đồ): ${result.formattedAddress}` });
        } else {
          setGeocodeMsg({ type: "ok", text: `✅ Đã xác định chính xác: ${result.formattedAddress}` });
        }
      } else {
        setGeocodeMsg({ type: "err", text: "Không tìm thấy tọa độ. Hãy thử nút 📍 Vị trí của tôi hoặc nhập tọa độ thủ công." });
      }
    } catch {
      setGeocodeMsg({ type: "err", text: "Lỗi kết nối Geocoding. Vui lòng thử lại." });
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleGpsLocate = () => {
    if (!navigator.geolocation) {
      setGeocodeMsg({ type: "err", text: "Trình duyệt không hỗ trợ định vị GPS." });
      return;
    }
    setIsGpsLocating(true);
    setGeocodeMsg(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        onLatChange(latitude.toFixed(6));
        onLngChange(longitude.toFixed(6));
        try {
          const addr = await reverseGeocode(latitude, longitude);
          if (addr) {
            onAddressChange(addr);
            setGeocodeMsg({ type: "ok", text: `✅ GPS xác định: ${addr}` });
          } else {
            setGeocodeMsg({ type: "ok", text: `✅ GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}` });
          }
        } catch {
          setGeocodeMsg({ type: "ok", text: `✅ GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}` });
        } finally {
          setIsGpsLocating(false);
        }
      },
      (err) => {
        setIsGpsLocating(false);
        const msgs: Record<number, string> = {
          1: "Bạn đã từ chối cấp quyền định vị. Hãy bật lại trong cài đặt trình duyệt.",
          2: "Không thể xác định vị trí. Kiểm tra GPS/Wi-Fi.",
          3: "Hết thời gian chờ định vị. Thử lại.",
        };
        setGeocodeMsg({ type: "err", text: msgs[err.code] ?? "Không lấy được vị trí GPS." });
      },
      { timeout: 15_000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-300 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-900">Xác nhận vị trí cứu hộ</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Nhập địa chỉ rồi nhấn <strong>Tìm tọa độ</strong> — bản đồ sẽ cập nhật tự động như Shopee
        </p>
      </div>

      <div className="p-5 flex flex-col gap-4">
        <GoogleMap address={address} lat={lat} lng={lng} height={280} />

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Địa chỉ chi tiết
          </label>
          <div className="flex gap-2">
            <input
              value={address}
              onChange={(e) => {
                onAddressChange(e.target.value);
                setGeocodeMsg(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleReverseGeocode()}
              placeholder="Số nhà, tên đường, thôn/xóm, phường/xã, tỉnh/thành..."
              className="flex-1 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-semibold outline-none focus:border-blue-500 transition-all"
            />
            <button
              type="button"
              onClick={handleReverseGeocode}
              disabled={isGeocoding || isGpsLocating}
              className={`
                flex-shrink-0 px-4 py-2.5 text-sm font-bold rounded-xl border transition-all flex items-center gap-1.5 whitespace-nowrap
                ${isGeocoding
                  ? "bg-blue-100 text-blue-400 border-blue-200 cursor-not-allowed"
                  : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-sm"
                }
              `}
            >
              {isGeocoding ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-blue-300 border-t-blue-500 rounded-full animate-spin" />
                  Đang tìm...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  Tìm tọa độ
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleGpsLocate}
              disabled={isGpsLocating || isGeocoding}
              title="Dùng định vị GPS của thiết bị để xác định vị trí chính xác"
              className={`
                flex-shrink-0 px-3 py-2.5 text-sm font-bold rounded-xl border transition-all flex items-center gap-1.5 whitespace-nowrap
                ${isGpsLocating
                  ? "bg-emerald-100 text-emerald-400 border-emerald-200 cursor-not-allowed"
                  : "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-sm"
                }
              `}
            >
              {isGpsLocating ? (
                <span className="w-3.5 h-3.5 border-2 border-emerald-300 border-t-emerald-500 rounded-full animate-spin" />
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                  <circle cx="12" cy="12" r="8" strokeOpacity=".35"/>
                </svg>
              )}
              {isGpsLocating ? "" : "GPS"}
            </button>
          </div>

          {geocodeMsg && (
            <p className={`text-xs font-medium px-1 ${
              geocodeMsg.type === "ok"   ? "text-green-600" :
              geocodeMsg.type === "warn" ? "text-amber-600" :
              "text-red-500"
            }`}>
              {geocodeMsg.text}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vĩ độ (Latitude)</label>
            <input
              type="number"
              step="0.000001"
              value={lat}
              onChange={(e) => onLatChange(e.target.value)}
              placeholder="10.7769"
              className="border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-slate-900 outline-none focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kinh độ (Longitude)</label>
            <input
              type="number"
              step="0.000001"
              value={lng}
              onChange={(e) => onLngChange(e.target.value)}
              placeholder="106.7009"
              className="border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-slate-900 outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-800 leading-relaxed font-medium">
          <span className="flex-shrink-0 text-blue-500">💡</span>
          <span>
            Nhập địa chỉ rồi nhấn <strong>Tìm tọa độ</strong>. Nếu không tìm được (số nhà/kiệt nhỏ),
            hãy nhấn <strong className="text-emerald-700">📡 GPS</strong> để lấy vị trí hiện tại của bạn — chính xác nhất trong tình huống khẩn cấp.
          </span>
        </div>

        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 text-xs text-amber-900 leading-relaxed font-medium">
          <span className="flex-shrink-0 font-bold text-amber-600">⚠</span>
          <span>Đảm bảo địa chỉ và tọa độ chuẩn xác để xuồng/đội ứng cứu tiếp cận đúng vị trí nhà bạn trong điều kiện mưa lũ, ngập lụt khuất tầm nhìn.</span>
        </div>

        <div className="border border-slate-300 rounded-xl overflow-hidden divide-y divide-slate-300 bg-slate-50/50">
          {[
            { label: "Mức độ khẩn cấp", value: urgency.label, style: { color: urgency.color, fontWeight: "800" } },
            { label: "Nhu cầu hỗ trợ",  value: aiResult.needs.join(", "),  style: { fontWeight: "600" } },
            { label: "Số điện thoại",    value: aiResult.contact, style: { fontFamily: "mono", fontWeight: "800" } },
          ].map(({ label, value, style }) => (
            <div key={label} className="flex justify-between items-center px-4 py-2.5">
              <span className="text-[11px] font-bold text-slate-500">{label}</span>
              <span className="text-xs text-slate-900" style={style}>{value}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <button
            onClick={onBack}
            className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            ← Quay lại
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className={`
              px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all flex items-center gap-2 shadow-sm
              ${isSubmitting ? "bg-blue-400 cursor-not-allowed border border-blue-400" : "bg-blue-600 hover:bg-blue-700"}
            `}
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Đang gửi thông tin...
              </>
            ) : (
              "Gửi yêu cầu kêu cứu →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}