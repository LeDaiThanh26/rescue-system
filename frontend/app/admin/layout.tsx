"use client";

import React from "react";
import { ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="text-blue-500" /> Rescue Admin
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link
            href="/admin/volunteers"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
              pathname.startsWith("/admin/volunteers")
                ? "bg-blue-600/20 text-blue-400"
                : "hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Users size={20} /> Tình nguyện viên
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
