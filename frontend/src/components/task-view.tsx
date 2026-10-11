"use client";

import type { ViewId } from "@/lib/types";
import { useTasksForView } from "@/store";
import { PageIntro } from "./page-intro";
import { SummaryCards } from "./summary-cards";
import { TaskPanel } from "./task-panel";

type TaskViewProps = {
  view: ViewId;
  title: string;
  description: string;
  heading: string;
  empty: { variant: "tasks" | "completed"; title: string; description: string; action?: string };
};

export function TaskView({ view, title, description, heading, empty }: TaskViewProps) {
  const tasks = useTasksForView(view);

  return (
    <>
      <PageIntro title={title} description={description} />
      <SummaryCards />
      <TaskPanel heading={heading} tasks={tasks} empty={empty} />
    </>
  );
}
