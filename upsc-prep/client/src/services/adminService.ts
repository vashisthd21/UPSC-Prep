import { api } from "./api";
import { ApiResponse, Paginated, User } from "@/types";

export const adminService = {
  listUsers: (page = 1, limit = 20, search = "") =>
    api
      .get<ApiResponse<Paginated<User>>>("/admin/users", { params: { page, limit, search } })
      .then((r) => r.data.data),
  updateUserRole: (id: string, role: "student" | "admin") =>
    api.patch<ApiResponse<User>>(`/admin/users/${id}/role`, { role }).then((r) => r.data.data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),

  createReport: (payload: { questionId: string; reason: string; comment?: string }) =>
    api.post("/admin/reports", payload),
  listReports: (status?: string) =>
    api.get<ApiResponse<unknown[]>>("/admin/reports", { params: { status } }).then((r) => r.data.data),
  updateReportStatus: (id: string, status: string) =>
    api.patch(`/admin/reports/${id}`, { status }),
};
