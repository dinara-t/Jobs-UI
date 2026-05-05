import { HttpError } from "./http";

type ErrorBody = {
  message?: string;
  reply?: string;
  error?: string;
};

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof HttpError) {
    if (typeof error.body === "string") {
      return error.body;
    }

    const body = error.body as ErrorBody | null;
    return body?.message ?? body?.reply ?? body?.error ?? error.message ?? fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}