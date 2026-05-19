"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, MapPin, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { getToken } from "@/lib/auth";

export default function VolunteerDetailPage() {
  const { user, loading: authLoading } = useAuth("ADMIN");
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    const fetchDetail = async () => {
      try {
        const token = getToken();
        const res = await fetch(`http://localhost:5000/api/admin/volunteers/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setData(await res.json());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, authLoading]);

  if (authLoading || loading) return <div className="p-10 text-center font-medium text-slate-500">Đang tải chi tiết...</div>;
  if (!data) return <div className="p-10 text-center text-red-500">Không tìm thấy thông tin TNV</div>;

  return (
    <>
      <Link href="/admin/volunteers" className="inline-flex items-center gap-2 text-blue-600 font-medium mb-6 hover:underline">
        <ArrowLeft size={16} /> Quay lại danh sách
      </Link>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{data.name}</h1>
            <p className="text-slate-500">@{data.username}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-500 mb-1">Vị trí cuối</p>
            <p className="font-medium text-slate-800 flex items-center gap-1"><MapPin size={16}/> {data.area}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-500 mb-1">Trạng thái hiện tại</p>
            <p className="font-medium text-slate-800">{data.status === "busy" ? "Đang làm nhiệm vụ" : "Sẵn sàng"}</p>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-4">Lịch sử nhiệm vụ ({data.stats.totalMissions})</h3>
        <div className="space-y-3">
          {data.missions.map((m: any) => (
            <div key={m.id} className="p-4 border border-slate-100 rounded-xl">
              <div className="flex justify-between items-start mb-2">
                <p className="font-bold text-slate-700">Mission #{m.id}</p>
                {m.status === "DONE" ? (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">HOÀN THÀNH</span>
                ) : (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold">ĐANG CHẠY</span>
                )}
              </div>
              <p className="text-sm text-slate-500 mb-1">{m.incident?.rawMessage}</p>
              <p className="text-xs text-slate-400">Giao lúc: {new Date(m.startedAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
