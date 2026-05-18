"use client";

import React, { useState, useEffect } from "react";
import { 
  Bell, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Camera, 
  FileText, 
  ShieldAlert,
  ArrowRight,
  Clock,
  Menu
} from "lucide-react";

export default function VolunteerDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/volunteer/dashboard");
      const json = await res.json();
      setData(json);
      if (json.queueCases && json.queueCases.length > 0) {
          setShowNotification(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async () => {
    if (!data?.activeCase) return;
    const current = data.activeCase.status; // 'en_route', 'on_site', 'done'
    let nextStatus = "ON_SITE";
    if (current === "on_site") nextStatus = "DONE";
    
    try {
        await fetch(`http://localhost:5000/api/volunteer/mission/${data.activeCase.id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: nextStatus })
        });
        fetchDashboard();
    } catch (error) {
        console.error(error);
    }
  };

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">Đang tải dữ liệu nhiệm vụ từ hệ thống...</div>;
  }

  const activeCase = data?.activeCase;
  const queueCases = data?.queueCases || [];
  const status = activeCase?.status || 'done';

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 font-sans max-w-md mx-auto md:max-w-none shadow-2xl relative overflow-hidden">
      
      {/* App Header */}
      <header className="bg-blue-600 text-white p-4 sticky top-0 z-20 shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <ShieldAlert size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Ứng dụng Tình nguyện viên</h1>
              <p className="text-blue-200 text-xs">Sẵn sàng nhận nhiệm vụ</p>
            </div>
          </div>
          <button className="p-2 bg-white/10 rounded-full relative">
            <Bell size={20} />
            {showNotification && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-blue-600"></span>}
          </button>
        </div>
      </header>

      {/* SSE / Push Notification Mock */}
      {showNotification && queueCases.length > 0 && (
        <div className="absolute top-20 left-4 right-4 z-30 bg-white p-4 rounded-2xl shadow-xl border border-red-100 animate-in slide-in-from-top fade-in duration-300">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 animate-pulse">
              <ShieldAlert className="text-red-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                Nhiệm vụ ĐƯỢC GIAO <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded uppercase">{queueCases[0].priority}</span>
              </h3>
              <p className="text-sm text-slate-600 mt-0.5 line-clamp-2">{queueCases[0].title}</p>
              <div className="mt-3 flex gap-2">
                <button 
                  onClick={() => setShowNotification(false)}
                  className="flex-1 bg-red-600 text-white py-2 rounded-xl text-sm font-bold shadow-md shadow-red-200"
                >
                  Đã nhận thông tin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="p-4 space-y-6">
        
        {/* Bản đồ dẫn đường Placeholder */}
        {activeCase && (
        <section className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="h-48 bg-slate-200 rounded-2xl relative overflow-hidden flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Map mock" 
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            
            <div className="relative z-10 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-white flex items-center gap-4">
              <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                <Navigation size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đang chỉ đường</p>
                <p className="text-xl font-black text-slate-800">Theo GPS <span className="text-sm font-medium text-slate-500"></span></p>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* Thông tin Case đang xử lý */}
        {activeCase ? (
        <section>
          <div className="flex justify-between items-end mb-3 px-1">
            <h2 className="text-lg font-bold text-slate-800">Đang xử lý</h2>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">INCIDENT-{activeCase.incidentId}</span>
          </div>
          
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight">{activeCase.title}</h3>
            <div className="flex items-start gap-2 text-slate-500 text-sm mb-6">
              <MapPin size={16} className="mt-0.5 text-red-500 flex-shrink-0" />
              <span>{activeCase.address}</span>
            </div>

            {/* Cập nhật trạng thái */}
            <div className="bg-slate-50 rounded-2xl p-2 flex relative">
              <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-200 -translate-y-1/2 z-0 rounded-full"></div>
              <div className={`absolute top-1/2 left-8 h-1 bg-blue-500 -translate-y-1/2 z-0 rounded-full transition-all duration-500 ${status === 'en_route' ? 'w-[10%]' : status === 'on_site' ? 'w-[50%]' : 'w-[90%]'}`}></div>
              
              <button 
                className={`relative z-10 flex-1 py-3 text-xs font-bold flex flex-col items-center gap-1 transition ${status === 'en_route' ? 'text-blue-600' : 'text-slate-400'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${status === 'en_route' ? 'bg-blue-500 text-white' : 'bg-white border-2 border-slate-200'}`}>
                  <Navigation size={14} />
                </div>
                Đang di chuyển
              </button>
              
              <button 
                className={`relative z-10 flex-1 py-3 text-xs font-bold flex flex-col items-center gap-1 transition ${status === 'on_site' ? 'text-blue-600' : 'text-slate-400'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${status === 'on_site' ? 'bg-blue-500 text-white ring-4 ring-blue-100' : 'bg-white border-2 border-slate-200'}`}>
                  <MapPin size={14} />
                </div>
                Đến nơi
              </button>

              <button 
                className={`relative z-10 flex-1 py-3 text-xs font-bold flex flex-col items-center gap-1 transition ${status === 'done' ? 'text-emerald-600' : 'text-slate-400'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${status === 'done' ? 'bg-emerald-500 text-white ring-4 ring-emerald-100' : 'bg-white border-2 border-slate-200'}`}>
                  <CheckCircle2 size={14} />
                </div>
                Hoàn thành
              </button>
            </div>

            {/* Action Button */}
            {status !== 'done' && (
              <button 
                onClick={handleStatusUpdate}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-[0.98] transition-transform"
              >
                {status === 'en_route' ? 'Xác nhận đã đến nơi' : 'Hoàn thành nhiệm vụ'}
                <ArrowRight size={20} />
              </button>
            )}
          </div>
        </section>
        ) : (
            <div className="bg-emerald-50 text-emerald-700 p-8 rounded-3xl text-center border border-emerald-100">
                <CheckCircle2 size={48} className="mx-auto mb-4" />
                <h3 className="text-xl font-bold">Không có nhiệm vụ đang chạy</h3>
                <p className="text-sm mt-2">Bạn đã hoàn thành các nhiệm vụ. Đang chờ hệ thống phân công mới.</p>
                
                <div className="mt-6 animate-in slide-in-from-bottom-4 fade-in duration-300 bg-white p-4 rounded-xl text-left shadow-sm">
                  <p className="text-sm font-bold text-slate-800 mb-2">Ghi chú hiện trường nhiệm vụ vừa xong</p>
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                    rows={3}
                    placeholder="Nhập ghi chú hoặc báo cáo..."
                  ></textarea>
                  <div className="flex gap-2 mb-4">
                    <button className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-200 transition">
                      <Camera size={16} /> Chụp ảnh
                    </button>
                  </div>
                  <button className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 active:scale-[0.98] transition-transform">
                    Gửi báo cáo
                  </button>
                </div>
            </div>
        )}

        {/* Hàng chờ */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3 px-1">Nhiệm vụ tiếp theo ({queueCases.length})</h2>
          {queueCases.length === 0 && <p className="text-sm text-slate-500 px-1">Không có nhiệm vụ nào trong hàng chờ.</p>}
          <div className="space-y-3">
            {queueCases.map((q) => (
              <div key={q.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between opacity-80">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-10 rounded-full ${q.priority === 'HIGH' ? 'bg-red-500' : 'bg-amber-400'}`}></div>
                  <div>
                    <h4 className="font-bold text-slate-700">{q.title}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><MapPin size={12}/> {q.address}</p>
                  </div>
                </div>
                <div className="text-xs font-medium text-slate-400 flex flex-col items-end">
                  <Clock size={14} className="mb-1" />
                  Chờ
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full md:hidden bg-white border-t border-slate-100 flex justify-around p-3 z-20 pb-safe">
        <button className="flex flex-col items-center text-blue-600 font-medium">
          <Navigation size={24} className="mb-1" />
          <span className="text-[10px]">Nhiệm vụ</span>
        </button>
        <button className="flex flex-col items-center text-slate-400 hover:text-blue-600 transition">
          <FileText size={24} className="mb-1" />
          <span className="text-[10px]">Lịch sử</span>
        </button>
        <button className="flex flex-col items-center text-slate-400 hover:text-blue-600 transition">
          <Menu size={24} className="mb-1" />
          <span className="text-[10px]">Menu</span>
        </button>
      </nav>
    </div>
  );
}
