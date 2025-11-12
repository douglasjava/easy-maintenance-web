"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/apiClient";
import StatusPill from "@/components/StatusPill";
import Pagination from "@/components/Pagination";

type Item = {
  id: string;
  itemType: string;
  itemCategory: "REGULATORIA" | "OPERACIONAL";
  status: "OK" | "NEAR_DUE" | "OVERDUE";
  nextDueAt: string;
};

type PageResp<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // page index
  size: number;
};

export default function ItemsPage() {
  const [status, setStatus] = useState<string>("");
  const [itemType, setItemType] = useState<string>("");
  const [page, setPage] = useState(0);
  const size = 10;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["items", { status, itemType, page, size }],
    queryFn: async () => {
      const params: Record<string, any> = { page, size };
      if (status) params.status = status;
      if (itemType) params.itemType = itemType;
      const res = await api.get("/api/items", { params });
      // pode vir lista ou page — normalizar:
      if (Array.isArray(res.data)) {
        return {
          content: res.data as Item[],
          totalPages: 1,
          totalElements: res.data.length,
          number: 0,
          size: res.data.length,
        } as PageResp<Item>;
      }
      return res.data as PageResp<Item>;
    },
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
        <h1 className="h4 m-0">Itens</h1>
        <Link className="btn btn-primary" href="/items/new">+ Novo Item</Link>
      </div>

      {/* Filtros */}
      <div className="card mb-3">
        <div className="card-body">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(0);
              refetch();
            }}
          >
            <div className="row g-3 align-items-end">
              <div className="col-12 col-md-4">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="OK">Em dia</option>
                  <option value="NEAR_DUE">Vencendo</option>
                  <option value="OVERDUE">Atrasado</option>
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Tipo</label>
                <input
                  className="form-control"
                  placeholder="EXTINTOR / SPDA / CAIXA_DAGUA..."
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value.toUpperCase())}
                />
              </div>

              <div className="col-12 col-md-2">
                <button className="btn btn-outline-secondary w-100" type="submit">Aplicar</button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Tabela */}
      <div className="card">
        <div className="card-body p-0">
          {isLoading && <p className="p-3 m-0">Carregando…</p>}
          {error && <p className="p-3 m-0 text-danger">Erro ao carregar.</p>}

          {!isLoading && !error && (
            <>
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Item</th>
                      <th>Categoria</th>
                      <th>Próximo venc.</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.content ?? []).map((it) => (
                      <tr key={it.id}>
                        <td>{it.itemType}</td>
                        <td>{it.itemCategory}</td>
                        <td>{formatDate(it.nextDueAt)}</td>
                        <td><StatusPill status={it.status} /></td>
                        <td className="text-end">
                          <Link className="btn btn-sm btn-outline-secondary" href={`/items/${it.id}`}>Abrir</Link>
                        </td>
                      </tr>
                    ))}
                    {data?.content?.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-muted text-center py-3">
                          Nenhum item encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-3 pb-3">
                <Pagination
                  page={data?.number ?? 0}
                  size={data?.size ?? 10}
                  totalPages={data?.totalPages ?? 1}
                  onChange={setPage}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
