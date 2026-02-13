interface KPIGridProps {
  kpis: {
    itemsTotal: number;
    overdueCount: number;
    dueSoonCount: number;
    maintenancesThisMonth: number;
  };
}

export function KPIGrid({ kpis }: KPIGridProps) {
  return (
    <div className="row g-4 mb-5">
      <div className="col-12 col-md-6 col-xl-3">
        <KPICard 
          label="Items Total" 
          value={kpis.itemsTotal} 
          colorClass="text-primary" 
        />
      </div>
      <div className="col-12 col-md-6 col-xl-3">
        <KPICard 
          label="Atrasados" 
          value={kpis.overdueCount} 
          colorClass="text-danger" 
        />
      </div>
      <div className="col-12 col-md-6 col-xl-3">
        <KPICard 
          label="Vencendo em breve" 
          value={kpis.dueSoonCount} 
          colorClass="text-warning" 
        />
      </div>
      <div className="col-12 col-md-6 col-xl-3">
        <KPICard 
          label="Este mês" 
          value={kpis.maintenancesThisMonth} 
          colorClass="text-dark" 
        />
      </div>
    </div>
  );
}

function KPICard({ label, value, colorClass }: { label: string; value: number; colorClass: string }) {
  return (
    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
      <div className="card-body p-4">
        <div className="text-muted small fw-medium mb-1 text-uppercase tracking-wider">{label}</div>
        <div className={`h2 fw-bold mb-0 ${colorClass}`}>
          {value.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
