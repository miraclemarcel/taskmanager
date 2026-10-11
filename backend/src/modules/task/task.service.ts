import { prisma } from "../../lib/prisma";
import type { Prisma } from "../../generated/prisma/client";
import { HttpError } from "../../utils/http-error";
import type { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from "./task.schema";

const pad = (n: number) => String(n).padStart(2, "0");

/** Server-local calendar day; callers should pass their own `today` to avoid time-zone drift. */
function serverToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export const taskService = {
  list({ view, search, today }: ListTasksQuery) {
    const where: Prisma.TaskWhereInput = {};
    if (view === "today") where.dueDate = today ?? serverToday();
    if (view === "completed") where.completed = true;
    if (search) where.title = { contains: search, mode: "insensitive" };

    return prisma.task.findMany({ where, orderBy: { createdAt: "asc" } });
  },

  async summary(today?: string) {
    const day = today ?? serverToday();
    const [all, dueToday, completed] = await prisma.$transaction([
      prisma.task.count(),
      prisma.task.count({ where: { dueDate: day } }),
      prisma.task.count({ where: { completed: true } }),
    ]);
    return { all, today: dueToday, completed, pending: all - completed };
  },

  async getById(id: string) {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) throw HttpError.notFound("Task not found");
    return task;
  },

  create(input: CreateTaskInput) {
    return prisma.task.create({
      data: { title: input.title, dueDate: input.dueDate ?? null },
    });
  },

  async update(id: string, input: UpdateTaskInput) {
    await this.getById(id);
    return prisma.task.update({ where: { id }, data: input });
  },

  toggle(id: string) {
    return prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({ where: { id }, select: { completed: true } });
      if (!task) throw HttpError.notFound("Task not found");
      return tx.task.update({ where: { id }, data: { completed: !task.completed } });
    });
  },

  async remove(id: string) {
    await this.getById(id);
    await prisma.task.delete({ where: { id } });
  },
};
