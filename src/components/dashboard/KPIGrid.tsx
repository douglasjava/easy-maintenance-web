interface KPIGridProps {
  kpis: {
    itemsTotal: number;
    overdueCount: number;
    dueSoonCount: number;
    maintenancesThisMonth: number;
  };
}

interface KPICardProps {
  label: string;
  value: number;
  accentColor: string;
  bgColor?: string;
  icon: string;
}

function KPICard({ label, value, accentColor, bgColor, icon }: KPICardProps) {
  return (
    <div
      className="card border-0 shadow-sm h-100 overflow-hidden"
      style={{ borderRadius: 12, backgroundColor: bgColor ?? "#fff" }}
    >
      {/* Accent bar */}
      <div style={{ height: 3, backgroundColor: accentColor }} />
      <div className="card-body p-3 p-md-4">
        <div className="d-flex align-items-start justify-content-between gap-2">
          <div className="min-w-0">
            <div
              className="text-muted text-uppercase fw-semibold mb-2"
              style={{ fontSize: "0.68rem", letterSpacing: "0.07em", lineHeight: 1.2 }}
            >
              {label}
            </div>
            <div
              className="fw-bold lh-1"
              style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", color: accentColor }}
            >
              {value.toLocaleString("pt-BR")}
            </div>
          </div>
          <div
            className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: 36,
              height: 36,
              backgroundColor: accentColor + "18",
              fontSize: "1rem",
            }}
          >
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

export function KPIGrid({ kpis }: KPIGridProps) {
  return (
    <div className="row g-3 mb-4" data-tour="kpi-grid">
      <div className="col-6 col-xl-3">
        <KPICard
          label="Itens cadastrados"
          value={kpis.itemsTotal}
          accentColor="#2563eb"
          icon="📦"
        />
      </div>
      <div className="col-6 col-xl-3">
        <KPICard
          label="Atrasados"
          value={kpis.overdueCount}
          accentColor="#ef4444"
          bgColor={kpis.overdueCount > 0 ? "#fff5f5" : undefined}
          icon="⚠️"
        />
      </div>
      <div className="col-6 col-xl-3">
        <KPICard
          label="Vencendo em breve"
          value={kpis.dueSoonCount}
          accentColor="#f59e0b"
          icon="🕐"
        />
      </div>
      <div className="col-6 col-xl-3">
        <KPICard
          label="Realizados este mês"
          value={kpis.maintenancesThisMonth}
          accentColor="#10b981"
          icon="✅"
        />
      </div>
    </div>
  );
}
