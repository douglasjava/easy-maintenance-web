"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { adminOrganizationsService, Organization } from "@/services/private/admin-organizations.service";
import toast from "react-hot-toast";

// ── Design tokens ──────────────────────────────────────────────────────────

const C = {
  navy:    "#0B2545",
  blue:    "#1d4ed8",
  blueSoft:"#eff6ff",
  border:  "#e2e8f0",
  muted:   "#64748b",
  surface: "#ffffff",
  bg:      "#f1f5f9",
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: "0.68rem", fontWeight: 700,
  color: C.muted, textTransform: "uppercase",
  letterSpacing: "0.07em",
};

// ── Company type config ────────────────────────────────────────────────────

const CT_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  CONDOMINIUM: { label: "Condomínio", bg: "#eff6ff", color: "#1d4ed8" },
  HOSPITAL:    { label: "Hospital",   bg: "#fdf2f8", color: "#9d174d" },
  SCHOOL:      { label: "Escola",     bg: "#f0fdf4", color: "#15803d" },
  INDUSTRY:    { label: "Indústria",  bg: "#fff7ed", color: "#c2410c" },
  OFFICE:      { label: "Escritório", bg: "#fafaf9", color: "#44403c" },
  OTHER:       { label: "Outro",      bg: "#f8fafc", color: "#475569" },
};

function TypeBadge({ type }: { type?: string }) {
  const cfg = CT_CONFIG[type || ""] ?? { label: type || "—", bg: "#f8fafc", color: "#475569" };
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 9px",
      borderRadius: 20,
      fontSize: "0.68rem",
      fontWeight: 700,
      backgroundColor: cfg.bg,
      color: cfg.color,
      whiteSpace: "nowrap",
    }}>
      {cfg.label}
    </span>
  );
}

// ── Doc formatter ──────────────────────────────────────────────────────────

function formatDoc(raw?: string): string {
  if (!raw) return "—";
  const d = raw.replace(/\D/g, "");
  if (d.length === 11)
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  if (d.length === 14)
    return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  return raw;
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <>
      {[1,2,3,4,5].map(i => (
        <tr key={i}>
          {[60, 80, 72, 50].map((w, j) => (
            <td key={j} style={{ padding: "12px 16px" }}>
              <div style={{
                height: 12, width: `${w}%`, borderRadius: 6,
                backgroundColor: "#e2e8f0",
                animation: "pulse 1.5s ease-in-out infinite",
              }} />
            </td>
          ))}
          <td style={{ padding: "12px 16px" }}>
            <div style={{ height: 28, width: 80, borderRadius: 6, backgroundColor: "#e2e8f0", animation: "pulse 1.5s ease-in-out infinite", marginLeft: "auto" }} />
          </td>
        </tr>
      ))}
    </>
  );
}

function CardSkeleton() {
  return (
    <>
      {[1,2,3].map(i => (
        <div key={i} style={{
          backgroundColor: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 10, padding: "14px 16px", marginBottom: 8,
        }}>
          <div style={{ height: 14, width: "55%", backgroundColor: "#e2e8f0", borderRadius: 4, marginBottom: 8, animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ height: 10, width: "35%", backgroundColor: "#e2e8f0", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
        </div>
      ))}
    </>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────

function Empty({ hasFilter }: { hasFilter: boolean }) {
  return (
    <tr>
      <td colSpan={5} style={{ padding: "48px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: 10 }}>🏢</div>
        <div style={{ fontWeight: 600, color: C.navy, fontSize: "0.9rem", marginBottom: 4 }}>
          {hasFilter ? "Nenhuma empresa encontrada" : "Nenhuma empresa cadastrada"}
        </div>
        <p style={{ fontSize: "0.78rem", color: C.muted, margin: 0 }}>
          {hasFilter ? "Tente ajustar os filtros de busca." : "Crie a primeira empresa pelo botão acima."}
        </p>
      </td>
    </tr>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────

export default function PrivateOrganizationsListPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState("");
  const [searchDoc, setSearchDoc] = useState("");
  const PAGE_SIZE = 12;

  const fetchOrgs = useCallback(async (p = 0) => {
    try {
      setLoading(true);
      const data = await adminOrganizationsService.list({
        page: p, size: PAGE_SIZE,
        name: search.trim() || undefined,
        doc: searchDoc.replace(/\D/g, "") || undefined,
      });
      setOrgs(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch {
      toast.error("Erro ao carregar empresas");
    } finally {
      setLoading(false);
    }
  }, [search, searchDoc]);

  useEffect(() => {
    fetchOrgs(page);
  }, [page, fetchOrgs]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(0);
    fetchOrgs(0);
  }

  const hasFilter = !!search.trim() || !!searchDoc.trim();

  return (
    <section style={{ backgroundColor: C.bg, minHeight: "100vh", padding: "16px" }}>

      {/* Header */}
      <div style={{
        display: "flex", flexWrap: "wrap",
        alignItems: "flex-start", justifyContent: "space-between",
        gap: 12, marginBottom: 20,
      }}>
        <div>
          <div style={{ fontSize: "0.72rem", color: C.muted, marginBottom: 4 }}>
            <Link href="/private/dashboard" style={{ color: C.muted, textDecoration: "none" }}>
              Dashboard
            </Link>
            {" / "}
            <span style={{ color: C.navy }}>Empresas</span>
          </div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: C.navy, margin: 0 }}>
            Empresas
          </h1>
          {!loading && (
            <p style={{ fontSize: "0.75rem", color: C.muted, margin: "2px 0 0" }}>
              {totalElements} {totalElements === 1 ? "empresa" : "empresas"} cadastradas
            </p>
          )}
        </div>
        <Link
          href="/private/organizations/new"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "9px 18px", borderRadius: 8,
            backgroundColor: C.blue, color: "#fff",
            fontWeight: 700, fontSize: "0.82rem", textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          + Nova empresa
        </Link>
      </div>

      {/* Search bar */}
      <form
        onSubmit={handleSearch}
        style={{
          backgroundColor: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: "14px 16px",
          marginBottom: 16,
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "flex-end",
        }}
      >
        <div style={{ flex: "1 1 180px" }}>
          <label style={LABEL_STYLE}>Nome</label>
          <input
            style={{
              width: "100%", border: `1px solid ${C.border}`,
              borderRadius: 6, padding: "7px 10px",
              fontSize: "0.82rem", color: C.navy, marginTop: 4,
            }}
            placeholder="Buscar por nome..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ flex: "1 1 140px" }}>
          <label style={LABEL_STYLE}>CNPJ / CPF</label>
          <input
            style={{
              width: "100%", border: `1px solid ${C.border}`,
              borderRadius: 6, padding: "7px 10px",
              fontSize: "0.82rem", color: C.navy, marginTop: 4,
            }}
            placeholder="Somente números"
            value={searchDoc}
            inputMode="numeric"
            onChange={e => setSearchDoc(e.target.value.replace(/\D/g, ""))}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: "8px 20px", borderRadius: 6,
            backgroundColor: C.blue, color: "#fff",
            border: "none", fontWeight: 700, fontSize: "0.82rem",
            cursor: "pointer", flexShrink: 0,
          }}
        >
          Buscar
        </button>
        {hasFilter && (
          <button
            type="button"
            onClick={() => { setSearch(""); setSearchDoc(""); setPage(0); setTimeout(() => fetchOrgs(0), 0); }}
            style={{
              padding: "8px 14px", borderRadius: 6,
              backgroundColor: C.surface, color: C.muted,
              border: `1px solid ${C.border}`, fontWeight: 600,
              fontSize: "0.82rem", cursor: "pointer", flexShrink: 0,
            }}
          >
            Limpar
          </button>
        )}
      </form>

      {/* Table — desktop */}
      <div style={{
        display: "none",
        backgroundColor: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        overflow: "hidden",
      }} className="org-table-wrap">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                {["Nome", "Tipo", "Documento", "Cidade", ""].map((col, i) => (
                  <th key={i} style={{
                    padding: "10px 16px",
                    ...LABEL_STYLE,
                    textAlign: i === 4 ? "right" : "left",
                    borderBottom: `1px solid ${C.border}`,
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <Skeleton />
              ) : orgs.length === 0 ? (
                <Empty hasFilter={hasFilter} />
              ) : (
                orgs.map(org => (
                  <tr
                    key={org.id}
                    style={{ borderBottom: `1px solid #f1f5f9`, transition: "background 0.1s" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem", color: C.navy }}>
                        {org.name}
                      </div>
                      {org.code && (
                        <div style={{ fontSize: "0.68rem", color: C.muted, fontFamily: "monospace" }}>
                          {org.code}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <TypeBadge type={org.companyType} />
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: C.muted }}>
                        {formatDoc(org.doc)}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.82rem", color: C.muted }}>
                      {org.city || "—"}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <Link
                        href={`/private/organizations/${org.id}`}
                        style={{
                          display: "inline-block",
                          padding: "5px 14px", borderRadius: 6,
                          border: `1px solid ${C.border}`,
                          backgroundColor: C.surface,
                          color: C.blue, fontWeight: 600,
                          fontSize: "0.75rem", textDecoration: "none",
                        }}
                      >
                        Detalhes
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 16px", borderTop: `1px solid ${C.border}`,
            flexWrap: "wrap", gap: 8,
          }}>
            <span style={{ fontSize: "0.75rem", color: C.muted }}>
              Página {page + 1} de {totalPages}
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                style={{
                  padding: "5px 12px", borderRadius: 6,
                  border: `1px solid ${C.border}`, backgroundColor: C.surface,
                  color: page === 0 ? C.muted : C.blue,
                  fontSize: "0.78rem", fontWeight: 600, cursor: page === 0 ? "not-allowed" : "pointer",
                }}
              >
                ← Anterior
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                style={{
                  padding: "5px 12px", borderRadius: 6,
                  border: `1px solid ${C.border}`, backgroundColor: C.surface,
                  color: page >= totalPages - 1 ? C.muted : C.blue,
                  fontSize: "0.78rem", fontWeight: 600,
                  cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                }}
              >
                Próxima →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cards — mobile */}
      <div className="org-cards-wrap">
        {loading ? (
          <CardSkeleton />
        ) : orgs.length === 0 ? (
          <div style={{
            backgroundColor: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 10, padding: "40px 20px", textAlign: "center",
          }}>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>🏢</div>
            <div style={{ fontWeight: 600, color: C.navy, marginBottom: 4, fontSize: "0.9rem" }}>
              {hasFilter ? "Nenhuma empresa encontrada" : "Nenhuma empresa cadastrada"}
            </div>
            <p style={{ fontSize: "0.78rem", color: C.muted, margin: 0 }}>
              {hasFilter ? "Ajuste os filtros." : "Crie pelo botão acima."}
            </p>
          </div>
        ) : (
          <>
            {orgs.map(org => (
              <div
                key={org.id}
                style={{
                  backgroundColor: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  marginBottom: 8,
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: C.navy, flex: 1 }}>
                      {org.name}
                    </div>
                    <TypeBadge type={org.companyType} />
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {org.doc && (
                      <span style={{ fontSize: "0.75rem", color: C.muted, fontFamily: "monospace" }}>
                        {formatDoc(org.doc)}
                      </span>
                    )}
                    {org.city && (
                      <span style={{ fontSize: "0.75rem", color: C.muted }}>
                        📍 {org.city}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{
                  padding: "10px 16px", borderTop: `1px solid #f1f5f9`,
                  backgroundColor: "#fafafa",
                }}>
                  <Link
                    href={`/private/organizations/${org.id}`}
                    style={{
                      display: "block", textAlign: "center",
                      padding: "7px", borderRadius: 6,
                      border: `1px solid ${C.border}`,
                      backgroundColor: C.surface,
                      color: C.blue, fontWeight: 700,
                      fontSize: "0.8rem", textDecoration: "none",
                    }}
                  >
                    Ver detalhes →
                  </Link>
                </div>
              </div>
            ))}

            {/* Pagination mobile */}
            {totalPages > 1 && (
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
                <button
                  disabled={page === 0}
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  style={{
                    flex: 1, padding: "9px", borderRadius: 8,
                    border: `1px solid ${C.border}`, backgroundColor: C.surface,
                    color: C.blue, fontWeight: 700, fontSize: "0.82rem",
                    cursor: page === 0 ? "not-allowed" : "pointer",
                    opacity: page === 0 ? 0.5 : 1,
                  }}
                >
                  ← Anterior
                </button>
                <span style={{
                  display: "flex", alignItems: "center",
                  fontSize: "0.75rem", color: C.muted, whiteSpace: "nowrap",
                }}>
                  {page + 1}/{totalPages}
                </span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  style={{
                    flex: 1, padding: "9px", borderRadius: 8,
                    border: `1px solid ${C.border}`, backgroundColor: C.surface,
                    color: C.blue, fontWeight: 700, fontSize: "0.82rem",
                    cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                    opacity: page >= totalPages - 1 ? 0.5 : 1,
                  }}
                >
                  Próxima →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media (min-width: 640px) {
          .org-table-wrap { display: block !important; }
          .org-cards-wrap { display: none !important; }
        }
        @media (max-width: 639px) {
          .org-table-wrap { display: none !important; }
          .org-cards-wrap { display: block !important; }
        }
      `}</style>
    </section>
  );
}
