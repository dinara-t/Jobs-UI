const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type ErrorLikeBody = {
  message?: string;
  reply?: string;
  error?: string;
};

export class HttpError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    const resolvedMessage =
      typeof body === "string"
        ? body
        : ((body as ErrorLikeBody | null)?.message ??
          (body as ErrorLikeBody | null)?.reply ??
          (body as ErrorLikeBody | null)?.error ??
          `Request failed with status ${status}`);

    super(resolvedMessage);
    this.status = status;
    this.body = body;
  }
}

async function parseBody(res: Response) {
  const text = await res.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function http<T>(
  path: string,
  opts?: {
    method?: HttpMethod;
    body?: BodyInit | null;
    headers?: Record<string, string>;
    credentials?: RequestCredentials;
  },
  overrideBaseUrl?: string,
): Promise<T> {
  const res = await fetch(`${overrideBaseUrl ?? baseUrl}${path}`, {
    method: opts?.method ?? "GET",
    body: opts?.body,
    headers: opts?.headers,
    credentials: opts?.credentials ?? "include",
  });

  const body = await parseBody(res);

  if (!res.ok) {
    throw new HttpError(res.status, body);
  }

  return body as T;
}