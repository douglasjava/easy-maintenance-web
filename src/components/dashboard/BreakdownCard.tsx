interface BreakdownCardProps {
  statusBreakdown?: Record<string, number>;
  categoryBreakdown?: Record<string, number>;
  itemTypeBreakdown?: { itemType: string; count: number }[];
}

export function BreakdownCard({
  statusBreakdown,
  categoryBreakdown,
  itemTypeBreakdown
}: BreakdownCardProps) {
  
  const statusLabels: Record<string, string> = {
    "OK": "Em dia",
    "NEAR_DUE": "Vencendo em breve",
    "OVERDUE": "Atrasado"
  };

  const categoryLabels: Record<string, string> = {
    "REGULATORY": "Regulatório",
    "OPERATIONAL": "Operacional"
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Por Status */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
        <div className="card-body p-4">
          <h3 className="h6 fw-bold mb-3 text-dark text-uppercase tracking-wide">📊 Por Status</h3>
          <ul className="list-unstyled mb-0">
            {statusBreakdown && Object.entries(statusBreakdown).map(([key, val]) => (
              <li key={key} className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">
                  <span className={`badge rounded-circle p-1 me-2 ${key === 'OVERDUE' ? 'bg-danger' : key === 'NEAR_DUE' ? 'bg-warning' : 'bg-success'}`}></span>
                  {statusLabels[key] || key}
                </span>
                <span className="fw-bold">{val}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Por Categoria */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
        <div className="card-body p-4">
          <h3 className="h6 fw-bold mb-3 text-dark text-uppercase tracking-wide">📁 Por Categoria</h3>
          <ul className="list-unstyled mb-0">
            {categoryBreakdown && Object.entries(categoryBreakdown).map(([key, val]) => (
              <li key={key} className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">{categoryLabels[key] || key}</span>
                <span className="fw-bold">{val}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Por Tipo de Item */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
        <div className="card-body p-4">
          <h3 className="h6 fw-bold mb-3 text-dark text-uppercase tracking-wide">🏷 Por Tipo de Item</h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <ul className="list-unstyled mb-0">
              {itemTypeBreakdown && itemTypeBreakdown.map((item) => (
                <li key={item.itemType} className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">{item.itemType}</span>
                  <span className="fw-bold">{item.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
