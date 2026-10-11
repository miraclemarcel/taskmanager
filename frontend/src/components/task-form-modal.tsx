"use client";

import { useState, type FormEvent } from "react";
import { useTasks } from "@/lib/tasks-store";
import type { Task } from "@/lib/types";
import { Modal } from "./modal";

export function TaskFormModal({ task }: { task?: Task }) {
  const { addTask, updateTask, closeDialog } = useTasks();
  const [title, setTitle] = useState(task?.title ?? "");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? "");

  const editing = Boolean(task);
  const canSave = title.trim().length > 0;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSave) return;
    const draft = { title: title.trim(), dueDate: dueDate || null };
    if (task) updateTask(task.id, draft);
    else addTask(draft);
  }

  return (
    <Modal title={editing ? "Edit task" : "Add a new task"} onClose={closeDialog}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="task-title" className="text-sm font-bold text-ink">
            Task title <span className="text-danger">*</span>
          </label>
          <input
            id="task-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What needs to be done?"
            required
            className="h-12 rounded-field border border-line bg-surface px-4 text-[15px] font-medium text-ink outline-none transition-colors placeholder:text-faint focus:border-navy"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="task-due" className="text-sm font-bold text-ink">
            Due date
          </label>
          <input
            id="task-due"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="h-12 rounded-field border border-line bg-surface px-4 text-[15px] font-medium text-ink outline-none transition-colors focus:border-navy"
          />
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <button
            type="submit"
            disabled={!canSave}
            className="flex min-h-11 items-center justify-center rounded-field bg-navy px-4 text-sm font-bold text-white shadow-raise transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
          >
            {editing ? "Save changes" : "Save Task"}
          </button>
          <button
            type="button"
            onClick={closeDialog}
            className="flex min-h-11 items-center justify-center rounded-field border border-line bg-surface px-4 text-sm font-bold text-ink transition-colors hover:bg-subtle"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
