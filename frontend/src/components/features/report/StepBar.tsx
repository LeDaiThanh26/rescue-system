import { REPORT_STEPS } from "@/types/report";
import type { ReportStep } from "@/types/report";

interface StepBarProps {
  currentStep: ReportStep;
}

export default function StepBar({ currentStep }: StepBarProps) {
  const currentIdx = REPORT_STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center shadow-sm">
      {REPORT_STEPS.map((step, idx) => {
        const isDone = idx < currentIdx;
        const isActive = idx === currentIdx;

        return (
          <div key={step.id} className="flex items-center flex-1 min-w-0">
            {/* Node */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`
                  w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0
                  text-[11px] font-bold transition-all border
                  ${isDone ? "bg-emerald-50 border-emerald-400 text-emerald-700" : ""}
                  ${isActive ? "bg-blue-600 border-blue-600 text-white shadow-sm" : ""}
                  ${!isDone && !isActive ? "bg-slate-50 border-slate-300 text-slate-500" : ""}
                `}
              >
                {isDone ? "✓" : String(idx + 1).padStart(2, "0")}
              </div>
              <span
                className={`
                  text-xs hidden sm:block truncate tracking-wide
                  ${isActive ? "text-slate-900 font-bold" : ""}
                  ${isDone ? "text-slate-600 font-semibold" : ""}
                  ${!isDone && !isActive ? "text-slate-400 font-medium" : ""}
                `}
              >
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {idx < REPORT_STEPS.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-3 min-w-[12px] transition-colors
                  ${isDone ? "bg-emerald-400" : "bg-slate-300"}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}