"use client";

import { useEffect, useState, type ReactNode } from "react";
import { DialogHost } from "./dialog-host";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Navigating closes the drawer via each link's own onClose, so no effect
  // needs to mirror the pathname back into state.

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <div className="flex min-h-dvh">
      {/* Persistent rail once there is room for it. On mobile the same
          component rides in as the drawer below. */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 lg:block">
        <Sidebar />
      </aside>

      <div
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
        className={[
          "fixed inset-0 z-40 bg-navy/40 backdrop-blur-[8px] transition-opacity duration-200 lg:hidden",
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      />
      <aside
        aria-hidden={!menuOpen}
        className={[
          "fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-200 ease-out lg:hidden",
          menuOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <Sidebar onClose={() => setMenuOpen(false)} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onOpenMenu={() => setMenuOpen(true)} />
        <main className="mx-auto w-full max-w-shell px-4 py-7 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>

      <DialogHost />
    </div>
  );
}
