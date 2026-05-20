"use client";

import React, { useState, useEffect } from "react";
import { Users, Clock, CheckCircle, MapPin, ShieldCheck, RefreshCw, Eye, MapIcon } from "lucide-react";
import Link from "next/link";
import MapWrapper from "../../../components/MapWrapper";
import { useAuth } from "@/lib/useAuth";
import { getToken } from "@/lib/auth";

export default function AdminVolunteersPage() {
  const { user, loading: authLoading } = useAuth("ADMIN");
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [mapVols, setMapVols] = useState<any[]>([]);
  const [mapIncs, setMapIncs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const fetchAllData = async () => {
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const [volRes, locRes, incRes] = await Promise.all([
        fetch(`${baseUrl}/api/admin/volunteers`, { headers }),
        fetch(`${baseUrl}/api/admin/volunteers/locations`, { headers }),
        fetch(`${baseUrl}/api/admin/volunteers/incidents_lo`, { headers })
      ]);
      setVolunteers(await volRes.json());
      setMapVols(await locRes.json());
      setMapIncs(await incRes.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchAllData();
    const interval = setInterval(fetchAllData, 10000);
    return () => clearInterval(interval);
  }, [authLoading]);

  if (authLoading || loading) return <div className="p-10 text-center font-medium text-slate-500">Đang tải danh sách...</div>;

  return (
    <>
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Đội Tình Nguyện</h1>
          <p className="text-slate-500 mt-1">Quản lý và giám sát hoạt động cứu hộ</p>
        </div>
        <button onClick={fetchAllData} className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 transition flex items-center gap-2">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Làm mới
        </button>
      </header>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setViewMode("list")} className={`px-4 py-2 rounded-xl text-sm font-bold ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>Danh sách</button>
        <button onClick={() => setViewMode("map")} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${viewMode === "map" ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}><MapIcon size={16} /> Bản đồ Tracking</button>
      </div>

      {viewMode === "map" ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-[600px]">
          <MapWrapper volunteers={mapVols} incidents={mapIncs} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                  <th className="p-5 font-medium">Tên Đội / TNV</th>
                  <th className="p-5 font-medium">Vị trí hiện tại</th>
                  <th className="p-5 font-medium">Trạng thái</th>
                  <th className="p-5 font-medium text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
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
                      {vol.status === 'active' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100"><CheckCircle size={14} /> Rảnh rỗi</span>}
                      {vol.status === 'busy' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold border border-amber-100"><Clock size={14} /> Đang bận</span>}
                    </td>
                    <td className="p-5 text-right">
                      <Link href={`/admin/volunteers/${vol.id}`} className="inline-flex p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <Eye size={20} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
