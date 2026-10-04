import { api } from "./api";
import { ApiResponse, Paginated, Question, Test } from "@/types";

export interface TestFilters {
  testType?: string;
  subject?: string;
  difficulty?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CustomTestCriteria {
  title?: string;
  subjects?: string[];
  topics?: string[];
  difficulty?: string[];
  questionTypes?: string[];
  numberOfQuestions: number;
  durationMinutes?: number;
  onlyPYQ?: boolean;
}

export const testService = {
  list: (filters: TestFilters = {}) =>
    api.get<ApiResponse<Paginated<Test>>>("/tests", { params: filters }).then((r) => r.data.data),

  get: (id: string) => api.get<ApiResponse<Test>>(`/tests/${id}`).then((r) => r.data.data),

  getQuestions: (id: string) =>
    api.get<ApiResponse<Question[]>>(`/tests/${id}/questions`).then((r) => r.data.data),

  create: (payload: Partial<Test>) =>
    api.post<ApiResponse<Test>>("/tests", payload).then((r) => r.data.data),

  update: (id: string, payload: Partial<Test>) =>
    api.put<ApiResponse<Test>>(`/tests/${id}`, payload).then((r) => r.data.data),

  remove: (id: string) => api.delete(`/tests/${id}`),

  generateCustom: (criteria: CustomTestCriteria) =>
    api.post<ApiResponse<Test>>("/tests/generate", criteria).then((r) => r.data.data),
};
