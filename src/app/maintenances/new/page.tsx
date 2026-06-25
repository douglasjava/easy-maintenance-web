"use client";

import { useState, Suspense, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import { useCurrentOrganizationAccess } from "@/hooks/useAccessControl";
import { PagePermissionGuard } from "@/components/access/PagePermissionGuard";

interface Item {
  id: string | number;
  itemType: string;
  itemCategory: "REGULATORY" | "OPERATIONAL";
  status: "OK" | "NEAR_DUE" | "OVERDUE";
  nextDueAt?: string;
}

interface NearbySupplier {
  placeId: string;
  name: string;
  address?: string;
  rating?: number;
  userRatingsTotal?: number;
  phone?: string;
  website?: string;
  mapsUrl?: string;
}

interface NearbyResponse {
  serviceKey: string;
  radiusKm: number;
  center: { lat: number; lng: number };
  suppliers: NearbySupplier[];
}

const LABEL_STYLE: React.CSSProperties = {
  fontSize: "0.7rem",
  fontWeight: 600,
  color: "#9ca3af",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: 4,
  display: "block",
};

const ATTACHMENT_TYPES: Record<string, string> = {
  PHOTO:       "Foto",
  REPORT:      "Relatório",
  CERTIFICATE: "Certificado",
  ART:         "ART",
  INVOICE:     "Nota Fiscal",
  OTHER:       "Outro",
};

const STATUS_DOT: Record<string, string> = {
  OK:       "#22c55e",
  NEAR_DUE: "#f59e0b",
  OVERDUE:  "#ef4444",
};

const STATUS_LABEL: Record<string, string> = {
  OK:       "Em dia",
  NEAR_DUE: "Vencendo",
  OVERDUE:  "Atrasado",
};

function formatDate(dt?: string) {
  if (!dt) return "-";
  try {
    return new Date(dt + "T00:00:00").toLocaleDateString("pt-BR");
  } catch {
    return dt;
  }
}

function formatCurrency(value: string) {
  const digits = value.replace(/\D/g, "");
  const cents = parseInt(digits || "0", 10);
  return (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function NewMaintenanceContent() {
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");
  let backHref = "/maintenances";
  if (origin === "dashboard") backHref = "/";
  if (origin === "item-detail") backHref = `/items/${searchParams.get("itemId")}`;

  const { permissions } = useCurrentOrganizationAccess();

  // Item selection — autocomplete
  const [itemId, setItemId] = useState(searchParams.get("itemId") || "");
  const [itemSearch, setItemSearch] = useState("");
  const [selectedItemLabel, setSelectedItemLabel] = useState("");
  const [itemSuggestions, setItemSuggestions] = useState<Item[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const itemSearchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchItems = useCallback(async (term: string) => {
    if (term.trim().length < 3) { setItemSuggestions([]); return; }
    try {
      const res = await api.get<Item[] | { content: Item[] }>("/items", {
        params: { itemType: term.trim(), size: 12 },
      });
      const list = Array.isArray(res.data) ? res.data : (res.data as { content: Item[] }).content ?? [];
      setItemSuggestions(list);
    } catch { setItemSuggestions([]); }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchItems(itemSearch), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [itemSearch, searchItems]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (itemSearchRef.current && !itemSearchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Maintenance form
  const [performedAt, setPerformedAt] = useState("");
  const [type, setType] = useState("PREVENTIVA");
  const [performedBy, setPerformedBy] = useState("");
  const [costInput, setCostInput] = useState("");
  const [nextDueAt, setNextDueAt] = useState("");
  const [step, setStep] = useState(1);
  const [maintenanceId, setMaintenanceId] = useState<string | number | null>(null);
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setPerformedAt("");
    setType("PREVENTIVA");
    setPerformedBy("");
    setCostInput("");
    setNextDueAt("");
    setItemId("");
    setItemSearch("");
    setSelectedItemLabel("");
    setItemSuggestions([]);
    setStep(1);
    setMaintenanceId(null);
  }

  // Selected item detail
  const { data: selectedItem, isLoading: selectedItemLoading } = useQuery({
    enabled: Boolean(itemId),
    queryKey: ["item", itemId],
    queryFn: async () => (await api.get(`/items/${itemId}`)).data as Item,
  });

  // Populate label when itemId comes from URL params and item loads
  useEffect(() => {
    if (selectedItem && itemId && !selectedItemLabel) {
      setSelectedItemLabel(selectedItem.itemType);
    }
  }, [selectedItem, itemId, selectedItemLabel]);

  // Suppliers
  const [suppliers, setSuppliers] = useState<NearbySupplier[]>([]);
  const [suppliersOpen, setSuppliersOpen] = useState(false);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [suppliersError, setSuppliersError] = useState<string | null>(null);

  async function fetchSuppliersNearby() {
    setSuppliersError(null);
    setSuppliersLoading(true);
    try {
      const serviceKey = String(selectedItem?.itemType ?? "").trim().toUpperCase();
      if (!serviceKey) throw new Error("Selecione um item para buscar prestadores.");

      const coords = await new Promise<GeolocationCoordinates>((resolve, reject) => {
        if (!navigator.geolocation) { reject(new Error("Geolocalização não suportada.")); return; }
        navigator.geolocation.getCurrentPosition((pos) => resolve(pos.coords), (err) => reject(err), { enableHighAccuracy: false, timeout: 8000 });
      }).catch(() => ({ latitude: -19.9245, longitude: -43.9352 }) as any);

      const payload = { serviceKey, lat: (coords as any).latitude, lng: (coords as any).longitude, radiusKm: 20, limit: 5 };
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    if (!itemId) { toast.error("Selecione um item."); return; }
    if (!performedAt) { toast.error("Informe a data da manutenção."); return; }
    const today = new Date().toISOString().split("T")[0];
    if (performedAt > today) { toast.error("A data da manutenção não pode ser no futuro."); return; }
    if (nextDueAt && nextDueAt < performedAt) {
        toast.error("A próxima manutenção não pode ser anterior à data da manutenção.");
        return;
    }

    let costCents = 0;
    if (costInput) {
      const numericValue = costInput.replace(/\D/g, "");
      costCents = parseInt(numericValue, 10) || 0;
    }

    const body = { performedAt, type, performedBy: performedBy || null, costCents, nextDueAt: nextDueAt || null };
    try {
      setSaving(true);
      const { data } = await api.post(`/items/${itemId}/maintenances`, body);
      toast.success("Manutenção registrada! Agora você pode anexar documentos.");
      setMaintenanceId(data.id);
      setStep(2);
    } catch (err: any) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;
      if (status === 400) toast.error("Verifique os campos e tente novamente.");
      else toast.error(detail || "Erro ao registrar manutenção");
    } finally {
      setSaving(false);
    }
  }

  // Attachments
  const [attachments, setAttachments] = useState<{ file: File; type: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  async function handleUploadAttachments() {
    if (!maintenanceId) return;
    const filesToUpload = attachments.filter((a) => a && a.file);
    if (filesToUpload.length === 0) {
      toast.success("Finalizado sem novos anexos");
      resetForm();
      return;
    }
    setUploading(true);
    try {
      for (const att of filesToUpload) {
        const contentType = att.file.type || "application/octet-stream";
        const { data } = await api.post<{ uploadUrl: string; s3Key: string }>(
          `maintenances/${maintenanceId}/attachments/upload-url`,
          { fileName: att.file.name, contentType, attachmentType: att.type, sizeBytes: att.file.size }
        );
        const s3Response = await fetch(data.uploadUrl, { method: "PUT", headers: { "Content-Type": contentType }, body: att.file });
        if (!s3Response.ok) throw new Error(`Upload S3 falhou: ${s3Response.status}`);
        await api.post(`maintenances/${maintenanceId}/attachments/confirm`, {
          s3Key: data.s3Key, fileName: att.file.name, contentType, sizeBytes: att.file.size, attachmentType: att.type
        });
      }
      toast.success("Anexos enviados com sucesso!");
      resetForm();
    } catch {
      toast.error("Erro ao enviar anexos.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <PagePermissionGuard allowed={permissions?.canRegisterMaintenance} redirectHref={backHref}>
      <section style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }} className="pb-5">
        <div className="container px-3 px-md-4">

          {/* ── HEADER ── */}
          <div className="pt-4 pb-3">
            <Link
              href={backHref}
              className="d-inline-flex align-items-center gap-1 text-decoration-none mb-3"
              style={{ color: "#6b7280", fontSize: "0.8rem" }}
            >
              ← {origin === "dashboard" ? "Dashboard" : origin === "item-detail" ? "Item" : "Manutenções"}
            </Link>

            <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
              <div>
                <h1
                  style={{
                    fontSize: "clamp(1.25rem, 3vw, 1.6rem)",
                    fontWeight: 700,
                    color: "#0f172a",
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  Registrar Manutenção
                </h1>
                <p className="text-muted mb-0 mt-1" style={{ fontSize: "0.85rem" }}>
                  Selecione o item e registre a execução
                </p>
              </div>

              {/* Step indicator */}
              <div className="d-flex align-items-center gap-2" style={{ flexShrink: 0 }}>
                {[1, 2].map((s) => (
                  <div key={s} className="d-flex align-items-center gap-2">
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        backgroundColor: step >= s ? "#2563eb" : "#e5e7eb",
                        color: step >= s ? "#fff" : "#9ca3af",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {step > s ? "✓" : s}
                    </div>
                    <span style={{ fontSize: "0.75rem", color: step >= s ? "#0f172a" : "#9ca3af", whiteSpace: "nowrap" }}>
                      {s === 1 ? "Dados" : "Anexos"}
                    </span>
                    {s < 2 && (
                      <div style={{ width: 20, height: 1, backgroundColor: step > 1 ? "#2563eb" : "#e5e7eb", flexShrink: 0 }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── PASSO 1 ── */}
          {step === 1 && (
            <>
              {/* Item selection card */}
              <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: 10 }}>
                <div className="card-body p-4">
                  <div
                    style={{ fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}
                  >
                    1 — Selecionar item
                  </div>

                  {/* Autocomplete + supplier button */}
                  <div className="d-flex flex-column flex-sm-row gap-2 align-items-start align-items-sm-end">
                    <div className="flex-grow-1 w-100" ref={itemSearchRef} style={{ position: "relative" }}>
                      <label style={LABEL_STYLE}>Item</label>
                      <div className="d-flex gap-1">
                        <input
                          type="text"
                          className="form-control"
                          placeholder={selectedItemLabel || "Digite 3 caracteres para buscar…"}
                          value={selectedItemLabel ? "" : itemSearch}
                          readOnly={!!selectedItemLabel}
                          onChange={(e) => {
                            setItemSearch(e.target.value);
                            setShowSuggestions(true);
                            if (!e.target.value) { setItemId(""); setSelectedItemLabel(""); }
                          }}
                          onFocus={() => { if (!selectedItemLabel) setShowSuggestions(true); }}
                          style={selectedItemLabel ? { backgroundColor: "#eff6ff", cursor: "default", color: "#1d4ed8", fontWeight: 600 } : {}}
                        />
                        {selectedItemLabel && (
                          <button
                            type="button"
                            className="btn btn-outline-secondary px-2"
                            title="Limpar item"
                            onClick={() => { setItemId(""); setSelectedItemLabel(""); setItemSearch(""); setItemSuggestions([]); }}
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Suggestions dropdown */}
                      {showSuggestions && itemSuggestions.length > 0 && !selectedItemLabel && (
                        <div
                          style={{
                            position: "absolute", zIndex: 1050, top: "100%", left: 0, right: 0,
                            background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.12)", maxHeight: 220, overflowY: "auto",
                          }}
                        >
                          {itemSuggestions.map((it) => (
                            <button
                              key={String(it.id)}
                              type="button"
                              className="d-block w-100 text-start px-3 py-2 border-0 bg-transparent"
                              style={{ fontSize: "0.82rem", color: "#111827" }}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setItemId(String(it.id));
                                setSelectedItemLabel(it.itemType);
                                setItemSearch("");
                                setShowSuggestions(false);
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f9ff")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              {it.itemType}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="btn btn-sm flex-shrink-0"
                      style={{
                        border: "1px solid #f59e0b",
                        color: "#92400e",
                        backgroundColor: "#fffbeb",
                        whiteSpace: "nowrap",
                        padding: "6px 12px",
                        borderRadius: 6,
                        fontSize: "0.82rem",
                      }}
                      onClick={fetchSuppliersNearby}
                      disabled={!itemId || suppliersLoading}
                      title="Sugestões baseadas na localização e no tipo do item"
                    >
                      {suppliersLoading ? "Buscando…" : "🔍 Ver prestadores"}
                    </button>
                  </div>

                  {/* Selected item context */}
                  {itemId && (
                    <div
                      className="rounded-3 mt-3 px-3 py-2"
                      style={{ border: "1px solid #e5e7eb", backgroundColor: "#f8fafc" }}
                    >
                      {selectedItemLoading ? (
                        <div className="placeholder-glow d-flex gap-3">
                          <span className="placeholder rounded" style={{ height: 14, width: "30%" }} />
                          <span className="placeholder rounded" style={{ height: 14, width: "20%" }} />
                        </div>
                      ) : selectedItem ? (
                        <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                          <div>
                            <div className="fw-semibold text-dark" style={{ fontSize: "0.875rem" }}>
                              {selectedItem.itemType}
                            </div>
                            <div className="d-flex align-items-center gap-2 mt-1 flex-wrap">
                              <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                                {selectedItem.itemCategory === "REGULATORY" ? "Regulatório" : "Operacional"}
                              </span>
                              <span style={{ color: "#d1d5db" }}>•</span>
                              <span className="d-inline-flex align-items-center gap-1" style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                                <span
                                  style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    backgroundColor: STATUS_DOT[selectedItem.status] ?? "#9ca3af",
                                    flexShrink: 0,
                                    display: "inline-block",
                                  }}
                                />
                                {STATUS_LABEL[selectedItem.status] ?? selectedItem.status}
                              </span>
                              <span style={{ color: "#d1d5db" }}>•</span>
                              <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                                Vence: {formatDate(selectedItem.nextDueAt)}
                              </span>
                            </div>
                          </div>
                          <Link
                            className="btn btn-sm flex-shrink-0"
                            style={{ border: "1px solid #e5e7eb", color: "#374151", fontSize: "0.78rem", padding: "3px 10px" }}
                            href={`/items/${itemId}?origin=maintenance-new`}
                          >
                            Ver item →
                          </Link>
                        </div>
                      ) : (
                        <div className="text-muted" style={{ fontSize: "0.82rem" }}>Item não encontrado.</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Maintenance form card */}
              <div className="card border-0 shadow-sm" style={{ borderRadius: 10 }}>
                <div className="card-body p-4">
                  <div
                    style={{ fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}
                  >
                    2 — Dados da manutenção
                  </div>

                  <form onSubmit={onSubmit} noValidate>
                    <div className="row g-3 mb-4">
                      <div className="col-12 col-sm-6 col-md-4">
                        <label style={LABEL_STYLE}>Data da manutenção *</label>
                        <input
                          className="form-control"
                          type="date"
                          value={performedAt}
                          max={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setPerformedAt(e.target.value)}
                          required
                        />
                      </div>

                      <div className="col-12 col-sm-6 col-md-4">
                        <label style={LABEL_STYLE}>Tipo de manutenção *</label>
                        <select
                          className="form-select"
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          required
                        >
                          <option value="PREVENTIVA">Preventiva</option>
                          <option value="CORRETIVA">Corretiva</option>
                          <option value="INSPECAO">Inspeção</option>
                          <option value="TESTE">Teste</option>
                          <option value="EMERGENCIAL">Emergencial</option>
                        </select>
                      </div>

                      <div className="col-12 col-sm-6 col-md-4">
                        <label style={LABEL_STYLE}>Responsável <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span></label>
                        <input
                          className="form-control"
                          value={performedBy}
                          onChange={(e) => setPerformedBy(e.target.value)}
                          placeholder="Ex: João Silva"
                        />
                      </div>

                      <div className="col-12 col-sm-6 col-md-4">
                        <label style={LABEL_STYLE}>Custo R$ <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span></label>
                        <div className="input-group">
                          <span className="input-group-text" style={{ fontSize: "0.82rem", color: "#6b7280" }}>R$</span>
                          <input
                            className="form-control"
                            value={costInput}
                            onChange={(e) => setCostInput(formatCurrency(e.target.value))}
                            placeholder="0,00"
                            inputMode="numeric"
                          />
                        </div>
                      </div>

                      <div className="col-12 col-sm-6 col-md-4">
                        <label style={LABEL_STYLE}>Próxima manutenção <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span></label>
                        <input
                          className="form-control"
                          type="date"
                          value={nextDueAt}
                          min={performedAt}
                          onChange={(e) => setNextDueAt(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="d-flex flex-column flex-sm-row gap-2">
                      <button
                        className="btn btn-primary"
                        disabled={saving}
                        style={{ minWidth: 160 }}
                      >
                        {saving ? "Registrando…" : "Próximo →"}
                      </button>
                      <Link
                        className="btn btn-outline-secondary"
                        href="/maintenances"
                      >
                        Cancelar
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}

          {/* ── PASSO 2: ANEXOS ── */}
          {step === 2 && (
            <div className="card border-0 shadow-sm" style={{ borderRadius: 10 }}>
              <div className="card-body p-4">
                <div
                  style={{ fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}
                >
                  2 — Anexar documentos
                </div>
                <p className="text-muted mb-4" style={{ fontSize: "0.82rem" }}>
                  Você pode anexar até 2 documentos. Caso não possua, clique em "Finalizar".
                </p>

                <div className="row g-3 mb-4">
                  {[0, 1].map((idx) => (
                    <div key={idx} className="col-12 col-md-6">
                      <div
                        className="rounded-3 p-3"
                        style={{ border: "1px dashed #d1d5db", backgroundColor: "#fafafa" }}
                      >
                        <div
                          style={{ fontSize: "0.68rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}
                        >
                          Documento {idx + 1}
                        </div>
                        <input
                          type="file"
                          className="form-control form-control-sm mb-2"
                          style={{ fontSize: "0.82rem" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const newAtts = [...attachments];
                              newAtts[idx] = { file, type: newAtts[idx]?.type || "REPORT" };
                              setAttachments(newAtts);
                            }
                          }}
                        />
                        <select
                          className="form-select form-select-sm"
                          value={attachments[idx]?.type || "REPORT"}
                          onChange={(e) => {
                            const newAtts = [...attachments];
                            if (newAtts[idx]) {
                              newAtts[idx].type = e.target.value;
                              setAttachments(newAtts);
                            }
                          }}
                        >
                          {Object.entries(ATTACHMENT_TYPES).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>

                        {attachments[idx]?.file && (
                          <div className="mt-2" style={{ fontSize: "0.72rem", color: "#6b7280" }}>
                            ✓ {attachments[idx].file.name}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="d-flex flex-column flex-sm-row gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={handleUploadAttachments}
                    disabled={uploading}
                    style={{ minWidth: 160 }}
                  >
                    {uploading ? "Enviando…" : "Finalizar registro"}
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => resetForm()}
                    disabled={uploading}
                  >
                    Ignorar e sair
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── PRESTADORES ── */}
          {suppliersOpen && (
            <div className="card border-0 shadow-sm mt-3" style={{ borderRadius: 10 }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div
                    style={{ fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}
                  >
                    Prestadores próximos
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ border: "1px solid #e5e7eb", color: "#6b7280", padding: "2px 10px", fontSize: "0.78rem" }}
                    onClick={() => setSuppliersOpen(false)}
                  >
                    Fechar
                  </button>
                </div>

                <p className="text-muted mb-3" style={{ fontSize: "0.78rem" }}>
                  Sugestões baseadas na localização e tipo do item. O Easy Maintenance não se
                  responsabiliza pela qualidade dos serviços prestados.
                </p>

                {suppliersError && (
                  <div
                    className="rounded-3 px-3 py-2 mb-3"
                    style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", fontSize: "0.82rem", color: "#b91c1c" }}
                  >
                    {suppliersError}
                  </div>
                )}

                {suppliersLoading && (
                  <div className="placeholder-glow d-flex flex-column gap-2">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="placeholder rounded w-100" style={{ height: 56 }} />
                    ))}
                  </div>
                )}

                {!suppliersLoading && !suppliersError && suppliers.length === 0 && (
                  <p className="text-muted mb-0" style={{ fontSize: "0.82rem" }}>
                    Nenhum prestador encontrado para este serviço na região.
                  </p>
                )}

                {!suppliersLoading && !suppliersError && suppliers.length > 0 && (
                  <div className="d-flex flex-column gap-2">
                    {suppliers.map((s) => (
                      <div
                        key={s.placeId}
                        className="rounded-3 px-3 py-2"
                        style={{ border: "1px solid #e5e7eb", backgroundColor: "#fafafa" }}
                      >
                        <div className="fw-semibold text-dark" style={{ fontSize: "0.875rem" }}>
                          {s.name}
                        </div>
                        {s.address && (
                          <div className="text-muted" style={{ fontSize: "0.75rem" }}>{s.address}</div>
                        )}
                        <div className="d-flex flex-wrap align-items-center gap-2 mt-1">
                          {typeof s.rating === "number" && (
                            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                              ⭐ {s.rating.toFixed(1)}
                              {typeof s.userRatingsTotal === "number" && (
                                <span style={{ color: "#9ca3af" }}> ({s.userRatingsTotal})</span>
                              )}
                            </span>
                          )}
                          {s.phone && (
                            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>📞 {s.phone}</span>
                          )}
                          {s.website && (
                            <a href={s.website} target="_blank" rel="noreferrer" style={{ fontSize: "0.75rem", color: "#2563eb" }}>
                              Site →
                            </a>
                          )}
                          {s.mapsUrl && (
                            <a href={s.mapsUrl} target="_blank" rel="noreferrer" style={{ fontSize: "0.75rem", color: "#2563eb" }}>
                              Ver no mapa →
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </section>
    </PagePermissionGuard>
  );
}

export default function NewMaintenancePage() {
  return (
    <Suspense fallback={<p className="p-3 m-0">Carregando formulário...</p>}>
      <NewMaintenanceContent />
    </Suspense>
  );
}
