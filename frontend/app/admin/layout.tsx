"use client";

import React from "react";
import { ShieldCheck, Users, LayoutDashboard, LogOut, LifeBuoy, Map } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth("ADMIN");

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          <span className="text-sm font-medium text-slate-500">Đang kiểm tra quyền truy cập...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
        <div className="flex flex-col flex-1">
          {/* Header */}
          <div className="p-6 text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800">
            <ShieldCheck className="text-blue-500" size={24} /> Rescue Admin
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2 mt-6">
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${pathname === "/admin"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                : "hover:bg-slate-800 hover:text-white"
                }`}
            >
              <LayoutDashboard size={20} /> Tổng quan (Dashboard)
            </Link>
            <Link
              href="/admin/cases"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${pathname.startsWith("/admin/cases")
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                : "hover:bg-slate-800 hover:text-white"
                }`}
            >
              <LifeBuoy size={20} /> Ca cứu hộ
            </Link>
            <Link
              href="/admin/volunteers"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${pathname.startsWith("/admin/volunteers")
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                : "hover:bg-slate-800 hover:text-white"
                }`}
            >
              <Users size={20} /> Tình nguyện viên
            </Link>
            <Link
              href="/admin/map"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${pathname.startsWith("/admin/map")
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                : "hover:bg-slate-800 hover:text-white"
                }`}
            >
              <Map size={20} /> Bản đồ cứu hộ
            </Link>
          </nav>
        </div>

        {/* User Info & Logout Button */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
              {user?.fullName?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white truncate">{user?.fullName || "Quản trị viên"}</div>
              <div className="text-xs text-slate-400 truncate">@{user?.username || "admin"}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600/10 text-red-400 border border-red-500/20 hover:bg-red-600 hover:text-white rounded-xl font-semibold transition active:scale-[0.98] cursor-pointer"
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </aside>

      <main className="p-6 md:p-10 flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
