"use client";

type Props = {
  page: number;
  size: number;
  totalPages: number;
  onChange: (nextPage: number) => void;
};

export default function Pagination({ page, totalPages, onChange }: Props) {
  const canPrev = page > 0;
  const canNext = page + 1 < totalPages;
  return (
    <div className="d-flex align-items-center justify-content-between mt-3">
      <small className="text-muted">Página {Math.min(page + 1, totalPages || 1)} de {totalPages || 1}</small>
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
