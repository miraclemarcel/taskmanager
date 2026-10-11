import { Router } from "express";
import { taskController } from "./task.controller";

export const taskRouter = Router();

// "/summary" must be registered before "/:id" so it isn't captured as an id.
taskRouter.get("/", taskController.list);
taskRouter.get("/summary", taskController.summary);
taskRouter.post("/", taskController.create);
taskRouter.get("/:id", taskController.getById);
taskRouter.patch("/:id", taskController.update);
taskRouter.patch("/:id/toggle", taskController.toggle);
taskRouter.delete("/:id", taskController.remove);
