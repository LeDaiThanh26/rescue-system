import axios from "axios";
import type { AIResult, UrgencyLevel } from "@/types/report";

const aiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AI_URL || "http://localhost",
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

export async function analyzeRescueText(text: string): Promise<AIResult> {
  const { data } = await aiClient.post("/ai/analyze", { text });

  return {
    address:    data.address    ?? "Không xác định",
    urgency:    (data.urgency as UrgencyLevel) ?? "MEDIUM",
    needs:      data.needs      ?? ["Hỗ trợ sơ tán"],
    contact:    data.contact    ?? "Không có",
    lat:        data.lat        ?? null,
    lng:        data.lng        ?? null,
    confidence: data.confidence ?? 50,
    source:     data.source,
  };
}
