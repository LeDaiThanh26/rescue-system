"use client";

import { useAuth } from "@/lib/useAuth";

export default function AdminPage() {
    const { user, loading, logout } = useAuth("ADMIN");

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Topbar */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold text-gray-900">Dashboard Quản trị</h1>
                        <p className="text-xs text-gray-500">Hệ thống điều phối cứu trợ</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{user?.fullName}</div>
                        <div className="text-xs text-red-600 font-medium">ADMIN</div>
                    </div>
                    <button
                        onClick={logout}
                        className="px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg
              hover:bg-gray-100 transition"
                    >
                        Đăng xuất
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <StatCard label="Ca kêu cứu" value="0" color="red" />
                    <StatCard label="Đang xử lý" value="0" color="yellow" />
                    <StatCard label="Hoàn thành" value="0" color="green" />
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">
                        Danh sách ca kêu cứu
                    </h2>
                    <div className="text-sm text-gray-400 text-center py-12">
                        Chưa có dữ liệu
                    </div>
                </div>
            </main>
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
        red: "bg-red-50 text-red-700",
        yellow: "bg-yellow-50 text-yellow-700",
        green: "bg-green-50 text-green-700",
    };

    return (
        <div className={`rounded-xl p-5 ${colors[color]}`}>
            <div className="text-2xl font-semibold">{value}</div>
            <div className="text-sm mt-1 opacity-80">{label}</div>
        </div>
    );
}