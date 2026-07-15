import type { Item } from "./shared";

export type CalendarDay = {
  date: string; // YYYY-MM-DD
  inCurrentMonth: boolean;
  isToday: boolean;
};

/**
 * Grid dom–sáb do mês (year/month, month 0-indexed), incluindo dias de
 * preenchimento do mês anterior/seguinte para completar semanas inteiras.
 */
export function buildMonthGrid(year: number, month: number, today: Date = new Date()): CalendarDay[] {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay(); // 0 = domingo
  const gridStart = new Date(year, month, 1 - startOffset);

  const todayKey = toDateKey(today);
  const days: CalendarDay[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    const key = toDateKey(d);
    days.push({
      date: key,
      inCurrentMonth: d.getMonth() === month,
      isToday: key === todayKey,
    });
  }
  return days;
}

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function monthRange(year: number, month: number): { fromDate: string; toDate: string } {
  const from = new Date(year, month, 1);
  const to = new Date(year, month + 1, 0);
  return { fromDate: toDateKey(from), toDate: toDateKey(to) };
}

/** Agrupa itens pela data de vencimento (nextDueAt). Itens sem nextDueAt são ignorados. */
export function groupItemsByDueDate(items: Item[]): Record<string, Item[]> {
  const grouped: Record<string, Item[]> = {};
  for (const item of items) {
    if (!item.nextDueAt) continue;
    const key = item.nextDueAt.slice(0, 10);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  }
  return grouped;
}

export function countByStatus(items: Item[]): Record<Item["status"], number> {
  const counts: Record<Item["status"], number> = { OK: 0, NEAR_DUE: 0, OVERDUE: 0 };
  for (const item of items) {
    counts[item.status] = (counts[item.status] ?? 0) + 1;
  }
  return counts;
}
