"use client";
import { useState, useEffect } from "react";
import { Search, Filter, Download, Edit, UserPlus, Eye, X, RefreshCw } from "lucide-react";
import Link from "next/link";
import { getUser, getToken } from "@/lib/auth";

export default function CasesList() {
  const [cases, setCases] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);


  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedCaseForAssign, setSelectedCaseForAssign] = useState<any>(null);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCaseForEdit, setSelectedCaseForEdit] = useState<any>(null);
  const [editAddress, setEditAddress] = useState("");
  const [editUrgency, setEditUrgency] = useState("");

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
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = getToken(); 
      const res = await fetch(`${baseUrl}/api/admin/volunteers`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      setVolunteers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi lấy danh sách TNV", error);
    }
  };

  const handleOpenAssignModal = (item: any) => {
    setSelectedCaseForAssign(item);
    setSelectedVolunteerId("");
    setIsAssignModalOpen(true);
  };

  const submitAssign = async () => {
    if (!selectedVolunteerId) {
      alert("Vui lòng chọn tình nguyện viên!");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/admin/cases/${selectedCaseForAssign.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volunteerId: selectedVolunteerId, adminId: 1 }), 
      });
      if (res.ok) {
        alert("Phân công thành công!");
        setIsAssignModalOpen(false);
        fetchCases(); 
      }
    } catch (error) {
      alert("Lỗi khi phân công");
    }
  };

  const handleOpenEditModal = (item: any) => {
    setSelectedCaseForEdit(item);
    setEditAddress(item.aiAddress);

    let dbUrgency = "LOW";
    if (item.urgencyLevel === "Đỏ") dbUrgency = "CRITICAL";
    else if (item.urgencyLevel === "Cam") dbUrgency = "HIGH";
    else if (item.urgencyLevel === "Vàng") dbUrgency = "MEDIUM";
    else if (item.urgencyLevel === "Xanh") dbUrgency = "LOW";

    setEditUrgency(dbUrgency);
    setIsEditModalOpen(true);
  };

  const submitEdit = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/cases/${selectedCaseForEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiAddress: editAddress, urgencyLevel: editUrgency }),
      });
      if (res.ok) {
        alert("Cập nhật thành công!");
        setIsEditModalOpen(false);
        fetchCases(); 
      }
    } catch (error) {
      alert("Lỗi khi cập nhật");
    }
  };

  const handleSyncAI = async () => {
    if (isSyncing) return; 
    setIsSyncing(true); 
    try {
      const res = await fetch("http://localhost:5000/api/admin/cases/sync", { method: "POST" });
      const result = await res.json();
      alert(result.message); 
      fetchCases(); 
    } catch (error) {
      alert("Lỗi kết nối khi đồng bộ!");
    } finally {
      setIsSyncing(false); 
    }
  };

  const handleExportCSV = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    window.open(`${baseUrl}/api/admin/cases/export`, "_blank");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Ca Cứu Hộ</h1>
        <div className="flex gap-2">
          <button 
            onClick={handleSyncAI} 
            disabled={isSyncing}
            className={`flex items-center gap-2 px-4 py-2 rounded shadow transition text-white ${
              isSyncing ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} /> 
            {isSyncing ? "Đang phân tích AI..." : "Quét dữ liệu người dân"}
          </button>

          <button onClick={handleExportCSV} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition">
            <Download size={18} /> Xuất báo cáo CSV
          </button>
        </div>
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
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    item.urgencyLevel === "Đỏ" ? "bg-red-100 text-red-600" : 
                    item.urgencyLevel === "Cam" ? "bg-orange-100 text-orange-600" : 
                    item.urgencyLevel === "Vàng" ? "bg-yellow-100 text-yellow-700" : 
                    "bg-green-100 text-green-700"
                  }`}>
                    {item.urgencyLevel}
                  </span>
                </td>
                <td className="p-4">{item.status}</td>
                <td className="p-4 flex justify-center gap-2">
                  <Link href={`/admin/cases/${item.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Xem chi tiết">
                    <Eye size={18} />
                  </Link>

                  {item.status === "PENDING" ? (
                    <button onClick={() => handleOpenAssignModal(item)} className="p-2 text-green-600 hover:bg-green-50 rounded" title="Phân công đội">
                      <UserPlus size={18} />
                    </button>
                  ) : (
                    <button disabled className="p-2 text-gray-300 cursor-not-allowed rounded" title="Ca này đã được phân công">
                      <UserPlus size={18} />
                    </button>
                  )}

                  <button onClick={() => handleOpenEditModal(item)} className="p-2 text-orange-600 hover:bg-orange-50 rounded" title="Sửa lỗi AI">
                    <Edit size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Phân công cứu hộ</h2>
              <button onClick={() => setIsAssignModalOpen(false)}><X size={20} className="text-gray-500 hover:text-red-500"/></button>
            </div>
            <p className="mb-4 text-sm text-gray-600">Đang phân công cho ca <strong>#{selectedCaseForAssign?.id}</strong></p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Chọn Đội / Tình nguyện viên (Đang rảnh):</label>
              <select 
                className="w-full border rounded p-2 outline-none"
                value={selectedVolunteerId}
                onChange={(e) => setSelectedVolunteerId(e.target.value)}
              >
                <option value="">-- Chọn tình nguyện viên --</option>
                {volunteers
                  .filter(vol => vol.status === 'active')
                  .map(vol => (
                    <option key={vol.id} value={vol.id}>
                      {vol.name} - {vol.area}
                    </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsAssignModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Hủy</button>
              <button onClick={submitAssign} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Xác nhận</button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Sửa lỗi AI trích xuất</h2>
              <button onClick={() => setIsEditModalOpen(false)}><X size={20} className="text-gray-500 hover:text-red-500"/></button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ (AI nhận diện):</label>
              <textarea 
                className="w-full border rounded p-2 outline-none"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                rows={3}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ khẩn cấp:</label>
              <select 
                className="w-full border rounded p-2 outline-none" 
                value={editUrgency} 
                onChange={(e) => setEditUrgency(e.target.value)}
              >
                <option value="CRITICAL">Nguy kịch (Đỏ)</option>
                <option value="HIGH">Khẩn cấp cao (Cam)</option>
                <option value="MEDIUM">Cần tiếp tế (Vàng)</option>
                <option value="LOW">Ổn định (Xanh)</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Hủy</button>
              <button onClick={submitEdit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}