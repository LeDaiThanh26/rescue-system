const TOKEN_COOKIE = "rescue_token";
const USER_COOKIE = "rescue_user";

export type UserRole = "ADMIN" | "VOLUNTEER" | "CITIZEN";

export interface AuthUser {
    id: number;
    username: string;
    fullName: string;
    role: UserRole;
}

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days: number = 7) {
    if (typeof document === "undefined") return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
}

function deleteCookie(name: string) {
    if (typeof document === "undefined") return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

// NOTE: For production, backend should set httpOnly, Secure cookies.
// These client-side functions are fallback for non-sensitive operations.
export function saveAuth(token: string, user: AuthUser) {
    setCookie(TOKEN_COOKIE, token);
    setCookie(USER_COOKIE, JSON.stringify(user));
}

export function getToken(): string | null {
    return getCookie(TOKEN_COOKIE);
}

export function getUser(): AuthUser | null {
    const raw = getCookie(USER_COOKIE);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as AuthUser;
    } catch {
        return null;
    }
}

export function clearAuth() {
    deleteCookie(TOKEN_COOKIE);
    deleteCookie(USER_COOKIE);
}

export function getHomeByRole(role: UserRole): string {
    if (role === "ADMIN") return "/admin";
    if (role === "VOLUNTEER") return "/volunteer";
    return "/";
}