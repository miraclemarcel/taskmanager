/**
 * Shared OpenAPI 3.0.3 building blocks used by every module's docs:
 * security scheme, error envelope schemas and reusable error responses.
 */

export type ModuleDocs = {
  tags: object[];
  paths: Record<string, unknown>;
  schemas: Record<string, unknown>;
};

export const securitySchemes = {
  ApiKeyAuth: {
    type: "apiKey",
    in: "header",
    name: "x-api-key",
    description: [
      "Every endpoint except `GET /health` requires an API key sent in the `x-api-key` request header.",
      "",
      "**Getting a key:** keys are issued by the server operator. The server reads the list of valid keys from the",
      "`API_KEYS` environment variable — a comma-separated list (e.g. `API_KEYS=key-for-web,key-for-mobile`).",
      "Any value in that list is accepted; rotate a key by adding the new value, deploying, then removing the old one.",
      "",
      "**Using a key:** send it on every request, e.g. `curl -H \"x-api-key: <your-key>\" http://localhost:4000/api/v1/tasks`.",
      "In this documentation UI, click **Authorize** and paste the key once to use \"Try it out\".",
      "",
      "A missing or unrecognised key results in `401 UNAUTHORIZED`. Keep keys secret — do not embed them in public client code you do not control.",
    ].join("\n"),
  },
};

export const sharedSchemas = {
  ValidationErrorDetail: {
    type: "object",
    description:
      "A single validation problem. `path` points at the offending field (dot-separated for nested fields; empty string for problems with the whole body or query).",
    required: ["path", "message"],
    properties: {
      path: {
        type: "string",
        description: "Location of the invalid value, e.g. `title`, `dueDate`, `view`. Empty string when the problem applies to the whole input.",
        example: "title",
      },
      message: {
        type: "string",
        description: "Human-readable explanation of what is wrong with the value.",
        example: "Title must be between 1 and 200 characters",
      },
    },
  },
  ErrorResponse: {
    type: "object",
    description:
      "Envelope returned for every non-2xx response. Clients should branch on `error.code` (stable, machine-readable) rather than on `error.message` (human-readable, may change).",
    required: ["success", "error"],
    properties: {
      success: {
        type: "boolean",
        enum: [false],
        description: "Always `false` for error responses.",
        example: false,
      },
      error: {
        type: "object",
        required: ["code", "message"],
        properties: {
          code: {
            type: "string",
            enum: ["VALIDATION_ERROR", "UNAUTHORIZED", "NOT_FOUND", "INTERNAL_ERROR", "SERVICE_UNAVAILABLE"],
            description: [
              "Machine-readable error code:",
              "- `VALIDATION_ERROR` (400) — request path, query or body failed validation; see `details`.",
              "- `UNAUTHORIZED` (401) — the `x-api-key` header is missing or not a valid key.",
              "- `NOT_FOUND` (404) — the requested resource (or route) does not exist.",
              "- `INTERNAL_ERROR` (500) — unexpected server failure; safe to retry later.",
              "- `SERVICE_UNAVAILABLE` (503) — a dependency (e.g. the database) is unreachable.",
            ].join("\n"),
            example: "NOT_FOUND",
          },
          message: {
            type: "string",
            description: "Human-readable summary of the error, suitable for logs or developer-facing messages.",
            example: "Task not found",
          },
          details: {
            type: "array",
            description: "Present only for `VALIDATION_ERROR`: one entry per invalid field.",
            items: { $ref: "#/components/schemas/ValidationErrorDetail" },
          },
        },
      },
    },
  },
};

export const sharedResponses = {
  ValidationError: {
    description:
      "Validation failed. The request was well-formed JSON but one or more path parameters, query parameters or body fields were invalid (wrong type, out of range, unknown field, etc.). `error.details` lists every problem.",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
        examples: {
          invalidBody: {
            summary: "Invalid request body",
            value: {
              success: false,
              error: {
                code: "VALIDATION_ERROR",
                message: "Request validation failed",
                details: [
                  { path: "title", message: "Title must be between 1 and 200 characters" },
                  { path: "dueDate", message: "dueDate must be a calendar date in YYYY-MM-DD format" },
                ],
              },
            },
          },
          invalidQuery: {
            summary: "Invalid query parameter",
            value: {
              success: false,
              error: {
                code: "VALIDATION_ERROR",
                message: "Request validation failed",
                details: [{ path: "view", message: "view must be one of: all, today, completed" }],
              },
            },
          },
        },
      },
    },
  },
  Unauthorized: {
    description: "The `x-api-key` header is missing or does not match any key configured in `API_KEYS`.",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
        examples: {
          missingKey: {
            summary: "Header not sent",
            value: { success: false, error: { code: "UNAUTHORIZED", message: "Missing x-api-key header" } },
          },
          invalidKey: {
            summary: "Unknown key",
            value: { success: false, error: { code: "UNAUTHORIZED", message: "Invalid API key" } },
          },
        },
      },
    },
  },
  NotFound: {
    description: "No resource exists with the given identifier (it may never have existed or may have been deleted).",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
        example: {
          success: false,
          error: { code: "NOT_FOUND", message: "Task not found" },
        },
      },
    },
  },
  InternalError: {
    description:
      "An unexpected error occurred on the server. No partial changes are applied. The request can be retried; if it keeps failing, contact the API operator.",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
        example: {
          success: false,
          error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
        },
      },
    },
  },
};
