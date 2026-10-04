import { api } from "./api";
import { ApiResponse, User } from "@/types";

export interface AuthPayload {
  token: string;
  user: User;
}

export const authService = {
  register: (payload: {
    name: string;
    email: string;
    password: string;
    targetYear?: number;
    optionalSubject?: string;
  }) => api.post<ApiResponse<AuthPayload>>("/auth/register", payload).then((r) => r.data.data),

  login: (payload: { email: string; password: string }) =>
    api.post<ApiResponse<AuthPayload>>("/auth/login", payload).then((r) => r.data.data),

  me: () => api.get<ApiResponse<User>>("/auth/me").then((r) => r.data.data),
};
