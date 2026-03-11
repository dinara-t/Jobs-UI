import { http } from "./http";
import type {
  LoginRequest,
  LoginResponse,
  Job,
  JobPatch,
  Temp,
  TempUpdate,
  TempWithJobs,
} from "./types";

export const api = {
  login: (payload: LoginRequest) =>
    http<LoginResponse>("/auth/login", {
      method: "POST",
      body: payload,
      auth: false,
    }),

  logout: () => http<void>("/auth/logout", { method: "POST", auth: false }),

  listJobs: (assigned?: boolean) => {
    const q =
      assigned === undefined ? "" : `?assigned=${assigned ? "true" : "false"}`;
    return http<Job[]>(`/jobs${q}`);
  },

  getJob: (id: number) => http<Job>(`/jobs/${id}`),

  patchJob: (id: number, patch: JobPatch) =>
    http<Job>(`/jobs/${id}`, { method: "PATCH", body: patch }),

  listTemps: (jobId?: number) => {
    const q = jobId === undefined ? "" : `?jobId=${jobId}`;
    return http<Temp[]>(`/temps${q}`);
  },

  getTemp: (id: number) => http<TempWithJobs>(`/temps/${id}`),

  getProfile: () => http<Temp>("/profile"),

  patchProfile: (payload: TempUpdate) =>
    http<Temp>("/profile", {
      method: "PATCH",
      body: payload,
    }),
};
