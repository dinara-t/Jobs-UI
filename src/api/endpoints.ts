import type {
  ChatRequest,
  ChatResponse,
  Job,
  JobPatch,
  LoginRequest,
  PageResponse,
  Temp,
  TempUpdate,
  TempWithJobs,
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const MCP_BASE_URL = import.meta.env.VITE_MCP_BASE_URL ?? "http://localhost:3000";

async function request<T>(
  path: string,
  init?: RequestInit,
  baseUrl: string = API_BASE_URL,
): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;

    try {
      const errorBody = (await response.json()) as { error?: string; message?: string };
      errorMessage = errorBody.message ?? errorBody.error ?? errorMessage;
    } catch {
      //
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  login: (payload: LoginRequest) =>
    request<void>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  logout: () =>
    request<void>("/auth/logout", {
      method: "POST",
    }),

  getProfile: () =>
    request<Temp>("/profile"),

  patchProfile: (payload: TempUpdate) =>
    request<Temp>("/profile", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  listJobs: (params: {
    assigned?: boolean;
    sortBy: "date" | "name";
    sortDir: "asc" | "desc";
    page: number;
    size: number;
  }) => {
    const search = new URLSearchParams();
    if (typeof params.assigned === "boolean") {
      search.set("assigned", String(params.assigned));
    }
    search.set("sortBy", params.sortBy);
    search.set("sortDir", params.sortDir);
    search.set("page", String(params.page));
    search.set("size", String(params.size));

    return request<PageResponse<Job>>(`/jobs?${search.toString()}`);
  },

  getJob: (id: number) =>
    request<Job>(`/jobs/${id}`),

  patchJob: (id: number, payload: JobPatch) =>
    request<Job>(`/jobs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  listTemps: (params: {
    jobId?: number;
    sortBy: "id" | "name" | "jobCount";
    sortDir: "asc" | "desc";
    page: number;
    size: number;
  }) => {
    const search = new URLSearchParams();
    if (typeof params.jobId === "number") {
      search.set("jobId", String(params.jobId));
    }
    search.set("sortBy", params.sortBy);
    search.set("sortDir", params.sortDir);
    search.set("page", String(params.page));
    search.set("size", String(params.size));

    return request<PageResponse<Temp>>(`/temps?${search.toString()}`);
  },

  getTemp: (id: number) =>
    request<TempWithJobs>(`/temps/${id}`),

  chat: (payload: ChatRequest) =>
    request<ChatResponse>(
      "/chat",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      MCP_BASE_URL,
    ),
};