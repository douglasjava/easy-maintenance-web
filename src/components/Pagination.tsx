"use client";

type Props = {
  page: number;
  size: number;
  totalPages: number;
  onChange: (nextPage: number) => void;
  onSizeChange?: (nextSize: number) => void;
};

export default function Pagination({ page, size, totalPages, onChange, onSizeChange }: Props) {
  const canPrev = page > 0;
  const canNext = page + 1 < totalPages;
  return (
    <div className="d-flex align-items-center justify-content-between mt-3 flex-wrap gap-2">
      <div className="d-flex align-items-center gap-3">
        <small className="text-muted text-nowrap">Página {Math.min(page + 1, totalPages || 1)} de {totalPages || 1}</small>
        
        {onSizeChange && (
          <div className="d-flex align-items-center gap-2">
            <small className="text-muted text-nowrap">Itens por página:</small>
            <select 
              className="form-select form-select-sm" 
              style={{ width: "auto" }}
              value={size}
              onChange={(e) => onSizeChange(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}
      </div>

      <nav aria-label="Paginação">
        <ul className="pagination mb-0">
          <li className={`page-item ${!canPrev ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => canPrev && onChange(page - 1)} aria-label="Anterior">
              <span aria-hidden="true">&laquo;</span>
            </button>
          </li>
          <li className={`page-item ${!canNext ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => canNext && onChange(page + 1)} aria-label="Próxima">
              <span aria-hidden="true">&raquo;</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
