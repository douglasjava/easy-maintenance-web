"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle, X, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

const STORAGE_KEY = "onboardingChecklist";

type ChecklistState = {
  tourExplored: boolean;
  itemCreated: boolean;
  maintenanceRegistered: boolean;
  normConfigured: boolean;
  dismissed: boolean;
};

const DEFAULT_STATE: ChecklistState = {
  tourExplored: false,
  itemCreated: false,
  maintenanceRegistered: false,
  normConfigured: false,
  dismissed: false,
};

type ChecklistItem = {
  key: keyof Omit<ChecklistState, "dismissed">;
  label: string;
  description: string;
  href: string;
  linkLabel: string;
};

const ITEMS: ChecklistItem[] = [
  {
    key: "tourExplored",
    label: "Explore o Dashboard",
    description: "Conheça os indicadores e o painel de controle",
    href: "/",
    linkLabel: "Ver dashboard",
  },
  {
    key: "itemCreated",
    label: "Cadastre seu primeiro item",
    description: "Adicione um equipamento ou ativo para monitorar",
    href: "/items",
    linkLabel: "Ir para Itens",
  },
  {
    key: "maintenanceRegistered",
    label: "Registre uma manutenção",
    description: "Documente a primeira manutenção realizada",
    href: "/maintenances",
    linkLabel: "Ir para Manutenções",
  },
  {
    key: "normConfigured",
    label: "Configure uma norma",
    description: "Defina as normas regulatórias aplicáveis",
    href: "/norms",
    linkLabel: "Ir para Normas",
  },
];

export default function OnboardingChecklist() {
  const [state, setState] = useState<ChecklistState>(DEFAULT_STATE);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...DEFAULT_STATE, ...JSON.parse(raw) });
    } catch { /* ignore */ }
    setMounted(true);
  }, []);

  function persist(next: ChecklistState) {
    setState(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }

  function toggle(key: keyof Omit<ChecklistState, "dismissed">) {
    persist({ ...state, [key]: !state[key] });
  }

  function dismiss() {
    persist({ ...state, dismissed: true });
  }

  if (!mounted) return null;
  if (state.dismissed) return null;

  const completed = ITEMS.filter(i => state[i.key]);
  const allDone = completed.length === ITEMS.length;

  return (
    <div
      className="card border-0 shadow-sm mb-4"
      style={{ borderRadius: 12, borderLeft: "4px solid #0d6efd" }}
    >
      <div className="card-body p-3 p-md-4">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: "1.1rem" }}>🚀</span>
            <div>
              <h6 className="fw-bold mb-0" style={{ fontSize: "0.95rem" }}>
                Primeiros passos
              </h6>
              <small className="text-muted">
                {completed.length} de {ITEMS.length} concluídos
              </small>
            </div>
          </div>
          <div className="d-flex align-items-center gap-1">
            <button
              className="btn btn-link text-muted p-1 border-0"
              onClick={() => setCollapsed(c => !c)}
              title={collapsed ? "Expandir" : "Recolher"}
            >
              {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
            <button
              className="btn btn-link text-muted p-1 border-0"
              onClick={dismiss}
              title="Fechar checklist"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress mb-3" style={{ height: 6, borderRadius: 4 }}>
          <div
            className="progress-bar bg-primary"
            style={{
              width: `${(completed.length / ITEMS.length) * 100}%`,
              transition: "width 0.3s ease",
            }}
          />
        </div>

        {/* Items list */}
        {!collapsed && (
          <>
            <div className="d-flex flex-column gap-2">
              {ITEMS.map(item => {
                const done = state[item.key];
                return (
                  <div
                    key={item.key}
                    className={`d-flex align-items-center gap-3 p-2 rounded-3 ${done ? "opacity-50" : ""}`}
                    style={{ background: done ? "#f8f9fa" : "transparent" }}
                  >
                    <button
                      className="btn p-0 border-0 flex-shrink-0"
                      onClick={() => toggle(item.key)}
                      title={done ? "Desmarcar" : "Marcar como feito"}
                    >
                      {done
                        ? <CheckCircle2 size={22} className="text-success" />
                        : <Circle size={22} className="text-muted" />
                      }
                    </button>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div className={`fw-semibold small ${done ? "text-decoration-line-through text-muted" : ""}`}>
                        {item.label}
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                        {item.description}
                      </div>
                    </div>
                    {!done && (
                      <Link
                        href={item.href}
                        className="btn btn-outline-primary btn-sm flex-shrink-0"
                        style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}
                      >
                        {item.linkLabel}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>

            {allDone && (
              <div className="text-center mt-3">
                <p className="text-success fw-semibold small mb-1">
                  ✅ Você completou os primeiros passos!
                </p>
                <button className="btn btn-sm btn-success" onClick={dismiss}>
                  Fechar checklist
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
