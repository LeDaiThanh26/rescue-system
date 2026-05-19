"use client";

import { useAuth } from "@/lib/useAuth";

export default function AdminPage() {
    const { user, loading } = useAuth("ADMIN");

    if (loading) {
        return (
            <div className="p-10 text-center font-medium text-slate-500">Đang tải...</div>
        );
    }

    return (
        <div className="p-6 md:p-10">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Tổng quan Dashboard</h1>
                    <p className="text-slate-500 mt-1">Hệ thống quản lý và điều phối cứu trợ</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard label="Ca kêu cứu" value="0" color="red" />
                <StatCard label="Đang xử lý" value="0" color="yellow" />
                <StatCard label="Hoàn thành" value="0" color="green" />
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                    Danh sách ca kêu cứu
                </h2>
                <div className="text-sm text-slate-400 text-center py-16">
                    Chưa có dữ liệu cuộc gọi cứu trợ
                </div>
            </div>
        </div>
    );
}

function StatCard({
    label,
    value,
    color,
}: {
    label: string;
    value: string;
    color: "red" | "yellow" | "green";
}) {
    const colors = {
        red: "bg-red-50 border border-red-100 text-red-700",
        yellow: "bg-amber-50 border border-amber-100 text-amber-700",
        green: "bg-emerald-50 border border-emerald-100 text-emerald-700",
    };

    return (
        <div className={`rounded-2xl p-6 shadow-sm ${colors[color]}`}>
            <div className="text-3xl font-bold">{value}</div>
            <div className="text-sm font-semibold mt-1.5 opacity-80">{label}</div>
        </div>
    );
}