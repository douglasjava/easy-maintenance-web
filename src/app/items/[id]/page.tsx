"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import StatusPill from "@/components/StatusPill";

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuery({
    queryKey: ["item", id],
    queryFn: async () => (await api.get(`/api/items/${id}`)).data,
  });

  function formatDate(dt?: string) {
    if (!dt) return "-";
    try {
      const d = new Date(dt + "T00:00:00");
      return d.toLocaleDateString("pt-BR");
    } catch {
      return dt;
    }
  }

  return (
    <section>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h1 className="h4 m-0">Item</h1>
          <p className="text-muted m-0">Detalhes e próximo vencimento</p>
        </div>
        <div className="d-flex gap-2">
          <Link className="btn btn-outline-secondary" href="/items">← Voltar</Link>
          <Link className="btn btn-primary" href={`/maintenances/new?itemId=${id}`}>Registrar Manutenção</Link>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {isLoading && <p className="m-0">Carregando…</p>}
          {error && <p className="m-0 text-danger">Erro ao carregar.</p>}
          {!isLoading && !error && data && (
            <>
              <div className="row g-3 align-items-center mb-2">
                <div className="col">
                  <div className="text-muted small">Tipo</div>
                  <div className="fw-medium">{data.itemType}</div>
                </div>
                <div className="col-auto text-end">
                  <div className="text-muted small">Status</div>
                  <StatusPill status={data.status} />
                </div>
              </div>

              <div className="row g-3 mb-2">
                <div className="col-12 col-md-4">
                  <div className="text-muted small">Categoria</div>
                  <div className="fw-medium">{data.itemCategory}</div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="text-muted small">Próximo vencimento</div>
                  <div className="fw-medium">{formatDate(data.nextDueAt)}</div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="text-muted small">Última manutenção</div>
                  <div className="fw-medium">{formatDate(data.lastPerformedAt)}</div>
                </div>
              </div>

              {data.location && (
                <div className="mb-2">
                  <div className="text-muted small mb-1">Localização</div>
                  <pre className="small bg-light p-3 rounded overflow-auto mb-0">{JSON.stringify(data.location, null, 2)}</pre>
                </div>
              )}

              <div className="row g-3 mb-2">
                {data.itemCategory === "REGULATORIA" ? (
                  <>
                    <div className="col-12 col-md-4">
                      <div className="text-muted small">Norma</div>
                      <div className="fw-medium">{data.normId ?? "-"}</div>
                    </div>
                    <div className="col-12 col-md-8 text-muted small d-flex align-items-end">
                      Periodicidade proveniente da norma cadastrada.
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-12 col-md-4">
                      <div className="text-muted small">Unidade</div>
                      <div className="fw-medium">{data.customPeriodUnit}</div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="text-muted small">Quantidade</div>
                      <div className="fw-medium">{data.customPeriodQty}</div>
                    </div>
                  </>
                )}
              </div>

              <div className="text-muted small">
                ID: <code>{data.id}</code> • Org: <code>{data.organizationId}</code>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
