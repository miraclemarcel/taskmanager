/**
 * Calendar-day helpers. Everything is handled as a local yyyy-mm-dd string so a
 * task due "today" stays due today regardless of the viewer's clock offset —
 * going through Date.toISOString() would shift the day either side of UTC.
 */

const pad = (n: number) => String(n).padStart(2, "0");

export function toIsoDay(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayIso(): string {
  return toIsoDay(new Date());
}

export function addDaysIso(offset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return toIsoDay(date);
}

/** "Oct 11, 2026" — the format the design uses on every task row. */
export function formatDueDate(iso: string | null): string | null {
  if (!iso) return null;
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
