import type { ModuleDocs } from "../../docs/components";

export const healthDocs: ModuleDocs = {
  tags: [
    {
      name: "Health",
      description:
        "Liveness and readiness probe. Use it from load balancers, uptime monitors or container orchestrators. It is public (no API key) and performs a lightweight database check, so a `200` means the API can actually serve requests.",
    },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Check service health",
        description: [
          "Reports whether the API process is running and whether it can reach its database.",
          "",
          "- Returns **200** with `status: \"ok\"` and `database: \"up\"` when everything is healthy.",
          "- Returns **503** with code `SERVICE_UNAVAILABLE` when the database cannot be reached; the process is alive but cannot serve task requests.",
          "",
          "This endpoint is **public** — no `x-api-key` header is required — and it is not versioned under `/api/v1`.",
        ].join("\n"),
        operationId: "getHealth",
        security: [],
        responses: {
          "200": {
            description: "Service and database are healthy.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" },
                example: {
                  success: true,
                  data: {
                    status: "ok",
                    uptime: 1234.56,
                    timestamp: "2026-10-11T14:32:05.123Z",
                    database: "up",
                  },
                },
              },
            },
          },
          "500": { $ref: "#/components/responses/InternalError" },
          "503": {
            description: "The process is running but the database is unreachable, so the API cannot serve requests.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: {
                  success: false,
                  error: { code: "SERVICE_UNAVAILABLE", message: "Database is unreachable" },
                },
              },
            },
          },
        },
      },
    },
  },
  schemas: {
    HealthResponse: {
      type: "object",
      description: "Successful health check envelope.",
      required: ["success", "data"],
      properties: {
        success: { type: "boolean", enum: [true], example: true },
        data: {
          type: "object",
          required: ["status", "uptime", "timestamp", "database"],
          properties: {
            status: {
              type: "string",
              enum: ["ok"],
              description: "Overall service status. Always `ok` on a 200 response.",
              example: "ok",
            },
            uptime: {
              type: "number",
              format: "double",
              description: "Seconds since the API process started.",
              example: 1234.56,
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "Server time (UTC, ISO 8601) at which the check ran.",
              example: "2026-10-11T14:32:05.123Z",
            },
            database: {
              type: "string",
              enum: ["up"],
              description: "Database connectivity. Always `up` on a 200 response.",
              example: "up",
            },
          },
        },
      },
    },
  },
};
