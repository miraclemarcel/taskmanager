"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { todayIso } from "@/lib/dates";
import type { Task, TaskDraft, ViewId } from "@/lib/types";
import { errorMessage } from "./api/http";
import { tasksApi } from "./api/tasks.api";

type LoadStatus = "idle" | "loading" | "ready" | "error";

type TasksState = {
  tasks: Task[];
  status: LoadStatus;
  /** Why the initial load failed. */
  loadError: string | null;
  /** Last failed toggle (other mutations surface their errors in their dialog). */
  actionError: string | null;

  fetchTasks: () => Promise<void>;
  addTask: (draft: TaskDraft) => Promise<void>;
  updateTask: (id: string, draft: TaskDraft) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  clearActionError: () => void;
};

const replace = (tasks: Task[], next: Task) =>
  tasks.map((task) => (task.id === next.id ? next : task));

export const useTasksStore = create<TasksState>()((set, get) => ({
  tasks: [],
  status: "idle",
  loadError: null,
  actionError: null,

  async fetchTasks() {
    set({ status: "loading", loadError: null });
    try {
      // The full list is small and every view, count and search is derived from
      // it locally, so one request keeps the sidebar, cards and lists in step.
      const tasks = await tasksApi.list();
      set({ tasks, status: "ready" });
    } catch (error) {
      set({ status: "error", loadError: errorMessage(error) });
    }
  },

  // add/update/delete throw on failure so the open dialog can show the message.
  async addTask(draft) {
    const created = await tasksApi.create(draft);
    set((state) => ({ tasks: [...state.tasks, created] }));
  },

  async updateTask(id, draft) {
    const updated = await tasksApi.update(id, draft);
    set((state) => ({ tasks: replace(state.tasks, updated) }));
  },

  async toggleTask(id) {
    const previous = get().tasks.find((task) => task.id === id);
    if (!previous) return;

    // Optimistic: the checkbox responds instantly and rolls back on failure.
    set((state) => ({
      actionError: null,
      tasks: replace(state.tasks, { ...previous, completed: !previous.completed }),
    }));
    try {
      const updated = await tasksApi.toggle(id);
      set((state) => ({ tasks: replace(state.tasks, updated) }));
    } catch (error) {
      set((state) => ({
        tasks: replace(state.tasks, previous),
        actionError: `Couldn’t update “${previous.title}”: ${errorMessage(error)}`,
      }));
    }
  },

  async deleteTask(id) {
    await tasksApi.remove(id);
    set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }));
  },

  clearActionError: () => set({ actionError: null }),
}));

/** Tasks shown by a given sidebar view. */
export function useTasksForView(view: ViewId): Task[] {
  const tasks = useTasksStore((state) => state.tasks);
  return useMemo(() => {
    if (view === "today") {
      // "Today" lists everything dated today, finished or not, as in the design.
      const today = todayIso();
      return tasks.filter((task) => task.dueDate === today);
    }
    if (view === "completed") return tasks.filter((task) => task.completed);
    return tasks;
  }, [tasks, view]);
}

/** Counts for the sidebar badges and summary cards. */
export function useTaskCounts(): Record<ViewId, number> & { pending: number } {
  const tasks = useTasksStore((state) => state.tasks);
  return useMemo(() => {
    const today = todayIso();
    const completed = tasks.filter((task) => task.completed).length;
    return {
      all: tasks.length,
      today: tasks.filter((task) => task.dueDate === today).length,
      completed,
      pending: tasks.length - completed,
    };
  }, [tasks]);
}
