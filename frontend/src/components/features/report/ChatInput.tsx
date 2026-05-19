"use client";

import { useRef, useEffect } from "react";
import { SUGGESTION_TEMPLATES } from "@/constants/report";

interface ChatInputProps {
  value: string;
  onChange: (text: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function ChatInput({ value, onChange, onSubmit, isLoading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSubmit = value.trim().length >= 10;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [value]);

  return (
    <div className="bg-white border-2 border-blue-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b-2 border-blue-100 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-900">Gửi thông tin kêu cứu</h2>
        <p className="text-xs text-slate-500 mt-0.5">Mô tả rõ tình trạng — Trợ lý AI sẽ tự động xử lý và trích xuất</p>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Suggestion chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-bold">Mẫu gợi ý:</span>
          {SUGGESTION_TEMPLATES.map((t, i) => (
            <button
              key={i}
              onClick={() => { onChange(t); textareaRef.current?.focus(); }}
              className="text-xs text-slate-700 bg-white border border-slate-300 rounded-lg px-3 py-1 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all font-medium"
            >
              Mẫu #{i + 1}
            </button>
          ))}
        </div>

        {/* Textarea */}
        <div className="border border-slate-300 rounded-xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all overflow-hidden">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ví dụ: Nhà tôi ở số 45 đường Lê Lợi, phường Bến Nghé, Quận 1. Hiện lụt ngập hơn 1m nước, có 2 người già cần hỗ trợ sơ tán gấp. SĐT liên hệ: 0901234567"
            rows={5}
            maxLength={2000}
            className="w-full px-4 py-3 text-sm text-slate-900 placeholder-slate-400 bg-transparent outline-none resize-none leading-relaxed min-h-[120px]"
          />
          <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 font-medium">
            <span>Vui lòng ghi địa chỉ kèm số điện thoại rõ ràng để định vị nhanh nhất</span>
            <span className={value.length > 1800 ? "text-orange-600 font-bold" : "text-slate-400"}>
              {value.length}/2000
            </span>
          </div>
        </div>

        {/* Info Box */}
        <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-800 leading-relaxed font-medium">
          <span className="flex-shrink-0 text-blue-600 font-bold">ℹ</span>
          <span>Hệ thống áp dụng công nghệ xử lý ngôn ngữ tự nhiên để nhận diện nhanh nhu cầu, giúp đội ứng cứu tiếp cận đúng vị trí nhanh nhất.</span>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            onClick={onSubmit}
            disabled={!canSubmit || isLoading}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm
              ${canSubmit && !isLoading
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
              }
            `}
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Đang xử lý dữ liệu...
              </>
            ) : (
              "Phân tích và tiếp tục →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}