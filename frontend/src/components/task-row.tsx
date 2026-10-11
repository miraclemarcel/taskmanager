"use client";

import { formatDueDate } from "@/lib/dates";
import { useTasks } from "@/lib/tasks-store";
import type { Task } from "@/lib/types";
import { Icon } from "./icon";

export function TaskRow({ task }: { task: Task }) {
  const { toggleTask, openEdit, openDelete } = useTasks();
  const due = formatDueDate(task.dueDate);

  return (
    <li
      className={[
        "flex items-center gap-3 border-b border-line p-4 last:border-b-0",
        task.completed ? "bg-rowdone" : "bg-surface",
      ].join(" ")}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={task.completed}
        onClick={() => toggleTask(task.id)}
        aria-label={task.completed ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
        className={[
          "flex size-6 shrink-0 items-center justify-center rounded-check border transition-colors",
          task.completed
            ? "border-success bg-success"
            : "border-checkline bg-surface hover:border-navy",
        ].join(" ")}
      >
        <Icon name={task.completed ? "check-white" : "checkbox-empty"} size={15} />
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={[
            "truncate text-[15px] leading-[22.5px] font-bold",
            task.completed ? "text-muted line-through" : "text-ink",
          ].join(" ")}
        >
          {task.title}
        </p>
        {due ? (
          <span className="flex items-center gap-1.5 pt-1">
            <Icon name="calendar-sm" size={14} />
            <span className="text-xs font-semibold text-muted" suppressHydrationWarning>
              {due}
            </span>
          </span>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center">
        <button
          type="button"
          onClick={() => openEdit(task)}
          aria-label={`Edit "${task.title}"`}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-field transition-colors hover:bg-tint-blue"
        >
          <Icon name="edit" size={18} />
        </button>
        <button
          type="button"
          onClick={() => openDelete(task)}
          aria-label={`Delete "${task.title}"`}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-field transition-colors hover:bg-tint-blue"
        >
          <Icon name="trash" size={18} />
        </button>
      </div>
    </li>
  );
}
