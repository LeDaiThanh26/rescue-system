import type { Metadata } from "next";
import ReportPage from "./ReportPage";

export const metadata: Metadata = {
  title: "Kêu Cứu Khẩn Cấp | Hệ Thống Cứu Hộ",
  description: "Gửi yêu cầu cứu hộ khẩn cấp. AI sẽ tự động phân tích và điều phối lực lượng cứu hộ đến đúng vị trí.",
};

export default function Page() {
  return <ReportPage />;
}
