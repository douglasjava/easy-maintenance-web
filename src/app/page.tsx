"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";

// Tipos do dashboard
interface DashboardKpis {
  itemsTotal: number;
  overdueCount: number;
  nearDueCount: number;
  dueSoonCount: number;
  maintenancesThisMonth: number;
  avgDaysToResolve: number;
  complianceScore: number;
}

interface AttentionItem {
  id?: string | number;
  title?: string;
  description?: string;
  dueAt?: string;
  status?: string;
}

interface BreakdownByItemType { itemType: string; count: number }

interface DashboardResponse {
  kpis: DashboardKpis;
  attentionNow: AttentionItem[];
  calendar: any[];
  breakdowns: {
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    byItemType: BreakdownByItemType[];
  };
  quickActions: { type: string; label: string; [k: string]: any }[];
}

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  // Filtros/params
  const [daysAhead, setDaysAhead] = useState(30);
  const [nearDueThresholdDays, setNearDueThresholdDays] = useState(7);
  const [limitAttention, setLimitAttention] = useState(5);

  // Estado de dados
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verifica sessão no cliente: se não houver token/org, vai para /login
    try {
      const token = typeof window !== "undefined" ? window.localStorage.getItem("accessToken") : null;
      const org = typeof window !== "undefined" ? window.localStorage.getItem("organizationCode") : null;
      if (token && org) {
        setIsAuthed(true);
      } else {
        router.replace("/login");
      }
    } catch {
      router.replace("/login");
    } finally {
      setChecking(false);
    }
  }, [router]);

  const params = useMemo(() => ({ daysAhead, nearDueThresholdDays, limitAttention }), [daysAhead, nearDueThresholdDays, limitAttention]);

  async function fetchDashboard() {
    setError(null);
    setLoading(true);
    try {
      const res = await api.get<DashboardResponse>("/dashboard", { params });
      setData(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Falha ao carregar dashboard.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthed && !checking) {
      fetchDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed, checking]);

  if (checking) {
    return <p className="p-3 m-0">Carregando…</p>;
  }

  if (!isAuthed) {
    // Um frame intermediário até o router efetivar o replace
    return <p className="p-3 m-0">Redirecionando para login…</p>;
  }

  function formatDate(dt?: string) {
    if (!dt) return "-";
    try {
      const d = new Date(dt + (dt.includes("T") ? "" : "T00:00:00"));
      return d.toLocaleDateString("pt-BR");
    } catch {
      return dt;
    }
  }

  return (
    <section>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="h4 m-0">Dashboard</h1>
      </div>

      {/* Filtros de parâmetros da rota */}
      <form
        className="card mb-3"
        onSubmit={(e) => {
          e.preventDefault();
          fetchDashboard();
        }}
      >
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-4">
              <label className="form-label">Dias à frente</label>
              <input
                type="number"
                min={1}
                max={365}
                className="form-control"
                value={daysAhead}
                onChange={(e) => setDaysAhead(Number(e.target.value))}
              />
              <div className="form-text">Default: 30</div>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">Limiar "vencendo" (dias)</label>
              <input
                type="number"
                min={1}
                max={60}
                className="form-control"
                value={nearDueThresholdDays}
                onChange={(e) => setNearDueThresholdDays(Number(e.target.value))}
              />
              <div className="form-text">Default: 7</div>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">Limite de atenção agora</label>
              <input
                type="number"
                min={1}
                max={20}
                className="form-control"
                value={limitAttention}
                onChange={(e) => setLimitAttention(Number(e.target.value))}
              />
              <div className="form-text">Default: 5</div>
            </div>
          </div>
          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-outline-primary" type="submit" disabled={loading}>
              {loading ? "Atualizando…" : "Atualizar"}
            </button>
            <button
              className="btn btn-outline-secondary"
              type="button"
              disabled={loading}
              onClick={() => {
                setDaysAhead(30);
                setNearDueThresholdDays(7);
                setLimitAttention(5);
              }}
            >
              Resetar padrões
            </button>
          </div>
          {error && <p className="text-danger mt-2 mb-0">{error}</p>}
        </div>
      </form>

      {/* KPIs */}
      <div className="row g-3 mb-3">
        <div className="col-6 col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <div className="text-muted small">Itens</div>
              <div className="h4 m-0">{data?.kpis?.itemsTotal ?? "-"}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <div className="text-muted small">Atrasados</div>
              <div className="h4 m-0">{data?.kpis?.overdueCount ?? "-"}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <div className="text-muted small">Vencendo</div>
              <div className="h4 m-0">{data?.kpis?.nearDueCount ?? "-"}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <div className="text-muted small">Este mês</div>
              <div className="h4 m-0">{data?.kpis?.maintenancesThisMonth ?? "-"}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {/* Atenção agora */}
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h2 className="h6">Atenção agora</h2>
              {loading && <p className="m-0">Carregando…</p>}
              {!loading && (data?.attentionNow?.length ?? 0) === 0 && (
                <p className="text-muted m-0">Sem pendências imediatas.</p>
              )}
              {!loading && (data?.attentionNow?.length ?? 0) > 0 && (
                <ul className="list-group">
                  {data!.attentionNow!.map((it, idx) => (
                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-semibold">{it.title || it.status || "Item"}</div>
                        {it.description && <div className="small text-muted">{it.description}</div>}
                      </div>
                      <div className="text-nowrap small text-muted">{formatDate(it.dueAt)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Quebras */}
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h2 className="h6">Distribuições</h2>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="border rounded p-2 h-100">
                    <div className="fw-semibold mb-1">Por Status</div>
                    {data?.breakdowns?.byStatus ? (
                      <ul className="m-0 ps-3">
                        {Object.entries(data.breakdowns.byStatus).map(([key, val]) => (
                          <li key={key}>{key}: {val}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-muted">-</div>
                    )}
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="border rounded p-2 h-100">
                    <div className="fw-semibold mb-1">Por Categoria</div>
                    {data?.breakdowns?.byCategory ? (
                      <ul className="m-0 ps-3">
                        {Object.entries(data.breakdowns.byCategory).map(([key, val]) => (
                          <li key={key}>{key}: {val}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-muted">-</div>
                    )}
                  </div>
                </div>
                <div className="col-12">
                  <div className="border rounded p-2">
                    <div className="fw-semibold mb-1">Por Tipo de Item</div>
                    {data?.breakdowns?.byItemType && data.breakdowns.byItemType.length > 0 ? (
                      <ul className="m-0 ps-3">
                        {data.breakdowns.byItemType.map((row) => (
                          <li key={row.itemType}>{row.itemType}: {row.count}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-muted">-</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ações rápidas do backend */}
      <div className="card mt-3">
        <div className="card-body">
          <h2 className="h6">Ações rápidas</h2>
          <div className="d-flex flex-wrap gap-2 mt-2">
            <Link className="btn btn-primary" href="/items/new">+ Cadastrar Item</Link>
            <Link className="btn btn-outline-primary" href="/maintenances/new">Registrar Manutenção</Link>
            <Link className="btn btn-outline-secondary" href="/items">Ver Itens</Link>
            <Link className="btn btn-outline-secondary" href="/maintenances">Ver Manutenções</Link>
            {data?.quickActions?.map((a, idx) => (
              <button
                key={idx}
                type="button"
                className="btn btn-outline-success"
                onClick={() => {
                  if (a.type === "OPEN_SUPPLIERS") {
                    router.push("/maintenances/new");
                  }
                }}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
