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

type JobSortBy = "date" | "name";
type SortDir = "asc" | "desc";
type TempSortBy = "id" | "name" | "jobCount";

type ListJobsParams = {
  assigned?: boolean;
  sortBy?: JobSortBy;
  sortDir?: SortDir;
  page?: number;
  size?: number;
};

type ListTempsParams = {
  jobId?: number;
  sortBy?: TempSortBy;
  sortDir?: SortDir;
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

  listJobs: ({
    assigned,
    sortBy = "date",
    sortDir = "asc",
    page = 0,
    size = 10,
  }: ListJobsParams = {}) => {
    const params = new URLSearchParams();

    if (assigned !== undefined) {
      params.set("assigned", String(assigned));
    }

    params.set("sortBy", sortBy);
    params.set("sortDir", sortDir);
    params.set("page", String(page));
    params.set("size", String(size));

    return http<PageResponse<Job>>(`/jobs?${params.toString()}`);
  },

  getJob: (id: number) => http<Job>(`/jobs/${id}`),

  patchJob: (id: number, patch: JobPatch) =>
    http<Job>(`/jobs/${id}`, { method: "PATCH", body: patch }),

  listTemps: ({
    jobId,
    sortBy = "name",
    sortDir = "asc",
    page = 0,
    size = 10,
  }: ListTempsParams = {}) => {
    const params = new URLSearchParams();

    if (jobId !== undefined) {
      params.set("jobId", String(jobId));
    }

    params.set("sortBy", sortBy);
    params.set("sortDir", sortDir);
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