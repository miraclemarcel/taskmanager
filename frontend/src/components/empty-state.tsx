"use client";

import { useTasks } from "@/lib/tasks-store";
import { Icon } from "./icon";

type EmptyStateProps = {
  variant: "tasks" | "completed";
  title: string;
  description: string;
  /** The tasks empty state in the design carries a primary action; completed does not. */
  action?: string;
};

export function EmptyState({ variant, title, description, action }: EmptyStateProps) {
  const { openAdd } = useTasks();
  const glyph = variant === "completed" ? "empty-check-circle" : "empty-clipboard";
  const badge = variant === "completed" ? "empty-check-badge" : "empty-plus-badge";

  return (
    <div className="flex min-h-80 flex-col items-center justify-center px-6 py-14 text-center">
      <div className="relative pb-5">
        <span className="flex size-20 items-center justify-center rounded-sheet bg-tint-blue">
          <Icon name={glyph} size={34} />
        </span>
        <span className="absolute -top-1 left-14 flex size-7 items-center justify-center rounded-full border-4 border-surface bg-avatar">
          <Icon name={badge} size={13} />
        </span>
      </div>

      <p className="text-lg leading-7 font-extrabold text-ink">{title}</p>
      <p className="max-w-80 pt-2 text-sm leading-6 text-muted">{description}</p>

      {action ? (
        <button
          type="button"
          onClick={openAdd}
          className="mt-6 flex min-h-11 items-center justify-center gap-2 rounded-field bg-navy px-4 text-sm font-bold text-white shadow-raise transition-opacity hover:opacity-90"
        >
          <Icon name="plus" size={18} />
          {action}
        </button>
      ) : null}
    </div>
  );
}
