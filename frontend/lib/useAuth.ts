"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, getToken, clearAuth, AuthUser } from "@/lib/auth";

export function useAuth(requiredRole?: AuthUser["role"]) {
    const router = useRouter();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = getUser();
        const token = getToken();

        if (!currentUser || !token) {
            router.replace("/login");
            return;
        }

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