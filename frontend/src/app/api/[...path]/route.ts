import type { NextRequest } from "next/server";

/*
 * Same-origin proxy to the QuickTask backend. The browser calls /api/tasks/...,
 * and this handler forwards the request with the API key attached server-side,
 * so the key never reaches client JavaScript.
 */

const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

// Only resources the frontend actually uses are forwarded.
const ALLOWED_ROOTS = new Set(["tasks"]);

function errorResponse(status: number, code: string, message: string) {
  return Response.json({ success: false, error: { code, message } }, { status });
}

async function forward(req: NextRequest, ctx: RouteContext<"/api/[...path]">) {
  if (!API_URL || !API_KEY) {
    return errorResponse(500, "INTERNAL_ERROR", "API_URL and API_KEY must be set in .env.local");
  }

  const { path } = await ctx.params;
  if (!ALLOWED_ROOTS.has(path[0])) {
    return errorResponse(404, "NOT_FOUND", "Unknown API route");
  }

  const target = new URL(`/api/v1/${path.map(encodeURIComponent).join("/")}`, API_URL);
  target.search = req.nextUrl.search;

  const hasBody = req.method === "POST" || req.method === "PATCH";

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers: {
        "x-api-key": API_KEY,
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
      },
      body: hasBody ? await req.text() : undefined,
      cache: "no-store",
    });
  } catch {
    return errorResponse(502, "BAD_GATEWAY", "The task service is unreachable. Is the backend running?");
  }

  if (upstream.status === 204) return new Response(null, { status: 204 });

  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" },
  });
}

export { forward as GET, forward as POST, forward as PATCH, forward as DELETE };
