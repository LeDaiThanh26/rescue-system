const TOKEN_KEY = "rescue_token";
const USER_KEY = "rescue_user";

export type UserRole = "ADMIN" | "VOLUNTEER" | "CITIZEN";

export interface AuthUser {
    id: number;
    username: string;
    fullName: string;
    role: UserRole;
}

// Lưu sau khi login thành công
export function saveAuth(token: string, user: AuthUser) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Lấy token để gửi kèm API request
export function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
}

// Lấy thông tin user hiện tại
export function getUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as AuthUser;
    } catch {
        return null;
    }
}

// Xoá khi logout
export function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

// Redirect theo role
export function getHomeByRole(role: UserRole): string {
    if (role === "ADMIN") return "/admin";
    if (role === "VOLUNTEER") return "/volunteer";
    return "/";
}