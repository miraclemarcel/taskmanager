export type Task = {
  id: string;
  title: string;
  /** ISO calendar day (yyyy-mm-dd), or null when no due date was set. */
  dueDate: string | null;
  completed: boolean;
  /** ISO timestamps set by the API. */
  createdAt: string;
  updatedAt: string;
};

export type TaskDraft = {
  title: string;
  dueDate: string | null;
};

export type ViewId = "all" | "today" | "completed";
