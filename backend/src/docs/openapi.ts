import { securitySchemes, sharedResponses, sharedSchemas, type ModuleDocs } from "./components";
import { healthDocs } from "../modules/health/health.docs";
import { taskDocs } from "../modules/task/task.docs";

export type BuildOpenApiOptions = {
  title: string;
  description: string;
  version: string;
  serverUrl: string;
  modules: ModuleDocs[];
};

/**
 * Merges module docs into a single OpenAPI 3.0.3 document.
 * Shared schemas/responses/security are always included; every operation
 * requires ApiKeyAuth by default unless it overrides `security` (e.g. `/health`).
 */
export function buildOpenApiDocument(opts: BuildOpenApiOptions) {
  const tags: object[] = [];
  const paths: Record<string, unknown> = {};
  const schemas: Record<string, unknown> = { ...sharedSchemas };

  for (const mod of opts.modules) {
    tags.push(...mod.tags);
    Object.assign(paths, mod.paths);
    Object.assign(schemas, mod.schemas);
  }

  return {
    openapi: "3.0.3",
    info: {
      title: opts.title,
      description: opts.description,
      version: opts.version,
    },
    servers: [{ url: opts.serverUrl, description: "API server" }],
    tags,
    paths,
    components: {
      securitySchemes,
      schemas,
      responses: sharedResponses,
    },
    security: [{ ApiKeyAuth: [] }],
  };
}

const VERSION = "1.0.0";

const COMMON_DESCRIPTION = [
  "**Authentication** — send your API key in the `x-api-key` header on every request (click **Authorize** above to try requests here). `GET /health` is the only public endpoint.",
  "",
  "**Responses** — all bodies are JSON. Successful responses use `{ \"success\": true, \"data\": ... }`; list responses also include `meta`. Errors use `{ \"success\": false, \"error\": { \"code\", \"message\", \"details?\" } }` where `code` is one of `VALIDATION_ERROR` (400), `UNAUTHORIZED` (401), `NOT_FOUND` (404), `INTERNAL_ERROR` (500) or `SERVICE_UNAVAILABLE` (503).",
  "",
  "**Dates** — due dates are plain calendar days (`YYYY-MM-DD`); timestamps are ISO 8601 UTC.",
].join("\n");

export function fullDocs(serverUrl: string) {
  return buildOpenApiDocument({
    title: "QuickTask API",
    description: [
      "REST API behind the QuickTask to-do app: create, list, filter, edit, complete and delete tasks, plus dashboard counts and a health check.",
      "",
      COMMON_DESCRIPTION,
    ].join("\n"),
    version: VERSION,
    serverUrl,
    modules: [healthDocs, taskDocs],
  });
}

export function taskModuleDocs(serverUrl: string) {
  return buildOpenApiDocument({
    title: "QuickTask API — Tasks module",
    description: [
      "Reference for the Tasks module only: task CRUD, completion toggling, view/search filtering and dashboard summary counts.",
      "",
      COMMON_DESCRIPTION,
    ].join("\n"),
    version: VERSION,
    serverUrl,
    modules: [taskDocs],
  });
}
