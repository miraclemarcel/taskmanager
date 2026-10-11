"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTasks } from "@/lib/tasks-store";
import type { ViewId } from "@/lib/types";
import { Icon } from "./icon";

const NAV: { id: ViewId; href: string; label: string; icon: string }[] = [
  { id: "all", href: "/", label: "All Tasks", icon: "nav-all" },
  { id: "today", href: "/today", label: "Today", icon: "nav-today" },
  { id: "completed", href: "/completed", label: "Completed", icon: "nav-completed" },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { counts } = useTasks();

  return (
    <div className="flex h-full flex-col border-r border-line bg-surface px-4 py-5">
      <div className="flex h-12 items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-field bg-navy shadow-raise">
            <Icon name="logo-check-lg" size={20} />
          </span>
          <span className="text-[20px] font-extrabold tracking-[-0.5px] text-navy">
            QuickTask
          </span>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-field text-muted transition-colors hover:bg-tint-blue"
          >
            <Icon name="close" size={20} />
          </button>
        ) : null}
      </div>

      <nav className="mt-9 flex flex-col gap-1.5">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onClose}
              aria-current={active ? "page" : undefined}
              className={[
                "flex h-12 items-center gap-3 rounded-field px-3.5 transition-colors",
                active ? "bg-navy shadow-raise" : "hover:bg-tint-blue",
              ].join(" ")}
            >
              <Icon name={item.icon} size={19} className={active ? "icon-on-dark" : undefined} />
              <span
                className={[
                  "flex-1 text-sm font-bold",
                  active ? "text-white" : "text-muted",
                ].join(" ")}
              >
                {item.label}
              </span>
              <span
                className={[
                  "text-xs font-bold",
                  active ? "text-white/70" : "text-faint",
                ].join(" ")}
              >
                {counts[item.id]}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-card bg-tint-blue p-4">
        <span className="flex size-9 items-center justify-center rounded-field bg-surface shadow-stat">
          <Icon name="promo-clipboard" size={19} />
        </span>
        <p className="pt-3 text-sm font-extrabold text-navy">Make today count.</p>
        <p className="pt-1 text-xs leading-5 text-muted">
          Small tasks add up to meaningful progress.
        </p>
      </div>
    </div>
  );
}
