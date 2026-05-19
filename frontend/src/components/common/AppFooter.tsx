export default function AppFooter() {
  return (
    <footer className="border-t border-blue-50 bg-white px-6 py-4">
      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400 font-medium">

        {/* ── BÊN TRÁI: HOTLINE KHẨN CẤP (Nổi bật để người dân dễ thấy) ── */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          <span>Đường dây nóng cứu hộ toàn quốc:</span>
          <a
            href="tel:18001122"
            className="px-2 py-0.5 bg-red-50 text-red-600 font-bold rounded border border-red-100 hover:bg-red-100 transition-colors"
          >
            1800-1122
          </a>
        </div>

        {/* ── BÊN PHẢI: THÔNG TIN BẢN QUYỀN & HƯỚNG DẪN ───────────────── */}
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span>© 2026 Bản đồ Cứu trợ Thiên tai</span>
          <span className="hidden md:inline text-slate-200">|</span>
          <span className="hidden md:inline">Thông tin được xác thực tự động bằng AI</span>
        </div>

      </div>
    </footer>
  );
}