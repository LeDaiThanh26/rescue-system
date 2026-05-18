"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { saveAuth, getHomeByRole } from "@/lib/auth";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Đăng nhập thất bại");
                return;
            }

            // Lưu token + user vào localStorage
            saveAuth(data.token, data.user);

            // Redirect theo role
            router.push(getHomeByRole(data.user.role));
        } catch {
            setError("Không thể kết nối đến server");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Hệ thống cứu trợ lũ lụt
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Đăng nhập để tiếp tục
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Tên đăng nhập
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Nhập username..."
                                required
                                autoFocus
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm
                  focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                  transition placeholder-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Mật khẩu
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu..."
                                required
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm
                  focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                  transition placeholder-gray-400"
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd" />
                                </svg>
                                <span className="text-sm text-red-700">{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 px-4 rounded-lg bg-red-600 text-white text-sm font-medium
                hover:bg-red-700 active:scale-[0.98] transition disabled:opacity-60
                disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Đang đăng nhập...
                                </>
                            ) : (
                                "Đăng nhập"
                            )}
                        </button>
                    </form>

                    {/* Role hint */}
                    <div className="mt-6 pt-5 border-t border-gray-100">
                        <p className="text-xs text-center text-gray-400 mb-3">Tài khoản test</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                                <div className="font-medium text-gray-700">👤 Admin</div>
                                <div className="text-gray-500 mt-0.5">admin / 123456</div>
                            </div>
                            <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                                <div className="font-medium text-gray-700">🦺 Tình nguyện viên</div>
                                <div className="text-gray-500 mt-0.5">volunteer1 / 123456</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}