import axios from "axios";
import type { ReportPayload, ReportResponse } from "@/types/report";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost",
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

export async function submitReport(payload: ReportPayload): Promise<ReportResponse> {
  const { data } = await apiClient.post<ReportResponse>("/api/report", payload);
  return data;
}
