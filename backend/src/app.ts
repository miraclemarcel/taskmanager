import cors from "cors";
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { fullDocs, taskModuleDocs } from "./docs/openapi";
import { API_KEY_HEADER, requireApiKey } from "./middleware/api-key";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { healthRouter } from "./modules/health/health.routes";
import { taskRouter } from "./modules/task";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  // Swagger UI ships inline bootstrapping, so CSP is relaxed only for /docs.
  app.use("/docs", helmet({ contentSecurityPolicy: false }));
  app.use(helmet());

  // CORS runs before the API-key check so browser preflight (OPTIONS) requests,
  // which never carry custom headers, are answered instead of rejected.
  app.use(
    cors({
      origin(origin, callback) {
        // Non-browser clients (curl, server-to-server) send no Origin header.
        if (!origin || env.CORS_ORIGINS.includes(origin)) return callback(null, true);
        callback(null, false);
      },
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", API_KEY_HEADER],
      maxAge: 600,
    }),
  );

  app.use(express.json({ limit: env.JSON_BODY_LIMIT }));

  app.use("/health", healthRouter);

  if (env.DOCS_ENABLED) {
    const all = fullDocs(env.API_PUBLIC_URL);
    const tasks = taskModuleDocs(env.API_PUBLIC_URL);
    const uiOptions = { swaggerOptions: { persistAuthorization: true } };

    app.get("/docs/openapi.json", (_req, res) => res.json(all));
    app.get("/docs/tasks/openapi.json", (_req, res) => res.json(tasks));
    // The more specific module docs must be mounted before the catch-all /docs.
    app.use("/docs/tasks", swaggerUi.serveFiles(tasks), swaggerUi.setup(tasks, uiOptions));
    app.use("/docs", swaggerUi.serveFiles(all), swaggerUi.setup(all, uiOptions));
  }

  // Everything under /api requires a valid key.
  const api = express.Router();
  api.use(requireApiKey);
  api.use("/v1/tasks", taskRouter);
  app.use("/api", api);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
