"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Navigation, CheckCircle2, ShieldAlert, ArrowRight, X, Clock } from "lucide-react";

export default function VolunteerDashboard() {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMissions = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/volunteer/missions");
      const data = await res.json();
      setMissions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();

    const evtSource = new EventSource("http://localhost:5000/api/volunteer/stream");
    evtSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "NEW_MISSION") {
        fetchMissions();
      }
    };
    return () => evtSource.close();
  }, []);

  useEffect(() => {
    const updateLoc = () => {
      fetch("http://localhost:5000/api/volunteer/location", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: "10.7626, 106.6601" })
      }).catch(console.error);
    };
    updateLoc();
    const interval = setInterval(updateLoc, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id: number, action: string, status?: string) => {
    const url = `http://localhost:5000/api/volunteer/missions/${id}/${action}`;
    const body = status ? JSON.stringify({ status }) : null;

    try {
      await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body
      });
      fetchMissions();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-slate-500 font-medium">Đang tải...</div>;
  }

  const activeMission = missions.find(m => m.startedAt && m.status !== "DONE");
  const pendingMissions = missions.filter(m => !m.startedAt && m.status !== "DONE");

  return (
    <div className="min-h-screen bg-slate-50 pb-8 font-sans max-w-md mx-auto shadow-2xl relative overflow-hidden">
      <header className="bg-blue-600 text-white p-5 sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <ShieldAlert size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Cứu Hộ Nhanh</h1>
            <p className="text-blue-200 text-xs">Sẵn sàng nhận nhiệm vụ</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Active Mission */}
        {activeMission ? (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end mb-3">
              <h2 className="text-lg font-bold text-slate-800">Đang thực hiện</h2>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">ID: {activeMission.id}</span>
            </div>
            
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight">{activeMission.incident?.message}</h3>
              <div className="flex items-start gap-2 text-slate-500 text-sm mb-6">
                <MapPin size={16} className="mt-0.5 text-red-500 flex-shrink-0" />
                <span>{activeMission.incident?.address}</span>
              </div>

              {activeMission.status === "EN_ROUTE" ? (
                <button 
                  onClick={() => handleAction(activeMission.id, 'status', 'ON_SITE')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition"
                >
                  <Navigation size={20} /> Đã đến hiện trường
                </button>
              ) : (
                <button 
                  onClick={() => handleAction(activeMission.id, 'status', 'DONE')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition"
                >
                  <CheckCircle2 size={20} /> Hoàn thành nhiệm vụ
                </button>
              )}
            </div>
          </section>
        ) : (
          <div className="bg-emerald-50 text-emerald-700 p-8 rounded-3xl text-center border border-emerald-100 mt-4">
            <CheckCircle2 size={40} className="mx-auto mb-3 opacity-80" />
            <h3 className="text-lg font-bold">Đang rảnh rỗi</h3>
            <p className="text-sm mt-1 opacity-80">Chưa có nhiệm vụ nào đang chạy.</p>
          </div>
        )}

        {/* Pending Missions */}
        {pendingMissions.length > 0 && (
          <section className="animate-in fade-in duration-500">
            <h2 className="text-lg font-bold text-slate-800 mb-3">Chờ xác nhận ({pendingMissions.length})</h2>
            <div className="space-y-4">
              {pendingMissions.map((m) => (
                <div key={m.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative">
                  {m.incident?.urgency === "High" && (
                    <span className="absolute -top-3 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm animate-pulse">
                      KHẨN CẤP
                    </span>
                  )}
                  <h4 className="font-bold text-slate-800 text-lg mb-1">{m.incident?.message}</h4>
                  <p className="text-sm text-slate-500 flex items-start gap-1.5 mb-4">
                    <MapPin size={16} className="mt-0.5 text-slate-400 shrink-0"/> {m.incident?.address}
                  </p>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleAction(m.id, 'reject')}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-medium flex items-center justify-center gap-1 transition"
                    >
                      <X size={18} /> Từ chối
                    </button>
                    <button 
                      onClick={() => handleAction(m.id, 'accept')}
                      className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-1 transition shadow-md shadow-blue-200"
                    >
                      Nhận nhiệm vụ <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
