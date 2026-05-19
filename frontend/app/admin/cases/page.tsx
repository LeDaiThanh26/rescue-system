"use client";
import { useState, useEffect } from "react";
import { Search, Filter, Download, Edit, UserPlus, Eye } from "lucide-react";
import Link from "next/link";

export default function CasesList() {
  const [cases, setCases] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("");

  // Gọi API lấy danh sách
  useEffect(() => {
    fetchCases();
  }, [filterStatus, filterUrgency]);

  const fetchCases = async () => {
    let url = "http://localhost:5000/api/admin/cases?";
    if (filterStatus) url += `status=${filterStatus}&`;
    if (filterUrgency) url += `urgencyLevel=${filterUrgency}`;
    
    const res = await fetch(url);
    const data = await res.json();
    setCases(Array.isArray(data) ? data : []);
  };

  // Nút gọi API Xuất CSV (Mở tab mới để trình duyệt tự tải file)
  const handleExportCSV = () => {
    window.open("http://localhost:5000/api/admin/cases/export", "_blank");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Ca Cứu Hộ</h1>
        {/* Module: Xuất báo cáo */}
        <button onClick={handleExportCSV} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition">
          <Download size={18} /> Xuất báo cáo CSV
        </button>
      </div>

      {/* Module: Bộ lọc nâng cao */}
      <div className="flex gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center gap-2 border rounded px-3 py-2 w-1/3">
          <Filter size={18} className="text-gray-400" />
          <select className="w-full outline-none bg-transparent" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Tất cả Trạng thái</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="ASSIGNED">Đã phân công</option>
            <option value="COMPLETED">Hoàn thành</option>
          </select>
        </div>
        <div className="flex items-center gap-2 border rounded px-3 py-2 w-1/3">
          <Search size={18} className="text-gray-400" />
          <select className="w-full outline-none bg-transparent" value={filterUrgency} onChange={(e) => setFilterUrgency(e.target.value)}>
            <option value="">Tất cả Mức độ</option>
            <option value="Đỏ">Khẩn cấp (Đỏ)</option>
            <option value="Vàng">Cần tiếp tế (Vàng)</option>
          </select>
        </div>
      </div>

      {/* Module: Bảng danh sách case */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700 border-b">
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold w-1/3">Địa chỉ (AI Trích xuất)</th>
              <th className="p-4 font-semibold">Mức độ</th>
              <th className="p-4 font-semibold">Trạng thái</th>
              <th className="p-4 font-semibold text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-4">#{item.id}</td>
                <td className="p-4 truncate">{item.aiAddress}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.urgencyLevel === "Đỏ" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"}`}>
                    {item.urgencyLevel}
                  </span>
                </td>
                <td className="p-4">{item.status}</td>
                <td className="p-4 flex justify-center gap-2">
                  <Link href={`/admin/cases/${item.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Xem chi tiết">
                    <Eye size={18} />
                  </Link>
                  {/* Module: Phân công (Mô phỏng gọi Modal) */}
                  <button className="p-2 text-green-600 hover:bg-green-50 rounded" title="Phân công đội">
                    <UserPlus size={18} />
                  </button>
                  {/* Module: Chỉnh sửa thủ công */}
                  <button className="p-2 text-orange-600 hover:bg-orange-50 rounded" title="Sửa lỗi AI">
                    <Edit size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}