import type { Task, TaskDraft, ViewId } from "@/lib/types";
import { request } from "./http";

type Envelope<T> = { success: true; data: T };
type ListEnvelope<T> = Envelope<T> & { meta: { count: number } };

export type TaskSummary = { all: number; today: number; completed: number; pending: number };

export type ListTasksParams = {
  view?: ViewId;
  search?: string;
  /** The viewer's local calendar day, so "today" matches their clock rather than the server's. */
  today?: string;
};

function query(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

/** Every task endpoint exposed by the backend's Tasks module. */
export const tasksApi = {
  async list(params: ListTasksParams = {}): Promise<Task[]> {
    const res = await request<ListEnvelope<Task[]>>(`/tasks${query(params)}`);
    return res.data;
  },

  async summary(today?: string): Promise<TaskSummary> {
    const res = await request<Envelope<TaskSummary>>(`/tasks/summary${query({ today })}`);
    return res.data;
  },

  async get(id: string): Promise<Task> {
    const res = await request<Envelope<Task>>(`/tasks/${encodeURIComponent(id)}`);
    return res.data;
  },

  async create(draft: TaskDraft): Promise<Task> {
    const res = await request<Envelope<Task>>("/tasks", {
      method: "POST",
      body: JSON.stringify(draft),
    });
    return res.data;
  },

  async update(id: string, changes: Partial<TaskDraft> & { completed?: boolean }): Promise<Task> {
    const res = await request<Envelope<Task>>(`/tasks/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(changes),
    });
    return res.data;
  },

  async toggle(id: string): Promise<Task> {
    const res = await request<Envelope<Task>>(`/tasks/${encodeURIComponent(id)}/toggle`, {
      method: "PATCH",
    });
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await request<void>(`/tasks/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
};
