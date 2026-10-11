import { Router } from "express";
import { prisma } from "../../lib/prisma";

export const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  const base = { uptime: Math.round(process.uptime()), timestamp: new Date().toISOString() };
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, data: { status: "ok", ...base, database: "up" } });
  } catch {
    res.status(503).json({
      success: false,
      error: { code: "SERVICE_UNAVAILABLE", message: "Database is unreachable" },
    });
  }
});
