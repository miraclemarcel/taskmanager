import { addDaysIso } from "./dates";
import type { Task } from "./types";

/**
 * Stand-in for the API. Due dates are relative to the day the app is opened so
 * the Today view is never empty, and so the counts match the Figma file:
 * 4 total, 3 pending, 1 completed, 3 due today.
 */
export function createMockTasks(): Task[] {
  return [
    { id: "task-1", title: "Finish project proposal", dueDate: addDaysIso(0), completed: false },
    { id: "task-2", title: "Review presentation slides", dueDate: addDaysIso(0), completed: false },
    { id: "task-3", title: "Send meeting notes", dueDate: addDaysIso(0), completed: true },
    { id: "task-4", title: "Prepare weekly report", dueDate: addDaysIso(1), completed: false },
  ];
}
