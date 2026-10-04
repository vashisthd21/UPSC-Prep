import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const { user, token, setAuth, logout } = useAuthStore();
  return {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === "admin",
    setAuth,
    logout,
  };
}
