"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import Pagination from "@/components/Pagination";

// Tipos
interface Item {
  id: string | number;
  itemType: string;
}

interface Maintenance {
  id: string | number;
  itemId: string | number;
  performedAt: string; // YYYY-MM-DD
  issuedBy?: string;
}

interface PageResp<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // página atual (0-based)
  size: number;
}

export default function MaintenancesListPage() {
  // Filtros para carregar itens no combo
  const [itemsPage, setItemsPage] = useState(0);
  const [itemsItemType, setItemsItemType] = useState("");
  const itemsSize = 20;

  const {
    data: itemsPageData,
    isLoading: itemsLoading,
    error: itemsError,
    refetch: refetchItems,
    isFetching: itemsFetching,
  } = useQuery({
    queryKey: ["items-for-combo", { itemsPage, itemsSize, itemsItemType }],
    queryFn: async () => {
      const params: Record<string, any> = { page: itemsPage, size: itemsSize };
      if (itemsItemType) params.itemType = itemsItemType;
      const res = await api.get("/items", { params });
      if (Array.isArray(res.data)) {
        const arr = res.data as Item[];
        return {
          content: arr,
          totalPages: 1,
          totalElements: arr.length,
          number: 0,
          size: arr.length,
        } as PageResp<Item>;
      }
      return res.data as PageResp<Item>;
    },
  });

  const items = useMemo(() => itemsPageData?.content ?? [], [itemsPageData]);

  // Item selecionado no combo
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  // Paginação de manutenções
  const [page, setPage] = useState(0);
  const size = 10;

  const {
    data: maints,
    isLoading: maintsLoading,
    error: maintsError,
    refetch: refetchMaints,
    isFetching: maintsFetching,
  } = useQuery({
    enabled: Boolean(selectedItemId),
    queryKey: ["maintenances", { selectedItemId, page, size }],
    queryFn: async () => {
      const params = { page, size };
      const res = await api.get(`/items/${selectedItemId}/maintenances`, { params });
      const d = res.data;
      // Normalização defensiva
      if (Array.isArray(d)) {
        const arr = d as Maintenance[];
        return {
          content: arr,
          totalPages: 1,
          totalElements: arr.length,
          number: 0,
          size: arr.length,
        } as PageResp<Maintenance>;
      }
      return d as PageResp<Maintenance>;
    },
  });

  function formatDate(dt?: string) {
    if (!dt) return "-";
    try {
      const parsed = new Date(dt + "T00:00:00");
      return parsed.toLocaleDateString("pt-BR");
    } catch {
      return dt;
    }
  }

  return (
    <section>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="h4 m-0">Manutenções</h1>
      </div>

      {/* Seleção de Item */}
      <div className="card mb-3">
        <div className="card-body">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setItemsPage(0);
              refetchItems();
            }}
          >
            <div className="row g-3 align-items-end">
              <div className="col-12 col-md-8">
                <label className="form-label">Item</label>
                <select
                  className="form-select"
                  value={selectedItemId}
                  onChange={(e) => {
                    setSelectedItemId(e.target.value);
                    setPage(0);
                    // refetch será acionado pela mudança do query key (selectedItemId)
                  }}
                >
                  <option value="">Selecione um item…</option>
                  {items.map((it) => (
                    <option key={String(it.id)} value={String(it.id)}>
                      {String(it.id)} • {it.itemType}
                    </option>
                  ))}
                </select>
                <div className="form-text">
                  A lista é carregada de /items. Use o filtro de tipo para refinar.
                </div>
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label">Filtrar por tipo</label>
                <input
                  className="form-control"
                  placeholder="EXTINTOR / SPDA ..."
                  value={itemsItemType}
                  onChange={(e) => setItemsItemType(e.target.value.toUpperCase())}
                />
              </div>
              <div className="col-12 col-md-1">
                <button className="btn btn-outline-secondary w-100" type="submit">
                  {itemsFetching ? "Buscando..." : "Buscar"}
                </button>
              </div>
            </div>
          </form>

          {/* Paginação do combo de itens (quando necessário) */}
          {!!itemsPageData && itemsPageData.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setItemsPage((p) => Math.max(0, p - 1))}
                disabled={(itemsPageData?.number ?? 0) <= 0}
              >
                « Itens anteriores
              </button>
              <span className="text-muted">
                Página {(itemsPageData?.number ?? 0) + 1} de {itemsPageData?.totalPages ?? 1}
              </span>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setItemsPage((p) => p + 1)}
                disabled={((itemsPageData?.number ?? 0) + 1) >= (itemsPageData?.totalPages ?? 1)}
              >
                Próximos itens »
              </button>
            </div>
          )}

          {itemsLoading && <p className="m-0 mt-2">Carregando itens…</p>}
          {itemsError && <p className="m-0 mt-2 text-danger">Erro ao carregar itens.</p>}
        </div>
      </div>

      {/* Grid de Manutenções */}
      <div className="card">
        <div className="card-body p-0">
          {!selectedItemId && (
            <p className="p-3 m-0 text-muted">Selecione um item para visualizar as manutenções.</p>
          )}

          {selectedItemId && maintsLoading && <p className="p-3 m-0">Carregando manutenções…</p>}
          {selectedItemId && maintsError && (
            <p className="p-3 m-0 text-danger">Erro ao carregar manutenções.</p>
          )}

          {selectedItemId && !maintsLoading && !maintsError && (
            <>
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Item</th>
                      <th>Data</th>
                      <th>Emitido por</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(maints?.content ?? []).map((m) => (
                      <tr key={String(m.id)}>
                        <td>{String(m.id)}</td>
                        <td>{String(m.itemId)}</td>
                        <td>{formatDate(m.performedAt)}</td>
                        <td>{m.issuedBy || "-"}</td>
                      </tr>
                    ))}
                    {maints?.content?.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-muted text-center py-3">
                          Nenhuma manutenção encontrada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-3 pb-3">
                <Pagination
                  page={maints?.number ?? 0}
                  size={maints?.size ?? size}
                  totalPages={maints?.totalPages ?? 1}
                  onChange={(p) => setPage(p)}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
