import { getToken, clearToken } from "../state/tokenStore";

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export class HttpError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(typeof body === "string" ? body : "Request failed");
    this.status = status;
    this.body = body;
  }
}

async function parseBody(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function http<T>(
  path: string,
  opts?: { method?: HttpMethod; body?: unknown; auth?: boolean },
): Promise<T> {
  const method = opts?.method ?? "GET";
  const auth = opts?.auth ?? true;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    credentials: "include",
    body: opts?.body === undefined ? undefined : JSON.stringify(opts.body),
  });

  const body = await parseBody(res);

  if (res.status === 401) {
    clearToken();
  }

  if (!res.ok) {
    throw new HttpError(res.status, body);
  }

  return body as T;
}
