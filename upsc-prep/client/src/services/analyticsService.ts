import { api } from "./api";
import { ApiResponse, OverviewAnalytics, SubjectAnalytic, TopicAnalytic } from "@/types";

export const analyticsService = {
  overview: () =>
    api.get<ApiResponse<OverviewAnalytics>>("/analytics/overview").then((r) => r.data.data),
  subjects: () =>
    api.get<ApiResponse<SubjectAnalytic[]>>("/analytics/subjects").then((r) => r.data.data),
  topics: () =>
    api
      .get<ApiResponse<{ topics: TopicAnalytic[]; weakTopics: TopicAnalytic[] }>>(
        "/analytics/topics"
      )
      .then((r) => r.data.data),
  platform: () => api.get<ApiResponse<unknown>>("/analytics/platform").then((r) => r.data.data),
};
