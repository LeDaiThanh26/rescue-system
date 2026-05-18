"use client";

import { URGENCY_META } from "@/types/report";
import type { AIResult } from "@/types/report";

interface AIPreviewProps {
  result: AIResult;
  originalText: string;
  onConfirm: () => void;
  onBack: () => void;
}

export default function AIPreview({ result, originalText, onConfirm, onBack }: AIPreviewProps) {
  const urgency = URGENCY_META[result.urgency];
  const confidenceColor =
    result.confidence >= 80 ? "bg-emerald-500" :
      result.confidence >= 60 ? "bg-amber-500" : "bg-orange-500";

  return (
    <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-300 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-900">Kết quả phân tích từ AI</h2>
        <p className="text-xs text-slate-500 mt-0.5">Vui lòng kiểm tra lại thông tin hệ thống vừa tự động bóc tách</p>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Original text */}
        <div className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nội dung bạn đã nhập</p>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">{originalText}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="border border-slate-300 rounded-xl p-3.5 bg-white">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mức độ khẩn cấp</p>
            <p className="text-sm font-black" style={{ color: urgency.color }}>{urgency.label}</p>
          </div>
          <div className="border border-slate-300 rounded-xl p-3.5 bg-white">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Độ chính xác địa chỉ</p>
            <p className="text-sm font-bold text-slate-900">{result.confidence}%</p>
          </div>
          <div className="border border-slate-300 rounded-xl p-3.5 bg-white sm:col-span-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Địa chỉ tìm kiếm được</p>
            <p className="text-sm font-bold text-slate-900">{result.address}</p>
          </div>
          <div className="border border-slate-300 rounded-xl p-3.5 bg-white sm:col-span-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Số điện thoại liên lạc</p>
            <p className="text-sm font-mono font-bold text-blue-700">{result.contact}</p>
          </div>
        </div>

        {/* Needs */}
        <div className="border border-slate-300 rounded-xl p-3.5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">Nhu cầu cần hỗ trợ khẩn cấp</p>
          <div className="flex flex-wrap gap-1.5">
            {result.needs.map((need) => (
              <span
                key={need}
                className="text-xs font-bold text-blue-800 bg-blue-50 border border-blue-300 rounded-lg px-3 py-1"
              >
                {need}
              </span>
            ))}
          </div>
        </div>

        {/* Confidence bar */}
        <div className="bg-slate-50 border border-slate-300 rounded-xl p-3.5">
          <div className="flex justify-between text-[11px] text-slate-600 font-bold mb-1.5">
            <span>Độ tin cậy xử lý dữ liệu định vị</span>
            <span>{result.confidence} / 100</span>
          </div>
          <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
            <div
              className={`h-full rounded-full transition-all duration-700 ${confidenceColor}`}
              style={{ width: `${result.confidence}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-1">
          <button
            onClick={onBack}
            className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            ← Nhập lại
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            Xác nhận thông tin →
          </button>
        </div>
      </div>
    </div>
  );
}