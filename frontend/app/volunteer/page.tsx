"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Navigation, CheckCircle2, ShieldAlert, ArrowRight, X } from "lucide-react";
import MapWrapper from "../../components/MapWrapper";
import { useAuth } from "@/lib/useAuth";
import { getToken } from "@/lib/auth";

export default function VolunteerDashboard() {
  const { user, loading: authLoading, logout } = useAuth("VOLUNTEER");
  const [missions, setMissions] = useState<any[]>([]);
  const [missionDetail, setMissionDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentLoc, setCurrentLoc] = useState<string>("10.762622, 106.660172");

  const fetchMissions = async () => {
    try {
      const token = getToken();
      const res = await fetch("http://localhost:5000/api/volunteer/missions", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMissions(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchMissions();
    const token = getToken();
    const evtSource = new EventSource(`http://localhost:5000/api/volunteer/stream?token=${token}`);
    evtSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "NEW_MISSION") fetchMissions();
    };
    return () => evtSource.close();
  }, [authLoading]);

  useEffect(() => {
    if (authLoading) return;
    let watchId: number;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const locString = `${pos.coords.latitude}, ${pos.coords.longitude}`;
          setCurrentLoc(locString);
          const token = getToken();
          fetch("http://localhost:5000/api/volunteer/location", {
            method: "PATCH",
            headers: { 
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ location: locString })
          }).catch(console.error);
        },
        () => { },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 }
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [authLoading]);

  const activeMission = missions.find(m => m.startedAt && m.status !== "DONE");
  useEffect(() => {
    if (activeMission) {
      const token = getToken();
      fetch(`http://localhost:5000/api/volunteer/missions/${activeMission.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => setMissionDetail(data));
    } else {
      setMissionDetail(null);
    }
  }, [activeMission]);

  const handleAction = async (id: number, action: string, status?: string) => {
    const url = `http://localhost:5000/api/volunteer/missions/${id}/${action}`;
    try {
      const token = getToken();
      await fetch(url, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: status ? JSON.stringify({ status }) : null
      });
      fetchMissions();
    } catch (error) {
      console.error(error);
    }
  };

  if (authLoading || loading) return <div className="flex h-screen items-center justify-center font-medium">Đang tải...</div>;
  const pendingMissions = missions.filter(m => !m.startedAt && m.status !== "DONE");

  const mapVols = [{ location: currentLoc, name: "Vị trí của bạn" }];
  const mapIncs: any[] = [];

  if (missionDetail?.incident) {
    const inc = missionDetail.incident;
    const loc = inc.geomLocation || inc.location;
    const addr = inc.aiAddress || inc.address || "Sự cố đang xử lý";
    
    if (loc) mapIncs.push({ location: loc, address: addr });
  }

  pendingMissions.forEach(m => {
    if (m.incident) {
      const loc = m.incident.geomLocation || m.incident.location;
      const addr = m.incident.aiAddress || m.incident.address || "Sự cố chờ nhận lệnh";
      
      if (loc) mapIncs.push({ location: loc, address: addr });
    }
  });

  let mapCenter = [10.762622, 106.660172] as [number, number];
  if (currentLoc) mapCenter = currentLoc.split(',').map(Number) as [number, number];
  else if (mapIncs.length > 0) mapCenter = mapIncs[0].location.split(',').map(Number) as [number, number];

  return (
    <div className="bg-slate-100 min-h-[100dvh] flex items-center justify-center md:p-6 fixed md:relative inset-0 overflow-hidden">
      <div className="w-full h-full md:h-[800px] md:max-w-[400px] bg-slate-50 md:rounded-[2.5rem] md:border-[10px] md:border-slate-800 shadow-2xl overflow-hidden flex flex-col relative font-sans">

        <header className="bg-blue-600 text-white p-5 shadow-md shrink-0 relative z-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <ShieldAlert size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Cứu Hộ Nhanh</h1>
              <p className="text-blue-200 text-xs">{user?.fullName || "Sẵn sàng nhận nhiệm vụ"}</p>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/20 transition font-bold"
          >
            Đăng xuất
          </button>
        </header>

        <div className="h-[250px] w-full shrink-0 relative z-0 border-b border-slate-200 bg-slate-200">
          <MapWrapper volunteers={mapVols} incidents={mapIncs} />
          {currentLoc && (
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-md z-[400] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> GPS Bật
            </div>
          )}
        </div>

        <main className="p-4 space-y-6 flex-1 overflow-y-auto relative z-10 bg-slate-50">

          {activeMission && missionDetail ? (
            <section className="animate-in fade-in duration-500">
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-slate-800">Đang thực hiện</h3>
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md uppercase">Mức: {missionDetail.incident?.urgencyLevel}</span>
                </div>
                <p className="text-xl font-bold text-slate-800 mb-2">{missionDetail.incident?.rawMessage}</p>
                <div className="flex items-start gap-2 text-slate-500 text-sm mb-6">
                  <MapPin size={16} className="mt-0.5 text-slate-400 shrink-0" />
                  <span>{missionDetail.incident?.aiAddress || missionDetail.incident?.geomLocation}</span>
                </div>

                {activeMission.status === "EN_ROUTE" ? (
                  <button
                    onClick={() => handleAction(activeMission.id, 'status', 'ON_SITE')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition shadow-md shadow-blue-200"
                  >
                    <Navigation size={20} /> Đã đến hiện trường
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction(activeMission.id, 'status', 'DONE')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition shadow-md shadow-emerald-200"
                  >
                    <CheckCircle2 size={20} /> Hoàn thành nhiệm vụ
                  </button>
                )}
              </div>
            </section>
          ) : (
            !pendingMissions.length && (
              <div className="bg-emerald-50 text-emerald-700 p-6 rounded-3xl text-center border border-emerald-100 mt-2">
                <CheckCircle2 size={32} className="mx-auto mb-2 opacity-80" />
                <h3 className="font-bold">Đang rảnh rỗi</h3>
                <p className="text-sm opacity-80 mt-1">Chưa có nhiệm vụ phân công</p>
              </div>
            )
          )}

          {pendingMissions.length > 0 && (
            <section className="animate-in fade-in duration-500">
              <h2 className="text-lg font-bold text-slate-800 mb-3">Chờ xác nhận ({pendingMissions.length})</h2>
              <div className="space-y-4">
                {pendingMissions.map((m) => (
                  <div key={m.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative">
                    <h4 className="font-bold text-slate-800 text-lg mb-1">{m.incident?.message}</h4>
                    <p className="text-sm text-slate-500 flex items-start gap-1.5 mb-4">
                      <MapPin size={16} className="mt-0.5 text-slate-400 shrink-0" /> {m.incident?.address}
                    </p>
                    <div className="flex gap-3">
                      <button onClick={() => handleAction(m.id, 'reject')} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-medium flex items-center justify-center gap-1">
                        <X size={18} /> Từ chối
                      </button>
                      <button onClick={() => handleAction(m.id, 'accept')} className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-1 shadow-md shadow-blue-200">
                        Nhận lệnh <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
