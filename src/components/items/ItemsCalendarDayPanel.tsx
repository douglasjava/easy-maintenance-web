import { useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { StatusBadge, CategoryBadge, type Item } from "./shared";

interface ItemsCalendarDayPanelProps {
  date: string | null; // YYYY-MM-DD, null = fechado
  items: Item[];
  onClose: () => void;
}

function formatDayLabel(dateKey: string) {
  const d = new Date(dateKey + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
}

export default function ItemsCalendarDayPanel({ date, items, onClose }: ItemsCalendarDayPanelProps) {
  const show = date != null;

  useEffect(() => {
    if (show) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [show]);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape" && show) onClose();
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [show, onClose]);

  if (!show || !date) return null;

  return createPortal(
    <>
      <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1060 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow rounded-4 overflow-hidden">
            <div className="modal-header border-0 bg-light p-4">
              <h5 className="modal-title fw-bold text-capitalize">{formatDayLabel(date)}</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body p-0" style={{ maxHeight: "60vh", overflowY: "auto" }}>
              {items.length === 0 ? (
                <div className="text-center text-muted py-5" style={{ fontSize: "0.85rem" }}>
                  Nenhum item vencendo neste dia.
                </div>
              ) : (
                <div className="d-flex flex-column">
                  {items.map((it) => (
                    <Link
                      key={it.id}
                      href={`/items/${it.id}?origin=items`}
                      className="d-flex align-items-center justify-content-between gap-2 px-4 py-3 text-decoration-none"
                      style={{ borderBottom: "1px solid #f1f5f9", color: "inherit" }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          className="fw-semibold text-dark"
                          style={{ fontSize: "0.88rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                          title={it.itemType}
                        >
                          {it.itemType}
                        </div>
                        <div className="mt-1">
                          <CategoryBadge category={it.itemCategory} />
                        </div>
                      </div>
                      <StatusBadge status={it.status} />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer border-0 p-3">
              <button className="btn btn-light rounded-pill px-4 w-100" onClick={onClose}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show" onClick={onClose} style={{ zIndex: 1059 }} />
    </>,
    document.body
  );
}
