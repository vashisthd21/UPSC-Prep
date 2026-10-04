import { api } from "./api";
import { ApiResponse, Bookmark } from "@/types";

export const bookmarkService = {
  list: () => api.get<ApiResponse<Bookmark[]>>("/bookmarks").then((r) => r.data.data),
  add: (questionId: string) =>
    api.post<ApiResponse<Bookmark>>("/bookmarks", { questionId }).then((r) => r.data.data),
  remove: (questionId: string) => api.delete(`/bookmarks/${questionId}`),
};
