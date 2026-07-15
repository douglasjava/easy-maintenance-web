import { buildMonthGrid, monthRange, groupItemsByDueDate, countByStatus, toDateKey } from "./calendarUtils";
import type { Item } from "./shared";

function buildItem(overrides: Partial<Item>): Item {
  return {
    id: "1",
    itemType: "EXTINTOR",
    itemCategory: "OPERATIONAL",
    status: "OK",
    nextDueAt: "2026-07-10",
    ...overrides,
  };
}

describe("buildMonthGrid", () => {
  it("returns a 42-cell grid (6 weeks) starting on Sunday", () => {
    const grid = buildMonthGrid(2026, 6); // julho/2026
    expect(grid).toHaveLength(42);
    expect(grid[0].date).toBe("2026-06-28"); // domingo anterior ao dia 1
  });

  it("marks days belonging to the requested month", () => {
    const grid = buildMonthGrid(2026, 6);
    const julyDays = grid.filter((d) => d.inCurrentMonth);
    expect(julyDays).toHaveLength(31);
    expect(julyDays[0].date).toBe("2026-07-01");
    expect(julyDays[30].date).toBe("2026-07-31");
  });

  it("marks today's cell when it falls within the grid", () => {
    const grid = buildMonthGrid(2026, 6, new Date(2026, 6, 15));
    const today = grid.find((d) => d.date === "2026-07-15");
    expect(today?.isToday).toBe(true);
  });
});

describe("monthRange", () => {
  it("returns first and last day of the month", () => {
    expect(monthRange(2026, 6)).toEqual({ fromDate: "2026-07-01", toDate: "2026-07-31" });
  });

  it("handles February on a leap year", () => {
    expect(monthRange(2028, 1)).toEqual({ fromDate: "2028-02-01", toDate: "2028-02-29" });
  });
});

describe("groupItemsByDueDate", () => {
  it("groups items by their nextDueAt date", () => {
    const items = [
      buildItem({ id: "1", nextDueAt: "2026-07-10" }),
      buildItem({ id: "2", nextDueAt: "2026-07-10" }),
      buildItem({ id: "3", nextDueAt: "2026-07-20" }),
    ];
    const grouped = groupItemsByDueDate(items);
    expect(grouped["2026-07-10"]).toHaveLength(2);
    expect(grouped["2026-07-20"]).toHaveLength(1);
  });

  it("ignores items without nextDueAt", () => {
    const items = [buildItem({ id: "1", nextDueAt: "" })];
    const grouped = groupItemsByDueDate(items);
    expect(Object.keys(grouped)).toHaveLength(0);
  });
});

describe("countByStatus", () => {
  it("counts items per status", () => {
    const items = [
      buildItem({ status: "OVERDUE" }),
      buildItem({ status: "OVERDUE" }),
      buildItem({ status: "NEAR_DUE" }),
    ];
    expect(countByStatus(items)).toEqual({ OK: 0, NEAR_DUE: 1, OVERDUE: 2 });
  });
});

describe("toDateKey", () => {
  it("formats as YYYY-MM-DD with zero padding", () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});
