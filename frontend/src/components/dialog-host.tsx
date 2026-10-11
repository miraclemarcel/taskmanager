"use client";

import { useTasks } from "@/lib/tasks-store";
import { DeleteTaskModal } from "./delete-task-modal";
import { TaskFormModal } from "./task-form-modal";

export function DialogHost() {
  const { dialog } = useTasks();

  if (dialog.kind === "add") return <TaskFormModal />;
  if (dialog.kind === "edit") return <TaskFormModal key={dialog.task.id} task={dialog.task} />;
  if (dialog.kind === "delete") return <DeleteTaskModal task={dialog.task} />;
  return null;
}
