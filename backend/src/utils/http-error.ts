export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "INTERNAL_ERROR"
  | "SERVICE_UNAVAILABLE";

export type ErrorDetail = { path: string; message: string };

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
    readonly details?: ErrorDetail[],
  ) {
    super(message);
    this.name = "HttpError";
  }

  static notFound(message = "Resource not found") {
    return new HttpError(404, "NOT_FOUND", message);
  }

  static unauthorized(message = "A valid API key is required") {
    return new HttpError(401, "UNAUTHORIZED", message);
  }
}
