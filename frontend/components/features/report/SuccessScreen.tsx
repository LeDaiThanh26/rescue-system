"use client";

interface SuccessScreenProps {
  onReset: () => void;
}

export default function SuccessScreen({ onReset }: SuccessScreenProps) {
  return (
    <div className="bg-white border border-emerald-300 rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-emerald-300 bg-emerald-50/30">
        <h2 className="text-sm font-bold text-emerald-900">Gửi thông tin thành công</h2>
        <p className="text-xs text-slate-500 mt-0.5">Yêu cầu đã được ghi nhận trên hệ thống bản đồ điều phối</p>
      </div>

      <div className="p-8 flex flex-col items-center justify-center gap-6 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
          <span className="text-3xl text-emerald-600">✓</span>
        </div>
        
        <div>
          <h3 className="text-lg font-bold text-slate-800">Cảm ơn bạn đã cung cấp thông tin</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-[400px]">
            Đội ngũ cứu hộ đã tiếp nhận tin nhắn của bạn. Chúng tôi sẽ ưu tiên điều phối lực lượng đến khu vực của bạn trong thời gian sớm nhất.
          </p>
        </div>

        <div className="w-full h-px bg-slate-100 my-2"></div>

        <div className="flex flex-col gap-3 w-full max-w-[300px]">
          <button
            onClick={onReset}
            className="w-full text-sm font-bold text-white bg-emerald-600 rounded-xl px-6 py-3 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
          >
            + Gửi thêm một tin mới
          </button>
          
          <a
            href="/map"
            className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            Xem tình hình trên Bản đồ công khai →
          </a>
        </div>
      </div>
    </div>
  );
}