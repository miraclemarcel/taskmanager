import type { Request, Response } from "express";
import {
  createTaskBody,
  listTasksQuery,
  summaryQuery,
  taskIdParams,
  updateTaskBody,
} from "./task.schema";
import { taskService } from "./task.service";

// Express 5 forwards rejected promises to the error handler, and ZodErrors
// thrown by .parse() become 400 VALIDATION_ERROR responses there.

export const taskController = {
  async list(req: Request, res: Response) {
    const query = listTasksQuery.parse(req.query);
    const tasks = await taskService.list(query);
    res.json({ success: true, data: tasks, meta: { count: tasks.length } });
  },

  async summary(req: Request, res: Response) {
    const { today } = summaryQuery.parse(req.query);
    res.json({ success: true, data: await taskService.summary(today) });
  },

  async getById(req: Request, res: Response) {
    const { id } = taskIdParams.parse(req.params);
    res.json({ success: true, data: await taskService.getById(id) });
  },

  async create(req: Request, res: Response) {
    const body = createTaskBody.parse(req.body ?? {});
    res.status(201).json({ success: true, data: await taskService.create(body) });
  },

  async update(req: Request, res: Response) {
    const { id } = taskIdParams.parse(req.params);
    const body = updateTaskBody.parse(req.body ?? {});
    res.json({ success: true, data: await taskService.update(id, body) });
  },

  async toggle(req: Request, res: Response) {
    const { id } = taskIdParams.parse(req.params);
    res.json({ success: true, data: await taskService.toggle(id) });
  },

  async remove(req: Request, res: Response) {
    const { id } = taskIdParams.parse(req.params);
    await taskService.remove(id);
    res.status(204).end();
  },
};
