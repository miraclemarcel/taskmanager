import { Suspense } from "react";
import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { TasksProvider } from "@/lib/tasks-store";

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "QuickTask",
  description: "A personal workspace for keeping track of what needs doing.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${mulish.variable} h-full antialiased`}>
      <body className="min-h-full">
        {/* The mock data dates itself against the current day, which Cache
            Components treats as a runtime value — this boundary keeps that read
            out of the prerender instead of freezing "today" at build time. */}
        <Suspense fallback={<div className="min-h-dvh bg-canvas" />}>
          <TasksProvider>
            <AppShell>{children}</AppShell>
          </TasksProvider>
        </Suspense>
      </body>
    </html>
  );
}
