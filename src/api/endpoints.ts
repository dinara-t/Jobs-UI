import { http } from "./http";
import type {
  Job,
  JobPatch,
  LoginRequest,
  PageResponse,
  Temp,
  TempUpdate,
  TempWithJobs,
} from "./types";

type ListJobsParams = {
  assigned?: boolean;
  page?: number;
  size?: number;
};

type ListTempsParams = {
  jobId?: number;
  page?: number;
  size?: number;
};

export const api = {
  login: (payload: LoginRequest) =>
    http<void>("/auth/login", {
      method: "POST",
      body: payload,
      auth: false,
    }),

  logout: () => http<void>("/auth/logout", { method: "POST", auth: false }),

  listJobs: ({ assigned, page = 0, size = 10 }: ListJobsParams = {}) => {
    const params = new URLSearchParams();

    if (assigned !== undefined) {
      params.set("assigned", String(assigned));
    }

    params.set("page", String(page));
    params.set("size", String(size));

    return http<PageResponse<Job>>(`/jobs?${params.toString()}`);
  },

  getJob: (id: number) => http<Job>(`/jobs/${id}`),

  patchJob: (id: number, patch: JobPatch) =>
    http<Job>(`/jobs/${id}`, { method: "PATCH", body: patch }),

  listTemps: ({ jobId, page = 0, size = 10 }: ListTempsParams = {}) => {
    const params = new URLSearchParams();

    if (jobId !== undefined) {
      params.set("jobId", String(jobId));
    }

    params.set("page", String(page));
    params.set("size", String(size));

    return http<PageResponse<Temp>>(`/temps?${params.toString()}`);
  },

  getTemp: (id: number) => http<TempWithJobs>(`/temps/${id}`),

  getProfile: () => http<Temp>("/profile"),

  patchProfile: (payload: TempUpdate) =>
    http<Temp>("/profile", {
      method: "PATCH",
      body: payload,
    }),
};
