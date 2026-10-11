export type Task = {
  id: string;
  title: string;
  /** ISO calendar day (yyyy-mm-dd), or null when no due date was set. */
  dueDate: string | null;
  completed: boolean;
};

export type TaskDraft = {
  title: string;
  dueDate: string | null;
};

export type ViewId = "all" | "today" | "completed";
