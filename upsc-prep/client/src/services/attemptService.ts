import { api } from "./api";
import { ApiResponse, Paginated, ReviewItem, TestAttempt } from "@/types";

export const attemptService = {
  start: (testId: string) =>
    api.post<ApiResponse<TestAttempt>>("/attempts/start", { testId }).then((r) => r.data.data),

  get: (attemptId: string) =>
    api.get<ApiResponse<TestAttempt>>(`/attempts/${attemptId}`).then((r) => r.data.data),

  saveAnswer: (
    attemptId: string,
    payload: { questionId: string; selected?: string | null; status?: string; timeSpentSeconds?: number }
  ) =>
    api
      .post<ApiResponse<TestAttempt>>(`/attempts/${attemptId}/answer`, payload)
      .then((r) => r.data.data),

  submit: (attemptId: string, autoSubmitted = false) =>
    api
      .post<ApiResponse<TestAttempt>>(`/attempts/${attemptId}/submit`, { autoSubmitted })
      .then((r) => r.data.data),

  review: (attemptId: string) =>
    api
      .get<ApiResponse<{ attempt: TestAttempt; review: ReviewItem[] }>>(
        `/attempts/${attemptId}/review`
      )
      .then((r) => r.data.data),

  history: (page = 1, limit = 10) =>
    api
      .get<ApiResponse<Paginated<TestAttempt>>>("/attempts/history", { params: { page, limit } })
      .then((r) => r.data.data),
};
