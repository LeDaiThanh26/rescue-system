"use client";

import { useState } from "react";

interface SuccessScreenProps {
  caseCode: string;
  onReset: () => void;
}

const TIMELINE = [
  { label: "Hệ thống tiếp nhận thông tin", desc: "Vừa xong", done: true, active: false },
  { label: "Đang chuyển thông tin đến đội cứu hộ khu vực", desc: "Đang xử lý", done: false, active: true },
  { label: "Đội phản ứng nhanh di chuyển thực địa", desc: "Chờ xử lý", done: false, active: false },
  { label: "Hoàn thành hỗ trợ", desc: "Chờ xử lý", done: false, active: false },
];

export default function SuccessScreen({ caseCode, onReset }: SuccessScreenProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(caseCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-emerald-300 rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-emerald-300 bg-emerald-50/30">
        <h2 className="text-sm font-bold text-emerald-900">Gửi thông tin thành công</h2>
        <p className="text-xs text-slate-500 mt-0.5">Yêu cầu đã được ghi nhận trên hệ thống bản đồ điều phối</p>
      </div>

      <div className="p-5 flex flex-col gap-5">
        {/* Case code */}
        <div className="bg-emerald-50/50 border border-emerald-300 rounded-xl p-5 flex flex-col items-center gap-2 text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mã số tra cứu đơn cứu hộ của bạn</p>
          <p className="text-2xl font-black font-mono tracking-widest text-emerald-800">{caseCode}</p>
          <button
            onClick={handleCopy}
            className="text-xs font-bold text-emerald-800 bg-white border border-emerald-400 rounded-lg px-4 py-1.5 hover:bg-emerald-50 transition-colors shadow-sm mt-1"
          >
            {copied ? "Đã sao chép đơn ✓" : "Sao chép mã tra cứu"}
          </button>
        </div>

        {/* Timeline */}
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Trạng thái xử lý tiếp theo</p>
          <div className="flex flex-col">
            {TIMELINE.map((item, i) => (
              <div key={i} className="flex items-start gap-3 relative pb-4">
                {/* Line */}
                {i < TIMELINE.length - 1 && (
                  <div
                    className={`absolute left-[11px] top-6 bottom-0 w-px ${item.done ? "bg-emerald-400" : "bg-slate-300"}`}
                  />
                )}
                {/* Node */}
                <div
                  className={`
                    w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 z-10
                    text-[11px] font-bold border
                    ${item.done ? "bg-emerald-100 border-emerald-400 text-emerald-800" : ""}
                    ${item.active ? "bg-amber-50 border-amber-400 text-amber-800 animate-pulse" : ""}
                    ${!item.done && !item.active ? "bg-slate-50 border-slate-300 text-slate-400" : ""}
                  `}
                >
                  {item.done ? "✓" : i + 1}
                </div>
                {/* Content */}
                <div className="pt-0.5">
                  <p className={`text-sm font-bold ${!item.done && !item.active ? "text-slate-400" : "text-slate-900"}`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 flex-wrap gap-3">
          <a
            href="/map"
            className="text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline"
          >
            Theo dõi vị trí trên Bản đồ công khai →
          </a>
          <button
            onClick={onReset}
            className="text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl px-4 py-2 hover:border-slate-500 transition-all"
          >
            + Nhập đơn kêu cứu mới
          </button>
        </div>
      </div>
    </div>
  );
}