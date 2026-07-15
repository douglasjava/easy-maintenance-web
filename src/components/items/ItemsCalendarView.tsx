"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { STATUS_CONFIG, type Item } from "./shared";
import { buildMonthGrid, monthRange, groupItemsByDueDate, countByStatus } from "./calendarUtils";
import ItemsCalendarDayPanel from "./ItemsCalendarDayPanel";

interface ItemsCalendarViewProps {
  status: string;
  categoria: string;
  itemType: string;
}

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const MONTH_LABELS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function ItemsCalendarView({ status, categoria, itemType }: ItemsCalendarViewProps) {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const { fromDate, toDate } = monthRange(cursor.year, cursor.month);
  const grid = useMemo(() => buildMonthGrid(cursor.year, cursor.month, today), [cursor, today]);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["items-calendar", { fromDate, toDate, status, categoria, itemType }],
    queryFn: async () => {
      const params: Record<string, string> = { fromDate, toDate };
      if (status) params.status = status;
      if (categoria) params.categoria = categoria;
      if (itemType) params.itemType = itemType;
      const res = await api.get("/items/calendar", { params });
      return res.data as Item[];
    },
  });

  const items = useMemo(() => data ?? [], [data]);
  const grouped = useMemo(() => groupItemsByDueDate(items), [items]);

  function goToPreviousMonth() {
    setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }));
  }

  function goToNextMonth() {
    setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }));
  }

  const isCurrentMonth = cursor.year === today.getFullYear() && cursor.month === today.getMonth();

  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 10 }}>
      <div className="card-body p-3">
        {/* ── Navegação de mês ── */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={goToPreviousMonth}>
            ← Anterior
          </button>
          <div className="d-flex align-items-center gap-2">
            <span
              className="fw-semibold"
              style={{ fontSize: "0.95rem", color: isCurrentMonth ? "#2563eb" : "#0f172a" }}
            >
              {MONTH_LABELS[cursor.month]} {cursor.year}
            </span>
            {isCurrentMonth && (
              <span
                className="badge rounded-pill"
                style={{ backgroundColor: "#e7f0fe", color: "#2563eb", fontSize: "0.65rem", fontWeight: 600 }}
              >
                Mês atual
              </span>
            )}
          </div>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={goToNextMonth}>
            Próximo →
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="placeholder-glow py-4">
            <span className="placeholder col-12" style={{ height: 240, borderRadius: 8 }} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center px-3">
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>⚠️</div>
            <div className="fw-semibold text-dark mb-1" style={{ fontSize: "0.9rem" }}>
              Erro ao carregar o calendário
            </div>
            <div className="text-muted mb-3" style={{ fontSize: "0.8rem" }}>
              Verifique sua conexão e tente novamente.
            </div>
            <button className="btn btn-outline-primary btn-sm" onClick={() => refetch()}>
              Tentar novamente
            </button>
          </div>
        )}

        {/* Grid */}
        {!isLoading && !error && (
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 560 }}>
              <div className="d-grid" style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                {WEEKDAY_LABELS.map((wd) => (
                  <div
                    key={wd}
                    className="text-center"
                    style={{ fontSize: "0.68rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", padding: "4px 0" }}
                  >
                    {wd}
                  </div>
                ))}

                {grid.map((day) => {
                  const dayItems = grouped[day.date] ?? [];
                  const counts = countByStatus(dayItems);
                  const total = dayItems.length;
                  const dayNumber = Number(day.date.slice(8, 10));

                  return (
                    <button
                      key={day.date}
                      type="button"
                      disabled={total === 0}
                      onClick={() => setSelectedDate(day.date)}
                      className="d-flex flex-column align-items-start text-start"
                      style={{
                        minHeight: 72,
                        padding: "6px 8px",
                        borderRadius: 8,
                        border: day.isToday ? "1.5px solid #2563eb" : "1px solid #e5e7eb",
                        backgroundColor: day.inCurrentMonth ? "#fff" : "#f8f9fa",
                        opacity: day.inCurrentMonth ? 1 : 0.5,
                        cursor: total > 0 ? "pointer" : "default",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: day.isToday ? 700 : 500,
                          color: day.isToday ? "#2563eb" : "#374151",
                        }}
                      >
                        {dayNumber}
                      </span>

                      {total > 0 && (
                        <>
                          <div className="d-flex gap-1 mt-1">
                            {(Object.keys(STATUS_CONFIG) as (keyof typeof STATUS_CONFIG)[])
                              .filter((s) => counts[s] > 0)
                              .map((s) => (
                                <span
                                  key={s}
                                  title={STATUS_CONFIG[s].label}
                                  style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: "50%",
                                    backgroundColor: STATUS_CONFIG[s].dot,
                                  }}
                                />
                              ))}
                          </div>
                          <span className="mt-auto" style={{ fontSize: "0.68rem", color: "#6b7280", fontWeight: 600 }}>
                            {total} {total === 1 ? "item" : "itens"}
                          </span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <ItemsCalendarDayPanel
        date={selectedDate}
        items={selectedDate ? grouped[selectedDate] ?? [] : []}
        onClose={() => setSelectedDate(null)}
      />
    </div>
  );
}
