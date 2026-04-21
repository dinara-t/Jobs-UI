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

type CsrfTokenResponse = {
  token: string;
  headerName: string;
  parameterName: string;
};

let csrfTokenCache: CsrfTokenResponse | null = null;

function isUnsafeMethod(method?: string): boolean {
  const normalized = (method ?? "GET").toUpperCase();
  return normalized === "POST" || normalized === "PUT" || normalized === "PATCH" || normalized === "DELETE";
}

function hasCookie(name: string): boolean {
  if (typeof document === "undefined") {
    return false;
  }

  const cookies = document.cookie ? document.cookie.split(";") : [];
  return cookies.some((cookie) => cookie.trim().startsWith(`${name}=`));
}

async function fetchCsrfToken(): Promise<CsrfTokenResponse> {
  const response = await fetch(`${API_BASE_URL}/csrf/csrf-token`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch CSRF token (${response.status})`);
  }

  return (await response.json()) as CsrfTokenResponse;
}

async function ensureCsrfToken(forceRefresh: boolean = false): Promise<CsrfTokenResponse> {
  const hasXsrfCookie = hasCookie("XSRF-TOKEN");

  if (!forceRefresh && csrfTokenCache && hasXsrfCookie) {
    return csrfTokenCache;
  }

  csrfTokenCache = await fetchCsrfToken();
  return csrfTokenCache;
}

async function request<T>(
  path: string,
  init?: RequestInit,
  baseUrl: string = API_BASE_URL,
  retryOnCsrfFailure: boolean = true,
): Promise<T> {
  const method = (init?.method ?? "GET").toUpperCase();
  const headers = new Headers(init?.headers ?? {});

  if (!headers.has("Content-Type") && init?.body != null) {
    headers.set("Content-Type", "application/json");
  }

  const isUnsafe = isUnsafeMethod(method);

  if (isUnsafe) {
    const csrf = await ensureCsrfToken();

    if (!headers.has(csrf.headerName)) {
      headers.set(csrf.headerName, csrf.token);
    }
  }

  const response = await fetch(`${baseUrl}${path}`, {
    credentials: "include",
    ...init,
    method,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;

    try {
      const errorBody = (await response.json()) as { error?: string; message?: string };
      errorMessage = errorBody.message ?? errorBody.error ?? errorMessage;
    } catch {
    }

    const looksLikeCsrfFailure = response.status === 403 && isUnsafe;

    if (looksLikeCsrfFailure && retryOnCsrfFailure) {
      csrfTokenCache = await ensureCsrfToken(true);
      return request<T>(path, init, baseUrl, false);
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  initCsrf: () => ensureCsrfToken(),

  login: async (payload: LoginRequest) => {
    await request<void>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    await ensureCsrfToken(true);
  },

  logout: async () => {
    try {
      await request<void>("/auth/logout", {
        method: "POST",
      });
    } finally {
      csrfTokenCache = null;
    }
  },

  getProfile: () => request<Temp>("/temps/me"),

  updateProfile: (payload: TempUpdate) =>
    request<Temp>("/temps/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  patchProfile: (payload: TempUpdate) =>
    request<Temp>("/temps/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  getJobs: (params?: {
    assigned?: boolean;
    sortBy?: "date" | "name";
    sortDir?: "asc" | "desc";
    page?: number;
    size?: number;
  }) => {
    const search = new URLSearchParams();

    if (params?.assigned !== undefined) search.set("assigned", String(params.assigned));
    if (params?.sortBy) search.set("sortBy", params.sortBy);
    if (params?.sortDir) search.set("sortDir", params.sortDir);
    if (params?.page !== undefined) search.set("page", String(params.page));
    if (params?.size !== undefined) search.set("size", String(params.size));

    const query = search.toString();
    return request<PageResponse<Job>>(`/jobs${query ? `?${query}` : ""}`);
  },

  listJobs: (params?: {
    assigned?: boolean;
    sortBy?: "date" | "name";
    sortDir?: "asc" | "desc";
    page?: number;
    size?: number;
  }) => {
    const search = new URLSearchParams();

    if (params?.assigned !== undefined) search.set("assigned", String(params.assigned));
    if (params?.sortBy) search.set("sortBy", params.sortBy);
    if (params?.sortDir) search.set("sortDir", params.sortDir);
    if (params?.page !== undefined) search.set("page", String(params.page));
    if (params?.size !== undefined) search.set("size", String(params.size));

    const query = search.toString();
    return request<PageResponse<Job>>(`/jobs${query ? `?${query}` : ""}`);
  },

  getJob: (id: number) => request<Job>(`/jobs/${id}`),

  patchJob: (id: number, payload: JobPatch) =>
    request<Job>(`/jobs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  getTemps: (params?: {
    jobId?: number;
    sortBy?: "id" | "name" | "jobCount";
    sortDir?: "asc" | "desc";
    page?: number;
    size?: number;
  }) => {
    const search = new URLSearchParams();

    if (params?.jobId !== undefined) search.set("jobId", String(params.jobId));
    if (params?.sortBy) search.set("sortBy", params.sortBy);
    if (params?.sortDir) search.set("sortDir", params.sortDir);
    if (params?.page !== undefined) search.set("page", String(params.page));
    if (params?.size !== undefined) search.set("size", String(params.size));

    const query = search.toString();
    return request<PageResponse<Temp>>(`/temps${query ? `?${query}` : ""}`);
  },

  listTemps: (params?: {
    jobId?: number;
    sortBy?: "id" | "name" | "jobCount";
    sortDir?: "asc" | "desc";
    page?: number;
    size?: number;
  }) => {
    const search = new URLSearchParams();

    if (params?.jobId !== undefined) search.set("jobId", String(params.jobId));
    if (params?.sortBy) search.set("sortBy", params.sortBy);
    if (params?.sortDir) search.set("sortDir", params.sortDir);
    if (params?.page !== undefined) search.set("page", String(params.page));
    if (params?.size !== undefined) search.set("size", String(params.size));

    const query = search.toString();
    return request<PageResponse<Temp>>(`/temps${query ? `?${query}` : ""}`);
  },

  getTemp: (id: number) => request<TempWithJobs>(`/temps/${id}`),

  sendChatMessage: (payload: ChatRequest) =>
    request<ChatResponse>(
      "/chat",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      MCP_BASE_URL,
    ),

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