"use client";

import React, { useState, useEffect } from "react";
import { Users, Clock, CheckCircle, MapPin, ShieldCheck, RefreshCw } from "lucide-react";

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVolunteers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/volunteers");
      const data = await res.json();
      setVolunteers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
    const interval = setInterval(fetchVolunteers, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="text-blue-500" /> Rescue Admin
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/20 text-blue-400 font-medium">
            <Users size={20} /> Tình nguyện viên
          </a>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Đội Tình Nguyện</h1>
            <p className="text-slate-500 mt-1">Quản lý và giám sát hoạt động cứu hộ</p>
          </div>
          <button onClick={fetchVolunteers} className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 transition flex items-center gap-2">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Làm mới
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Tổng lực lượng</p>
              <h3 className="text-3xl font-bold text-slate-800">{volunteers.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Đang làm nhiệm vụ</p>
              <h3 className="text-3xl font-bold text-amber-600">{volunteers.filter(v => v.status === "busy").length}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Sẵn sàng nhận lệnh</p>
              <h3 className="text-3xl font-bold text-emerald-600">{volunteers.filter(v => v.status === "active").length}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {loading && volunteers.length === 0 ? (
            <div className="p-10 text-center text-slate-500 font-medium">Đang tải dữ liệu...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                    <th className="p-5 font-medium">Tên Đội / TNV</th>
                    <th className="p-5 font-medium">Vị trí hiện tại</th>
                    <th className="p-5 font-medium">Trạng thái</th>
                    <th className="p-5 font-medium">Thống kê (Đang chạy / Xong)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {volunteers.length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-500">Chưa có dữ liệu</td></tr>
                  )}
                  {volunteers.map(vol => (
                    <tr key={vol.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-5">
                        <div className="font-bold text-slate-800">{vol.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Mã NV: #{vol.id}</div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                          <MapPin size={16} className="text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{vol.area}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        {vol.status === 'active' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100"><CheckCircle size={14}/> Rảnh rỗi</span>}
                        {vol.status === 'busy' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold border border-amber-100"><Clock size={14}/> Đang bận</span>}
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-4 text-sm font-medium">
                          <div className="flex items-center gap-1 text-amber-600"><Clock size={16} /> {vol.activeCases}</div>
                          <div className="flex items-center gap-1 text-emerald-600"><CheckCircle size={16} /> {vol.completedCases}</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
