import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";
import { Prisma } from "../generated/prisma/client";
import { HttpError } from "../utils/http-error";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(HttpError.notFound(`Route ${req.method} ${req.path} does not exist`));
};

function toHttpError(err: unknown): HttpError {
  if (err instanceof HttpError) return err;

  if (err instanceof ZodError) {
    return new HttpError(
      400,
      "VALIDATION_ERROR",
      "Request validation failed",
      err.issues.map((issue) => ({
        path: issue.path.join(".") || "(root)",
        message: issue.message,
      })),
    );
  }

  // Record targeted by update/delete vanished between lookup and write.
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
    return HttpError.notFound("Task not found");
  }

  // Raised by express.json() for malformed or oversized bodies.
  if (typeof err === "object" && err !== null && "type" in err) {
    const type = (err as { type: string }).type;
    if (type === "entity.parse.failed") {
      return new HttpError(400, "VALIDATION_ERROR", "Request body is not valid JSON");
    }
    if (type === "entity.too.large") {
      return new HttpError(400, "VALIDATION_ERROR", `Request body exceeds ${env.JSON_BODY_LIMIT}`);
    }
  }

  return new HttpError(500, "INTERNAL_ERROR", "Something went wrong");
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const httpError = toHttpError(err);
  if (httpError.status >= 500) console.error(err);

  res.status(httpError.status).json({
    success: false,
    error: {
      code: httpError.code,
      message: httpError.message,
      ...(httpError.details ? { details: httpError.details } : {}),
    },
  });
};
