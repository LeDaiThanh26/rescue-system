"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { AlertCircle, MapPin, Clock, Phone, User } from "lucide-react";

const MiniMap = dynamic(() => import("../../../components/MiniMap"), { ssr: false });

export default function CaseDetail() {
  const params = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${baseUrl}/api/admin/cases/${params.id}`);
      const json = await res.json();
      setData(json);
    };
    fetchDetail();
  }, [params.id]);

  if (!data) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  const coords = data.aiData.location ? data.aiData.location.split(",") : ["16.0544", "108.2022"];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Chi tiết Ca cứu hộ #{params.id}</h1>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          
          <div className="bg-white p-5 rounded-lg shadow-sm border border-l-4 border-l-blue-500">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
              <AlertCircle size={18} /> Tin nhắn khẩn cấp gốc (SMS/Web)
            </h3>
            <p className="text-gray-600 italic bg-gray-50 p-3 rounded border">"{data.rawMessage}"</p>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-gray-700 mb-4">Kết quả AI bóc tách</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded">
                <span className="block text-sm text-gray-500">Địa chỉ</span>
                <span className="font-medium text-gray-800">{data.aiData.address}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <span className="block text-sm text-gray-500">Mức độ</span>
                <span className={`font-bold ${data.aiData.urgency === "Đỏ" ? "text-red-600" : "text-yellow-600"}`}>
                  {data.aiData.urgency}
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded col-span-2">
                <span className="block text-sm text-gray-500">Nhu cầu (JSON)</span>
                <pre className="text-sm text-gray-700 mt-1">{JSON.stringify(data.aiData.needs, null, 2)}</pre>
              </div>
            </div>
          </div>

          {data.teamInfo ? (
            <div className="bg-white p-5 rounded-lg shadow-sm border border-l-4 border-l-green-500">
              <h3 className="font-semibold text-gray-700 mb-3">Đội đang phụ trách</h3>
              <div className="flex gap-6">
                <p className="flex items-center gap-2 text-gray-700"><User size={18} /> {data.teamInfo.fullName}</p>
                <p className="flex items-center gap-2 text-gray-700"><Phone size={18} /> 0905.xxx.xxx</p>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg border border-yellow-200">
              Ca này chưa được phân công cho đội nào.
            </div>
          )}
        </div>

        <div className="space-y-6">
          
          <div className="bg-white p-5 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
              <MapPin size={18} /> Tọa độ (Geocoding)
            </h3>
            <MiniMap lat={parseFloat(coords[0])} lng={parseFloat(coords[1])} address={data.aiData.address} />
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-4">
              <Clock size={18} /> Lịch sử xử lý
            </h3>
            <div className="relative border-l-2 border-blue-200 ml-3">
              {data.timeline.map((step: any, index: number) => (
                <div key={index} className="mb-6 ml-6 relative">
                  <div className="absolute -left-[31px] bg-blue-500 h-4 w-4 rounded-full border-4 border-white"></div>
                  <h4 className="font-semibold text-gray-800">{step.status}</h4>
                  <p className="text-sm text-gray-500">{new Date(step.time).toLocaleString("vi-VN")}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}