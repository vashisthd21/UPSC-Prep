import { api } from "./api";
import { ApiResponse, Paginated, Question } from "@/types";

export interface QuestionFilters {
  subject?: string;
  topic?: string;
  difficulty?: string;
  questionType?: string;
  isPYQ?: boolean;
  year?: number;
  search?: string;
  page?: number;
  limit?: number;
  reveal?: boolean;
}

export const questionService = {
  list: (filters: QuestionFilters = {}) =>
    api
      .get<ApiResponse<Paginated<Question>>>("/questions", { params: filters })
      .then((r) => r.data.data),

  get: (id: string, reveal = false) =>
    api
      .get<ApiResponse<Question>>(`/questions/${id}`, { params: { reveal } })
      .then((r) => r.data.data),

  facets: () =>
    api
      .get<ApiResponse<{ subjects: string[]; topics: string[]; years: number[] }>>(
        "/questions/facets"
      )
      .then((r) => r.data.data),

  create: (payload: Partial<Question>) =>
    api.post<ApiResponse<Question>>("/questions", payload).then((r) => r.data.data),

  update: (id: string, payload: Partial<Question>) =>
    api.put<ApiResponse<Question>>(`/questions/${id}`, payload).then((r) => r.data.data),

  remove: (id: string) => api.delete(`/questions/${id}`),

  bulkImport: (questions: unknown[]) =>
    api
      .post<
        ApiResponse<{
          insertedCount: number;
          invalidCount: number;
          duplicateCount: number;
          invalidRows: { row: number; reason: string }[];
        }>
      >("/questions/bulk-import", { questions })
      .then((r) => r.data.data),
};
