import { z } from "zod";

const isRealCalendarDay = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
};

/** A calendar day ("YYYY-MM-DD") with no time zone attached. */
export const calendarDay = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "must be a date in YYYY-MM-DD format")
  .refine(isRealCalendarDay, "must be a real calendar date");

const title = z
  .string()
  .trim()
  .min(1, "title is required")
  .max(200, "title must be 200 characters or fewer");

export const taskIdParams = z.object({
  id: z.string().min(1).max(64),
});

export const listTasksQuery = z.object({
  view: z.enum(["all", "today", "completed"]).default("all"),
  search: z.string().trim().max(200).optional(),
  today: calendarDay.optional(),
});

export const summaryQuery = z.object({
  today: calendarDay.optional(),
});

export const createTaskBody = z.strictObject({
  title,
  dueDate: calendarDay.nullable().optional(),
});

export const updateTaskBody = z
  .strictObject({
    title: title.optional(),
    dueDate: calendarDay.nullable().optional(),
    completed: z.boolean().optional(),
  })
  .refine((body) => Object.keys(body).length > 0, "provide at least one field to update");

export type ListTasksQuery = z.infer<typeof listTasksQuery>;
export type CreateTaskInput = z.infer<typeof createTaskBody>;
export type UpdateTaskInput = z.infer<typeof updateTaskBody>;
