"use client";
import { useState, useEffect } from "react";
import { Search, Filter, Download, Edit, UserPlus, Eye, X } from "lucide-react";
import Link from "next/link";
import { getUser, getToken } from "@/lib/auth";

export default function CasesList() {
  const [cases, setCases] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("");
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);


  useEffect(() => {
    fetchCases();
    fetchVolunteers();
  }, [filterStatus, filterUrgency]);

  const fetchCases = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    let url = `${baseUrl}/api/admin/cases?`;
    if (filterStatus) url += `status=${filterStatus}&`;
    if (filterUrgency) url += `urgencyLevel=${filterUrgency}`;
    
    const res = await fetch(url);
    const data = await res.json();
    setCases(Array.isArray(data) ? data : []);
  };

  const fetchVolunteers = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const token = getToken();
    const res = await fetch(`${baseUrl}/api/admin/volunteers`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    setVolunteers(Array.isArray(data) ? data : []);
  };

  const handleAssign = async (volunteerId: number) => {
    if (!selectedCaseId) return;
    const user = getUser();
    if (!user) return;

    setIsAssigning(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = getToken();
      const res = await fetch(`${baseUrl}/api/admin/cases/${selectedCaseId}/assign`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          volunteerId, 
          adminId: user.id 
        })
      });

      if (res.ok) {
        alert("Phân công thành công!");
        setIsModalOpen(false);
        fetchCases();
      } else {
        const errorData = await res.json();
        alert(`Lỗi: ${errorData.error || "Không thể phân công"}`);
      }
    } catch (err) {
      alert("Lỗi kết nối đến server");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleExportCSV = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    window.open(`${baseUrl}/api/admin/cases/export`, "_blank");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Ca Cứu Hộ</h1>
        <button onClick={handleExportCSV} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition">
          <Download size={18} /> Xuất báo cáo CSV
        </button>
      </div>

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
                  <button 
                    onClick={() => { setSelectedCaseId(item.id); setIsModalOpen(true); }}
                    className="p-2 text-green-600 hover:bg-green-50 rounded" 
                    title="Phân công đội"
                  >
                    <UserPlus size={18} />
                  </button>
                  <button className="p-2 text-orange-600 hover:bg-orange-50 rounded" title="Sửa lỗi AI">
                    <Edit size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Phân công Tình nguyện viên</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {volunteers.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Không có tình nguyện viên khả dụng</p>
              ) : (
                <div className="space-y-2">
                  {volunteers.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => handleAssign(v.id)}
                      disabled={isAssigning}
                      className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-green-50 hover:border-green-200 transition group"
                    >
                      <div className="text-left">
                        <p className="font-medium text-gray-800 group-hover:text-green-700">{v.name}</p>
                        <p className="text-xs text-gray-500">{v.area}</p>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${v.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {v.status === 'active' ? 'Sẵn sàng' : 'Đang bận'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}