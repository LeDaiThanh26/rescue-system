export type UrgencyLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type UrgencyMeta = {
  label: string;
  color: string;
  bg: string;
};

export const URGENCY_META: Record<UrgencyLevel, UrgencyMeta> = {
  CRITICAL: { label: "Khẩn cấp tuyệt đối", color: "#ff3b3b", bg: "rgba(255,59,59,0.12)" },
  HIGH:     { label: "Khẩn cấp cao",        color: "#ff8c00", bg: "rgba(255,140,0,0.12)"  },
  MEDIUM:   { label: "Cần tiếp tế",          color: "#f5c518", bg: "rgba(245,197,24,0.12)" },
  LOW:      { label: "Ổn định",              color: "#22c55e", bg: "rgba(34,197,94,0.12)"  },
};

export interface AIResult {
  address: string;
  urgency: UrgencyLevel;
  needs: string[];
  contact: string;
  lat: number | null;
  lng: number | null;
  confidence: number;
  source?: string;
}

export interface ReportPayload {
  rawText: string;
  aiExtractedAddress: { text: string };
  aiUrgency: UrgencyLevel;
  aiNeeds: string[];
  aiContact: string;
  geomLocation: string;
  geocodingConfidence: number;
}

export interface ReportResponse {
  success: boolean;
  caseCode: string;
  requestId: number;
  status: string;
  createdAt: string;
}

export type ReportStep = "input" | "ai-preview" | "address-confirm" | "success";

export interface StepMeta {
  id: ReportStep;
  label: string;
}

export const REPORT_STEPS: StepMeta[] = [
  { id: "input",           label: "Kêu cứu"  },
  { id: "ai-preview",      label: "Xem AI"   },
  { id: "address-confirm", label: "Địa chỉ"  },
  { id: "success",         label: "Hoàn tất" },
];
