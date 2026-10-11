"use client";

import { formatDueDate } from "@/lib/dates";
import { useTasks } from "@/lib/tasks-store";
import type { Task } from "@/lib/types";
import { Modal } from "./modal";

export function DeleteTaskModal({ task }: { task: Task }) {
  const { deleteTask, closeDialog } = useTasks();
  const due = formatDueDate(task.dueDate);

  return (
    <Modal
      title="Delete this task?"
      description={
        <>This action can&rsquo;t be undone. The task will be permanently removed from your list.</>
      }
      onClose={closeDialog}
      closeIcon={{ name: "close-narrow", size: 20, width: 12 }}
    >
      <div className="mt-6 rounded-field border border-line bg-subtle p-4">
        <p className="text-sm font-bold text-ink">{task.title}</p>
        {due ? (
          <p className="pt-1 text-xs font-semibold text-muted" suppressHydrationWarning>
            Due {due}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 pt-6">
        <button
          type="button"
          onClick={() => deleteTask(task.id)}
          className="flex min-h-11 items-center justify-center rounded-field bg-danger px-4 text-sm font-bold text-white shadow-raise transition-opacity hover:opacity-90"
        >
          Delete task
        </button>
        <button
          type="button"
          onClick={closeDialog}
          className="flex min-h-11 items-center justify-center rounded-field border border-line bg-surface px-4 text-sm font-bold text-ink transition-colors hover:bg-subtle"
        >
          Keep task
        </button>
      </div>
    </Modal>
  );
}
