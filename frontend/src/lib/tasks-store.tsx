"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { todayIso } from "./dates";
import { createMockTasks } from "./mock-tasks";
import type { Task, TaskDraft, ViewId } from "./types";

type Dialog =
  | { kind: "closed" }
  | { kind: "add" }
  | { kind: "edit"; task: Task }
  | { kind: "delete"; task: Task };

type TasksContextValue = {
  tasks: Task[];
  counts: Record<ViewId, number> & { pending: number };
  dialog: Dialog;
  tasksForView: (view: ViewId) => Task[];
  openAdd: () => void;
  openEdit: (task: Task) => void;
  openDelete: (task: Task) => void;
  closeDialog: () => void;
  addTask: (draft: TaskDraft) => void;
  updateTask: (id: string, draft: TaskDraft) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
};

const TasksContext = createContext<TasksContextValue | null>(null);

let nextId = 0;
const createId = () => `task-new-${(nextId += 1)}`;

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(createMockTasks);
  const [dialog, setDialog] = useState<Dialog>({ kind: "closed" });

  const closeDialog = useCallback(() => setDialog({ kind: "closed" }), []);

  const addTask = useCallback((draft: TaskDraft) => {
    setTasks((current) => [
      ...current,
      { id: createId(), title: draft.title, dueDate: draft.dueDate, completed: false },
    ]);
    setDialog({ kind: "closed" });
  }, []);

  const updateTask = useCallback((id: string, draft: TaskDraft) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, title: draft.title, dueDate: draft.dueDate } : task,
      ),
    );
    setDialog({ kind: "closed" });
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id));
    setDialog({ kind: "closed" });
  }, []);

  const value = useMemo<TasksContextValue>(() => {
    const today = todayIso();
    // "Today" counts everything dated today, finished or not — the design's
    // Today screen lists a completed task alongside the open ones.
    const dueToday = tasks.filter((task) => task.dueDate === today);
    const completed = tasks.filter((task) => task.completed);

    const tasksForView = (view: ViewId) => {
      if (view === "today") return dueToday;
      if (view === "completed") return completed;
      return tasks;
    };

    return {
      tasks,
      counts: {
        all: tasks.length,
        today: dueToday.length,
        completed: completed.length,
        pending: tasks.length - completed.length,
      },
      dialog,
      tasksForView,
      openAdd: () => setDialog({ kind: "add" }),
      openEdit: (task: Task) => setDialog({ kind: "edit", task }),
      openDelete: (task: Task) => setDialog({ kind: "delete", task }),
      closeDialog,
      addTask,
      updateTask,
      toggleTask,
      deleteTask,
    };
  }, [tasks, dialog, closeDialog, addTask, updateTask, toggleTask, deleteTask]);

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks(): TasksContextValue {
  const context = useContext(TasksContext);
  if (!context) throw new Error("useTasks must be used inside <TasksProvider>");
  return context;
}
