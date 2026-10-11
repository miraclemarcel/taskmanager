"use client";

import { useTaskCounts } from "@/store";
import { Icon } from "./icon";

const CARDS = [
  { key: "total", label: "Total Tasks", icon: "stat-total", tint: "bg-tint-blue" },
  { key: "pending", label: "Pending Tasks", icon: "stat-pending", tint: "bg-tint-amber" },
  { key: "completed", label: "Completed", icon: "stat-completed", tint: "bg-tint-green" },
] as const;

export function SummaryCards() {
  const counts = useTaskCounts();
  const values = {
    total: counts.all,
    pending: counts.pending,
    completed: counts.completed,
  };

  return (
    /* The mobile frame clips the third card; making the strip scrollable keeps
       the card width from the design while leaving it reachable. */
    <div className="no-scrollbar -mx-4 mt-7 flex gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
      {CARDS.map((card) => (
        <div
          key={card.key}
          className="flex w-40 shrink-0 items-center gap-4 rounded-card border border-line bg-surface p-4 shadow-stat lg:w-auto"
        >
          <span
            className={`flex size-11 shrink-0 items-center justify-center rounded-field ${card.tint}`}
          >
            <Icon name={card.icon} size={21} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-muted">{card.label}</p>
            <p className="pt-0.5 text-2xl leading-8 font-extrabold tracking-[-0.6px] text-ink">
              {values[card.key]}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
