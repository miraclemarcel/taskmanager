"use client";

import { useMemo, useState } from "react";
import type { Task } from "@/lib/types";
import { EmptyState } from "./empty-state";
import { Icon } from "./icon";
import { TaskRow } from "./task-row";

type TaskPanelProps = {
  heading: string;
  tasks: Task[];
  empty: { variant: "tasks" | "completed"; title: string; description: string; action?: string };
};

export function TaskPanel({ heading, tasks, empty }: TaskPanelProps) {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return tasks;
    return tasks.filter((task) => task.title.toLowerCase().includes(term));
  }, [tasks, query]);

  const searching = query.trim().length > 0;

  return (
    <section className="mt-7 overflow-hidden rounded-card border border-line bg-surface shadow-panel">
      <div className="flex items-center justify-between gap-4 border-b border-line p-4">
        <div className="min-w-0">
          <h2 className="text-base font-extrabold text-ink">{heading}</h2>
          <p className="pt-0.5 text-xs font-semibold text-muted">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </p>
        </div>

        <div className="flex h-9 shrink-0 items-center gap-2 rounded-field border border-line bg-subtle px-3 focus-within:border-navy">
          <Icon name="search" size={16} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            aria-label={`Search ${heading.toLowerCase()}`}
            className="w-28 bg-transparent text-sm font-medium text-ink outline-none placeholder:text-faint lg:w-48"
          />
        </div>
      </div>

      {visible.length > 0 ? (
        <ul>
          {visible.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </ul>
      ) : searching ? (
        <div className="flex min-h-80 flex-col items-center justify-center px-6 py-14 text-center">
          <p className="text-lg leading-7 font-extrabold text-ink">No matching tasks</p>
          <p className="max-w-80 pt-2 text-sm leading-6 text-muted">
            Nothing here matches &ldquo;{query.trim()}&rdquo;. Try a different search.
          </p>
        </div>
      ) : (
        <EmptyState {...empty} />
      )}
    </section>
  );
}
