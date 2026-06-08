import Link from "next/link";

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
  href?: string;
}

function KPICard({ label, value, accentColor, bgColor, icon, href }: KPICardProps) {
  const inner = (
    <div
      className="card border-0 shadow-sm h-100 overflow-hidden"
      style={{
        borderRadius: 12,
        backgroundColor: bgColor ?? "#fff",
        cursor: href ? "pointer" : "default",
        transition: "box-shadow 0.15s, transform 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!href) return;
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "";
        (e.currentTarget as HTMLDivElement).style.transform = "";
      }}
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

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none", display: "block", height: "100%" }}>
        {inner}
      </Link>
    );
  }

  return inner;
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
          href="/items"
        />
      </div>
      <div className="col-6 col-xl-3">
        <KPICard
          label="Atrasados"
          value={kpis.overdueCount}
          accentColor="#ef4444"
          bgColor={kpis.overdueCount > 0 ? "#fff5f5" : undefined}
          icon="⚠️"
          href="/items?status=OVERDUE"
        />
      </div>
      <div className="col-6 col-xl-3">
        <KPICard
          label="Vencendo em breve"
          value={kpis.dueSoonCount}
          accentColor="#f59e0b"
          icon="🕐"
          href="/items?status=NEAR_DUE"
        />
      </div>
      <div className="col-6 col-xl-3">
        <KPICard
          label="Realizados este mês"
          value={kpis.maintenancesThisMonth}
          accentColor="#10b981"
          icon="✅"
          href="/maintenances"
        />
      </div>
    </div>
  );
}
