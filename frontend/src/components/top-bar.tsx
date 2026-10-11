"use client";

import { Icon } from "./icon";

export function TopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-[24px] lg:hidden">
      <div className="mx-auto flex h-[68px] w-full max-w-shell items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Open menu"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-field transition-colors hover:bg-tint-blue"
          >
            <Icon name="menu" size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-check bg-navy">
              <Icon name="logo-check" size={17} />
            </span>
            <span className="text-base font-extrabold text-navy">QuickTask</span>
          </div>
        </div>
        <Avatar />
      </div>
    </header>
  );
}

export function Avatar() {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-avatar text-sm font-extrabold text-navy">
      AM
    </span>
  );
}
