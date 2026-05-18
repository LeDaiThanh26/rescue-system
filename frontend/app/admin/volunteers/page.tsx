"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Map as MapIcon, 
  Users, 
  Filter,
  MoreVertical,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";

export default function AdminVolunteersPage() {
  const [activeTab, setActiveTab] = useState("list");
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVolunteers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/volunteers");
      const data = await res.json();
      setVolunteers(data);
    } catch (error) {
      console.error("Failed to fetch volunteers", error);
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
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Mock */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="text-blue-500" />
          Rescue Admin
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition">
            <MapIcon size={20} /> Tổng quan
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/20 text-blue-400 font-medium transition">
            <Users size={20} /> Tình nguyện viên
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition">
            <AlertTriangle size={20} /> Sự cố & Cứu hộ
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Quản lý Tình nguyện viên</h1>
            <p className="text-slate-500 mt-1">Quản lý danh sách và theo dõi vị trí TNV</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Tìm kiếm TNV..." 
                className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64 transition"
              />
            </div>
            <button className="p-2.5 rounded-xl border border-slate-200 bg-white shadow-sm text-slate-600 hover:bg-slate-50 transition">
              <Filter size={20} />
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Tổng TNV / Đội</p>
              <h3 className="text-3xl font-bold text-slate-800">{volunteers.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
              <Users size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Đang làm nhiệm vụ</p>
              <h3 className="text-3xl font-bold text-amber-600">{volunteers.filter(v => v.status === "busy").length}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <Clock size={24} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl w-fit mb-6">
          <button 
            onClick={() => setActiveTab("list")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${activeTab === "list" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            Danh sách TNV
          </button>
          <button 
            onClick={() => setActiveTab("map")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${activeTab === "map" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            Bản đồ vị trí
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
          
          {loading && <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>}

          {/* TAB: DANH SÁCH */}
          {!loading && activeTab === "list" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                    <th className="p-4 font-medium">Tên TNV / Đội</th>
                    <th className="p-4 font-medium">Khu vực phụ trách</th>
                    <th className="p-4 font-medium">Trạng thái</th>
                    <th className="p-4 font-medium">Nhiệm vụ đang xử lý</th>
                    <th className="p-4 font-medium text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {volunteers.length === 0 && (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">Chưa có dữ liệu tình nguyện viên trong hệ thống.</td></tr>
                  )}
                  {volunteers.map(vol => (
                    <tr key={vol.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4">
                        <div className="font-medium text-slate-800">{vol.name}</div>
                        <div className="text-xs text-slate-500 mt-1">Mã TNV: #{vol.id}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <MapPin size={16} className="text-slate-400" />
                          {vol.area}
                        </div>
                      </td>
                      <td className="p-4">
                        {vol.status === 'active' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium border border-emerald-100"><CheckCircle size={14}/> Sẵn sàng</span>}
                        {vol.status === 'busy' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-medium border border-amber-100"><Clock size={14}/> Đang làm nhiệm vụ</span>}
                        {vol.status === 'offline' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">Ngoại tuyến</span>}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-100 rounded-full h-2 max-w-[100px]">
                            <div className="bg-blue-500 h-2 rounded-full" style={{width: `${Math.min(vol.activeCases * 33, 100)}%`}}></div>
                          </div>
                          <span className="text-sm font-medium text-slate-700">{vol.activeCases}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                          <MoreVertical size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: MAP */}
          {!loading && activeTab === "map" && (
            <div className="relative h-[500px] w-full bg-slate-100 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
              <div className="text-center relative z-10 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white max-w-sm">
                <MapIcon size={48} className="mx-auto text-blue-500 mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">Bản đồ Realtime</h3>
                <p className="text-slate-500 text-sm mb-4">Vị trí của {volunteers.length} đội TNV sẽ hiện tại đây theo dữ liệu currentLocation.</p>
                <div className="flex justify-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
                  <span className="text-xs font-medium text-slate-600">Đang đồng bộ tọa độ</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
