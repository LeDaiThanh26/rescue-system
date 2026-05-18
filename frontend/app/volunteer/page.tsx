"use client";

import { useAuth } from "@/lib/useAuth";

export default function VolunteerPage() {
    const { user, loading, logout } = useAuth("VOLUNTEER");

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Topbar */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold text-gray-900">Trang tình nguyện viên</h1>
                        <p className="text-xs text-gray-500">Nhiệm vụ được giao</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{user?.fullName}</div>
                        <div className="text-xs text-blue-600 font-medium">TÌNH NGUYỆN VIÊN</div>
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
            <main className="max-w-3xl mx-auto px-6 py-8">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">
                        Nhiệm vụ của tôi
                    </h2>
                    <div className="text-sm text-gray-400 text-center py-12">
                        Chưa có nhiệm vụ nào được giao
                    </div>
                </div>
            </main>
        </div>
    );
}