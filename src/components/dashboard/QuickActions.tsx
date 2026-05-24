import Link from "next/link";

interface QuickAction {
  label: string;
  description: string;
  url: string;
  icon: string;
  isPrimary?: boolean;
}

const actions: QuickAction[] = [
  {
    label: "Itens",
    description: "Gerenciar equipamentos",
    url: "/items",
    icon: "📦",
    isPrimary: true,
  },
  {
    label: "Manutenções",
    description: "Registrar e acompanhar",
    url: "/maintenances",
    icon: "🔧",
  },
  {
    label: "IA Onboarding",
    description: "Gerar plano automático",
    url: "/ai-onboarding",
    icon: "🤖",
  },
];

export function QuickActions() {
  return (
    <div className="mt-4" data-tour="quick-actions">
      <div
        className="fw-semibold text-muted text-uppercase mb-3"
        style={{ fontSize: "0.68rem", letterSpacing: "0.07em" }}
      >
        Acesso rápido
      </div>

      <div className="row g-2">
        {actions.map((action, idx) => (
          <div key={idx} className="col-12 col-sm-4">
            <Link
              href={action.url}
              className="text-decoration-none d-block h-100"
            >
              <div
                className="d-flex align-items-center gap-3 p-3 rounded-3 h-100"
                style={{
                  border: action.isPrimary
                    ? "1.5px solid #2563eb"
                    : "1.5px solid #e5e7eb",
                  backgroundColor: action.isPrimary ? "#eff6ff" : "#fafafa",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "";
                  (e.currentTarget as HTMLElement).style.boxShadow = "";
                }}
              >
                <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>{action.icon}</span>
                <div className="min-w-0">
                  <div
                    className="fw-semibold"
                    style={{
                      fontSize: "0.875rem",
                      color: action.isPrimary ? "#1d4ed8" : "#0f172a",
                    }}
                  >
                    {action.label}
                  </div>
                  <div
                    className="text-muted"
                    style={{ fontSize: "0.75rem", lineHeight: 1.2 }}
                  >
                    {action.description}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
