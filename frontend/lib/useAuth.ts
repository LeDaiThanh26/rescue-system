"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, getToken, clearAuth, AuthUser } from "@/lib/auth";

// Hook bảo vệ route — dùng trong admin/volunteer pages
// requiredRole: nếu truyền vào sẽ kiểm tra đúng role mới cho vào
export function useAuth(requiredRole?: AuthUser["role"]) {
    const router = useRouter();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = getUser();
        const token = getToken();

        // Chưa đăng nhập → về login
        if (!currentUser || !token) {
            router.replace("/login");
            return;
        }

        // Sai role → về trang chủ role của họ
        if (requiredRole && currentUser.role !== requiredRole) {
            if (currentUser.role === "ADMIN") router.replace("/admin");
            else if (currentUser.role === "VOLUNTEER") router.replace("/volunteer");
            else router.replace("/");
            return;
        }

        setUser(currentUser);
        setLoading(false);
    }, [router, requiredRole]);

    function logout() {
        clearAuth();
        router.replace("/login");
    }

    return { user, loading, logout };
}