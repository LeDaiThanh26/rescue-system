export default function AppHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-blue-100 shadow-sm shadow-blue-50">
      <div className="max-w-[1200px] mx-auto px-5 py-3 flex items-center justify-between">

        {/* ── BÊN TRÁI: LOGO & TÊN HỆ THỐNG (Tông xanh dương tin cậy, rõ ràng) ── */}
        <div className="flex items-center gap-3">
          {/* Khối SOS màu xanh dương công nghệ, bo góc gọn gàng */}
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold tracking-wider">SOS</span>
          </div>

          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-wide">
              Bản Đồ Cứu Trợ Khẩn Cấp
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Hệ thống tiếp nhận thông tin và điều phối cứu hộ bão lũ
            </p>
          </div>
        </div>

        {/* ── BÊN PHẢI: TÍN HIỆU REAL-TIME (Đơn giản, chỉ báo hệ thống đang chạy) ── */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-xs font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Dữ liệu thời gian thực
        </div>

      </div>
    </header>
  );
}