"use client";

import React, { useState, useEffect } from "react";
import {
    LifeBuoy,
    Clock,
    CheckCircle2,
    AlertTriangle,
    TrendingUp,
    RefreshCw,
    Users,
    Flame,
    MessageSquare,
    ShieldAlert,
    ArrowUpRight,
    Sparkles,
    MapPin,
    MapIcon
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { getToken } from "@/lib/auth";

export default function AdminPage() {
    const { user, loading: authLoading } = useAuth("ADMIN");
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchDashboardData = async () => {
        setIsRefreshing(true);
        try {
            const token = getToken();
            const headers = { Authorization: `Bearer ${token}` };
            const res = await fetch("http://localhost:5000/api/admin", { headers });

            if (!res.ok) {
                throw new Error("Không thể tải dữ liệu dashboard");
            }

            const data = await res.json();
            if (data.success) {
                setDashboardData(data);
                setError(null);
            } else {
                throw new Error(data.message || "Lỗi không xác định từ server");
            }
        } catch (err: any) {
            console.error("Fetch dashboard error:", err);
            setError(err.message || "Không thể kết nối đến máy chủ");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        if (authLoading) return;
        fetchDashboardData();
        // Cập nhật real-time mỗi 10 giây
        const interval = setInterval(fetchDashboardData, 10000);
        return () => clearInterval(interval);
    }, [authLoading]);

    if (authLoading || (loading && !dashboardData)) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
                <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
                <span className="text-sm font-medium text-slate-500 animate-pulse">Đang đồng bộ dữ liệu hệ thống cứu hộ...</span>
            </div>
        );
    }

    const stats = dashboardData?.stats || { total: 0, pending: 0, processing: 0, completed: 0 };
    const rescueTeamsStatus = dashboardData?.rescueTeamsStatus || { total: 0, enRoute: 0, onSite: 0, ready: 0 };
    const hotSpots = dashboardData?.hotSpots || [];
    const recentFeeds = dashboardData?.recentFeeds || [];
    const chartData = dashboardData?.chartData || [];

    const totalVolunteers = rescueTeamsStatus.total || 1;
    const enRoutePercent = Math.min(100, Math.round((rescueTeamsStatus.enRoute / totalVolunteers) * 100));
    const onSitePercent = Math.min(100, Math.round((rescueTeamsStatus.onSite / totalVolunteers) * 100));
    const readyPercent = Math.min(100, Math.round((rescueTeamsStatus.ready / totalVolunteers) * 100));

    const maxChartValue = Math.max(...chartData.map((d: any) => Math.max(d.newCases, d.resolvedCases)), 5);

    const formatAddress = (addr: any) => {
        if (!addr) return "Chưa xác định";
        if (typeof addr === "string") return addr;
        if (typeof addr === "object") {
            const parts = [];
            if (addr.street) parts.push(addr.street);
            if (addr.district) parts.push(addr.district);
            if (addr.city) parts.push(addr.city);
            return parts.join(", ") || JSON.stringify(addr);
        }
        return String(addr);
    };

    const getUrgencyBadge = (urgency: string | null) => {
        const u = (urgency || "MEDIUM").toUpperCase();
        if (u === "CRITICAL" || u === "KHẨN CẤP" || u === "CAO" || u === "HIGH") {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100 text-xs font-bold shrink-0">
                    <AlertTriangle size={12} className="shrink-0" /> Khẩn cấp
                </span>
            );
        }
        if (u === "MEDIUM" || u === "TRUNG BÌNH" || u === "MODERATE") {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-xs font-bold shrink-0">
                    <Clock size={12} className="shrink-0" /> Trung bình
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-550 text-slate-650 border border-slate-100 text-xs font-bold shrink-0">
                <CheckCircle2 size={12} className="shrink-0" /> Thấp
            </span>
        );
    };

    const getStatusBadge = (status: string) => {
        const s = status.toUpperCase();
        if (s === "PENDING") {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-xs font-bold">
                    Chờ duyệt
                </span>
            );
        }
        if (s === "ASSIGNED") {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold">
                    Đang xử lý
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold">
                Đã xong
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        try {
            const d = new Date(dateString);
            return d.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }) + " • " + d.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="p-1 md:p-4 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Đồng bộ thời gian thực
                        </span>
                        <span className="text-xs text-slate-400 font-medium">• Hệ thống tự động làm mới sau 10 giây</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        Dashboard Chỉ Huy Cứu Hộ <Sparkles size={24} className="text-blue-500 animate-pulse" />
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Báo cáo phân tích AI, khoanh vùng điểm nóng và điều phối tình nguyện viên</p>
                </div>

                <div className="flex items-center gap-3">
                    {error && (
                        <span className="text-xs text-rose-600 font-bold bg-rose-50 border border-rose-100 px-3 py-2 rounded-xl flex items-center gap-1.5">
                            <ShieldAlert size={16} /> Lỗi kết nối API
                        </span>
                    )}
                    <button
                        id="db-refresh-btn"
                        onClick={fetchDashboardData}
                        disabled={isRefreshing}
                        className="p-2.5 px-4 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 font-bold text-sm"
                    >
                        <RefreshCw size={16} className={isRefreshing ? "animate-spin text-blue-600" : "transition-transform duration-300 hover:rotate-180"} />
                        Đồng bộ ngay
                    </button>
                </div>
            </header>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    id="stat-card-total"
                    label="Tổng số ca tiếp nhận"
                    value={stats.total}
                    description="Tổng tất cả các ca trong hệ thống"
                    icon={<LifeBuoy size={20} />}
                    color="indigo"
                />
                <StatCard
                    id="stat-card-pending"
                    label="Chờ duyệt / xử lý"
                    value={stats.pending}
                    description="Ca thô NLP & ca đang chờ điều phối"
                    icon={<AlertTriangle size={20} />}
                    color="amber"
                />
                <StatCard
                    id="stat-card-processing"
                    label="Đang cứu nạn"
                    value={stats.processing}
                    description="Các ca đang có đội tiếp cận hiện trường"
                    icon={<TrendingUp size={20} />}
                    color="blue"
                />
                <StatCard
                    id="stat-card-completed"
                    label="Hoàn thành"
                    value={stats.completed}
                    description="Số ca cứu hộ thành công, an toàn"
                    icon={<CheckCircle2 size={20} />}
                    color="emerald"
                />
            </div>

            {/* Visual Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Chart Column */}
                <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Tần Suất Kêu Cứu Theo Giờ</h2>
                            <p className="text-slate-400 text-xs mt-0.5">Biểu đồ so sánh số ca mới tiếp nhận và số ca được xử lý xong hôm nay</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-bold">
                            <span className="flex items-center gap-1 text-slate-500">
                                <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-rose-500 to-rose-400" /> Ca kêu cứu mới
                            </span>
                            <span className="flex items-center gap-1 text-slate-500">
                                <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-emerald-500 to-emerald-400" /> Đã xử lý xong
                            </span>
                        </div>
                    </div>

                    {chartData.length === 0 ? (
                        <div className="h-[240px] flex items-center justify-center text-slate-400 text-sm font-semibold">
                            Chưa ghi nhận ca cứu hộ nào trong ngày hôm nay.
                        </div>
                    ) : (
                        <div className="h-[240px] flex items-end gap-2 sm:gap-3.5 px-2 pt-6">
                            {chartData.map((d: any, idx: number) => {
                                const newHeight = `${(d.newCases / maxChartValue) * 100}%`;
                                const resolvedHeight = `${(d.resolvedCases / maxChartValue) * 100}%`;
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center h-full group relative justify-end">
                                        {/* Dynamic Tooltip */}
                                        <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] font-bold py-1.5 px-2.5 rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-20 whitespace-nowrap flex flex-col gap-0.5 border border-slate-800">
                                            <span className="text-rose-400">Ca mới: {d.newCases}</span>
                                            <span className="text-emerald-400">Đã giải quyết: {d.resolvedCases}</span>
                                        </div>

                                        {/* CSS/SVG Bars */}
                                        <div className="w-full flex items-end gap-1 h-full max-h-[170px]">
                                            <div
                                                style={{ height: d.newCases > 0 ? newHeight : "4px" }}
                                                className={`flex-1 rounded-t-md bg-gradient-to-t ${d.newCases > 0 ? "from-rose-500 to-rose-400 hover:from-rose-600 hover:to-rose-500 shadow-sm" : "from-slate-100 to-slate-200"} transition-all duration-300`}
                                            />
                                            <div
                                                style={{ height: d.resolvedCases > 0 ? resolvedHeight : "4px" }}
                                                className={`flex-1 rounded-t-md bg-gradient-to-t ${d.resolvedCases > 0 ? "from-emerald-500 to-emerald-400 hover:from-emerald-600 hover:to-emerald-500 shadow-sm" : "from-slate-100 to-slate-200"} transition-all duration-300`}
                                            />
                                        </div>

                                        <span className="text-[10px] font-bold text-slate-400 mt-2 rotate-45 sm:rotate-0 transform origin-center">
                                            {d.timeFrame}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Team Status Column */}
                <div id="rescue-teams-status-section" className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 tracking-tight">Trạng Thái Đội Cứu Hộ</h2>
                                <p className="text-slate-400 text-xs mt-0.5">Thống kê tình nguyện viên hoạt động</p>
                            </div>
                            <span className="inline-flex p-2.5 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
                                <Users size={20} />
                            </span>
                        </div>

                        <div className="space-y-6">
                            <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-600">Tổng nhân sự cứu hộ</span>
                                <span className="text-2xl font-extrabold text-slate-800">{rescueTeamsStatus.total}</span>
                            </div>

                            <div className="space-y-4">
                                <ProgressBar
                                    label="Sẵn sàng (Tại kho trực)"
                                    count={rescueTeamsStatus.ready}
                                    percent={readyPercent}
                                    color="emerald"
                                />
                                <ProgressBar
                                    label="Đang di chuyển (En Route)"
                                    count={rescueTeamsStatus.enRoute}
                                    percent={enRoutePercent}
                                    color="blue"
                                />
                                <ProgressBar
                                    label="Tại hiện trường (On Site)"
                                    count={rescueTeamsStatus.onSite}
                                    percent={onSitePercent}
                                    color="amber"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <Link
                            href="/admin/volunteers"
                            className="w-full flex items-center justify-center gap-1.5 px-4 py-3 bg-slate-550 border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 hover:border-blue-200 rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer"
                        >
                            Giám sát tình nguyện viên <ArrowUpRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    id,
    label,
    value,
    description,
    icon,
    color,
}: {
    id: string;
    label: string;
    value: number;
    description: string;
    icon: React.ReactNode;
    color: "blue" | "amber" | "indigo" | "emerald";
}) {
    const colorStyles = {
        blue: {
            bg: "bg-blue-50/50 backdrop-blur-md border-blue-100 hover:border-blue-200 hover:bg-blue-50/80",
            iconBg: "bg-blue-600 text-white shadow-md shadow-blue-500/25",
            valueText: "text-slate-900"
        },
        amber: {
            bg: "bg-amber-50/50 backdrop-blur-md border-amber-100 hover:border-amber-200 hover:bg-amber-50/80",
            iconBg: "bg-amber-500 text-white shadow-md shadow-amber-500/25",
            valueText: "text-slate-900"
        },
        indigo: {
            bg: "bg-indigo-50/50 backdrop-blur-md border-indigo-100 hover:border-indigo-200 hover:bg-indigo-50/80",
            iconBg: "bg-indigo-600 text-white shadow-md shadow-indigo-500/25",
            valueText: "text-slate-900"
        },
        emerald: {
            bg: "bg-emerald-50/50 backdrop-blur-md border-emerald-100 hover:border-emerald-200 hover:bg-emerald-50/80",
            iconBg: "bg-emerald-600 text-white shadow-md shadow-emerald-500/25",
            valueText: "text-slate-900"
        }
    };

    return (
        <div id={id} className={`rounded-2xl p-6 border transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.01)] hover:shadow-md ${colorStyles[color].bg}`}>
            <div className="flex justify-between items-start">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
                    <div className={`text-4xl font-extrabold mt-2 tracking-tight ${colorStyles[color].valueText}`}>{value}</div>
                </div>
                <div className={`p-3 rounded-xl ${colorStyles[color].iconBg}`}>
                    {icon}
                </div>
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-4 flex items-center gap-1">
                <span>{description}</span>
            </div>
        </div>
    );
}

function ProgressBar({
    label,
    count,
    percent,
    color,
}: {
    label: string;
    count: number;
    percent: number;
    color: "emerald" | "blue" | "amber";
}) {
    const colors = {
        emerald: "bg-emerald-500",
        blue: "bg-blue-500",
        amber: "bg-amber-500"
    };

    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>{label}</span>
                <span className="text-slate-800">{count} ({percent}%)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                <div
                    style={{ width: `${percent}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${colors[color]}`}
                />
            </div>
        </div>
    );
}