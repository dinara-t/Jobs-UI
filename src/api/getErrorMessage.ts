import { HttpError } from "./http";

type ErrorBody = {
  message?: string;
};

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof HttpError) {
    if (typeof error.body === "string") {
      return error.body;
    }

    const body = error.body as ErrorBody | null;
    return body?.message ?? fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
