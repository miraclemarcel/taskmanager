import "dotenv/config";
import { z } from "zod";

const csv = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  /** Comma-separated list so keys can be rotated without downtime. */
  API_KEYS: z
    .string()
    .transform(csv)
    .pipe(
      z
        .array(z.string().min(32, "each API key must be at least 32 characters"))
        .min(1, "API_KEYS must contain at least one key"),
    ),
  /** Comma-separated list of browser origins allowed to call the API. */
  CORS_ORIGINS: z.string().default("http://localhost:3000").transform(csv),
  /** Public base URL shown in Swagger's "Servers" dropdown. */
  API_PUBLIC_URL: z.string().url().optional(),
  DOCS_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  JSON_BODY_LIMIT: z.string().default("100kb"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = {
  ...parsed.data,
  API_PUBLIC_URL: parsed.data.API_PUBLIC_URL ?? `http://localhost:${parsed.data.PORT}`,
};
