"use client";
import { useState } from "react";
import { api } from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";

// Tipos auxiliares
interface Item {
  id: string | number;
  itemType: string;
  itemCategory: "REGULATORY" | "OPERATIONAL";
  status: "OK" | "NEAR_DUE" | "OVERDUE";
  nextDueAt?: string;
}

interface PageResp<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // page index
  size: number;
}

// Tipos para prestadores próximos
interface NearbySupplier {
  placeId: string;
  name: string;
  address?: string;
  rating?: number;
  userRatingsTotal?: number;
  phone?: string;
  website?: string;
  mapsUrl?: string;
  lat?: number;
  lng?: number;
}

interface NearbyResponse {
  serviceKey: string;
  radiusKm: number;
  center: { lat: number; lng: number };
  suppliers: NearbySupplier[];
}

export default function NewMaintenancePage() {
  // Estado para sugestão de prestadores
  const [suppliers, setSuppliers] = useState<NearbySupplier[]>([]);
  const [suppliersOpen, setSuppliersOpen] = useState(false);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [suppliersError, setSuppliersError] = useState<string | null>(null);
  const [itemId, setItemId] = useState("");
  const [performedAt, setPerformedAt] = useState("");
  const [msg, setMsg] = useState("");

  // Filtros de busca de itens
  const [status, setStatus] = useState<string>("");
  const [itemType, setItemType] = useState<string>("");
  const [page, setPage] = useState(0);
  const size = 10;

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["items-search", { status, itemType, page, size }],
    queryFn: async () => {
      const params: Record<string, any> = { page, size };
      if (status) params.status = status;
      if (itemType) params.itemType = itemType;
      const res = await api.get("/items", { params });

      // Normaliza resposta (lista ou paginada)
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      const body = {
        performedAt,
        issuedBy: "Empresa X",
        certificateNumber: null,
        certificateValidUntil: null,
        receiptUrl: null,
      };
      const { data } = await api.post(`/items/${itemId}/maintenances`, body);
      setMsg(`Registrado: ${data.id}`);
    } catch {
      setMsg("Erro ao registrar.");
    }
  }

  function formatDate(dt?: string) {
    if (!dt) return "-";
    try {
      const d = new Date(dt + "T00:00:00");
      return d.toLocaleDateString("pt-BR");
    } catch {
      return dt;
    }
  }

  // Busca prestadores próximos baseado no itemType (serviceKey) e geolocalização do navegador
  async function fetchSuppliersNearby() {
    setSuppliersError(null);
    setSuppliersLoading(true);
    try {
      const serviceKey = (itemType || "").trim().toUpperCase();
      if (!serviceKey) {
        throw new Error("Informe o Tipo do serviço para buscar prestadores.");
      }

      // Obter geolocalização do navegador
      const coords = await new Promise<GeolocationCoordinates>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocalização não suportada pelo navegador."));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos.coords),
          (err) => reject(err),
          { enableHighAccuracy: false, timeout: 8000 }
        );
      }).catch(() => {
        // Fallback: Centro de BH para não bloquear totalmente a experiência
        return { latitude: -19.9245, longitude: -43.9352 } as any;
      });

      const lat = (coords as any).latitude;
      const lng = (coords as any).longitude;

      const payload = { serviceKey, lat, lng, radiusKm: 20, limit: 5 };
      const res = await api.post<NearbyResponse>("/suppliers/nearby", payload);
      setSuppliers(res.data?.suppliers ?? []);
      setSuppliersOpen(true);
    } catch (e: any) {
      setSuppliersError(e?.message || "Falha ao buscar prestadores próximos.");
      setSuppliers([]);
      setSuppliersOpen(true);
    } finally {
      setSuppliersLoading(false);
    }
  }

  return (
    <section>
      <h1 className="h1">Registrar Manutenção</h1>

      <div className="card">
        <form onSubmit={onSubmit} className="form">
          <div className="form-field">
            <label className="label">Item ID</label>
            <input
              className="input"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              placeholder="Ex.: 1 ou 3f1a..."
              required
            />
            <p className="text-sm mt-1">Você pode digitar o ID manualmente ou selecionar a partir da busca abaixo.</p>
          </div>

          {/* Busca de Itens */}
          <div className="card mt-2">
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
                    <div className="form-text mt-1">
                      Informe o tipo do serviço para sugerirmos prestadores próximos.
                    </div>
                  </div>

                  <div className="col-12 col-md-2 d-flex flex-column gap-2">
                    <button className="btn btn-outline-secondary w-100" type="submit">
                      {isFetching ? "Buscando..." : "Buscar"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-primary w-100"
                      onClick={fetchSuppliersNearby}
                      disabled={!itemType || suppliersLoading}
                      title="Ver prestadores próximos ao seu local"
                    >
                      {suppliersLoading ? "Buscando prestadores..." : "Ver prestadores próximos"}
                    </button>
                  </div>
                </div>
              </form>

              <div className="mt-3">
                {isLoading && <p className="m-0">Carregando itens…</p>}
                {error && <p className="m-0 text-danger">Erro ao carregar itens.</p>}

                {!isLoading && !error && (
                  <>
                    <div className="table-responsive">
                      <table className="table align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>ID</th>
                            <th>Item</th>
                            <th>Categoria</th>
                            <th>Próximo venc.</th>
                            <th>Status</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {(data?.content ?? []).map((it) => (
                            <tr key={String(it.id)}>
                              <td>{String(it.id)}</td>
                              <td>{it.itemType}</td>
                              <td>{it.itemCategory}</td>
                              <td>{formatDate(it.nextDueAt)}</td>
                              <td>{it.status}</td>
                              <td className="text-end">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => setItemId(String(it.id))}
                                  title="Selecionar este item"
                                >
                                  Selecionar
                                </button>
                              </td>
                            </tr>
                          ))}
                          {data?.content?.length === 0 && (
                            <tr>
                              <td colSpan={6} className="text-muted text-center py-3">
                                Nenhum item encontrado.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={(data?.number ?? 0) <= 0}
                      >
                        « Anterior
                      </button>
                      <span className="text-muted">
                        Página {(data?.number ?? 0) + 1} de {data?.totalPages ?? 1}
                      </span>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={((data?.number ?? 0) + 1) >= (data?.totalPages ?? 1)}
                      >
                        Próxima »
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="form-field mt-3">
            <label className="label">Data da manutenção</label>
            <input
              className="input"
              type="date"
              value={performedAt}
              onChange={(e) => setPerformedAt(e.target.value)}
              required
            />
          </div>

          {/* Sugestões de prestadores */}
          {suppliersOpen && (
            <div className="card mt-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h2 className="h6 m-0">Sugestões de prestadores próximos</h2>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setSuppliersOpen(false)}
                  >
                    Fechar
                  </button>
                </div>

                <p className="text-muted mb-3">
                  As opções abaixo são sugestões baseadas na sua localização e no serviço informado. O Easy Maintenance
                  não se responsabiliza pela contratação, execução e qualidade dos serviços prestados pelos fornecedores listados.
                </p>

                {suppliersError && <p className="text-danger">{suppliersError}</p>}
                {!suppliersError && suppliers.length === 0 && !suppliersLoading && (
                  <p className="text-muted">Nenhum prestador encontrado para o tipo informado nesta região.</p>
                )}

                {suppliersLoading && <p className="m-0">Buscando prestadores…</p>}

                {!suppliersLoading && !suppliersError && suppliers.length > 0 && (
                  <div className="list-group">
                    {suppliers.map((s) => (
                      <div key={s.placeId} className="list-group-item">
                        <div className="d-flex justify-content-between">
                          <div>
                            <div className="fw-semibold">{s.name}</div>
                            {s.address && <div className="text-muted small">{s.address}</div>}
                            <div className="small mt-1">
                              {typeof s.rating === "number" && (
                                <span className="me-2">Avaliação: {s.rating?.toFixed(1)} ⭐</span>
                              )}
                              {typeof s.userRatingsTotal === "number" && (
                                <span className="text-muted">({s.userRatingsTotal} avaliações)</span>
                              )}
                            </div>
                            <div className="small mt-1">
                              {s.phone && <span className="me-2">📞 {s.phone}</span>}
                              {s.website && (
                                <a href={s.website} target="_blank" rel="noreferrer" className="me-2">
                                  Site
                                </a>
                              )}
                              {s.mapsUrl && (
                                <a href={s.mapsUrl} target="_blank" rel="noreferrer">
                                  Ver no mapa
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button className="btn primary">Registrar</button>
          </div>
          {msg && <p className="text-sm">{msg}</p>}
        </form>
      </div>
    </section>
  );
}
