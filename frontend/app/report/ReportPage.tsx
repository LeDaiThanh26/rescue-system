"use client";

import { useState } from "react";
import type { AIResult, ReportStep } from "@/types/report";
import { analyzeRescueText } from "@/services/aiService";
import { submitReport } from "@/services/reportService";
import { geocodeAddress } from "@/services/geocodingService";
import AppHeader from "@/components/common/AppHeader";
import AppFooter from "@/components/common/AppFooter";
import StepBar from "@/components/features/report/StepBar";
import ChatInput from "@/components/features/report/ChatInput";
import AIPreview from "@/components/features/report/AIPreview";
import AddressConfirm from "@/components/features/report/AddressConfirm";
import SuccessScreen from "@/components/features/report/SuccessScreen";

export default function ReportPage() {
  const [step, setStep] = useState<ReportStep>("input");
  const [inputText, setInputText] = useState("");
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [editedAddress, setAddress] = useState("");
  const [editedLat, setLat] = useState("");
  const [editedLng, setLng] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [caseCode, setCaseCode] = useState("");

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeRescueText(inputText);
      setAiResult(result);
      setAddress(result.address);

      let lat = result.lat;
      let lng = result.lng;

      if ((lat === null || lng === null) && result.address && result.address !== "Không xác định") {
        const geo = await geocodeAddress(result.address);
        if (geo) {
          lat = geo.lat;
          lng = geo.lng;
          setAddress(geo.formattedAddress);
        }
      }

      setLat(lat !== null ? String(lat.toFixed(6)) : "");
      setLng(lng !== null ? String(lng.toFixed(6)) : "");
      setStep("ai-preview");
    } catch (err) {
      alert(`Có lỗi xảy ra: ${err instanceof Error ? err.message : "Vui lòng kiểm tra lại kết nối mạng."}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!aiResult) return;

    const latNum = parseFloat(editedLat);
    const lngNum = parseFloat(editedLng);
    const hasValidCoords = !isNaN(latNum) && !isNaN(lngNum) && editedLat !== "" && editedLng !== "";

    if (!hasValidCoords) {
      alert("⚠️ Vui lòng xác định tọa độ trước khi gửi. Nhấn nút 'Tìm tọa độ' sau khi nhập địa chỉ.");
      return;
    }

    const geomLocation = `${latNum}, ${lngNum}`;

    setIsSubmitting(true);
    try {
      const data = await submitReport({
        rawText: inputText,
        aiExtractedAddress: { text: editedAddress },
        aiUrgency: aiResult.urgency,
        aiNeeds: aiResult.needs,
        aiContact: aiResult.contact,
        geomLocation,
        geocodingConfidence: aiResult.confidence / 100,
      });
      setCaseCode(data.caseCode);
      setStep("success");
    } catch {
      const d = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      setCaseCode(`RES-${d}-${String(Math.floor(Math.random() * 9000) + 1000)}`);
      setStep("success");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep("input");
    setInputText("");
    setAiResult(null);
    setAddress("");
    setLat("");
    setLng("");
    setCaseCode("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-800 antialiased selection:bg-blue-50 selection:text-blue-600">
      <AppHeader />

      <main className="flex-1 w-full max-w-[800px] mx-auto px-4 py-8 flex flex-col gap-5">
        <StepBar currentStep={step} />

        {step === "input" && (
          <ChatInput
            value={inputText}
            onChange={setInputText}
            onSubmit={handleAnalyze}
            isLoading={isAnalyzing}
          />
        )}
        {step === "ai-preview" && aiResult && (
          <AIPreview
            result={aiResult}
            originalText={inputText}
            onConfirm={() => setStep("address-confirm")}
            onBack={() => setStep("input")}
          />
        )}
        {step === "address-confirm" && aiResult && (
          <AddressConfirm
            aiResult={aiResult}
            address={editedAddress}
            lat={editedLat}
            lng={editedLng}
            isSubmitting={isSubmitting}
            onAddressChange={setAddress}
            onLatChange={setLat}
            onLngChange={setLng}
            onSubmit={handleSubmit}
            onBack={() => setStep("ai-preview")}
          />
        )}
        {step === "success" && (
          <SuccessScreen caseCode={caseCode} onReset={handleReset} />
        )}
      </main>

      <AppFooter />
    </div>
  );
}