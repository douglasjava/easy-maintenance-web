"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { adminUsersService, AdminUser } from "@/services/private/admin-users.service";
import toast from "react-hot-toast";
import PageHeader from "@/components/admin/PageHeader";

const C = {
  navy: "#0f172a", blue: "#1d4ed8", blueSoft: "#eff6ff",
  border: "#e2e8f0", muted: "#64748b", surface: "#ffffff", bg: "#f8fafc",
};

const STATUS_CFG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  ACTIVE:    { label: "Ativo",     bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
  INACTIVE:  { label: "Inativo",   bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" },
  PENDING:   { label: "Pendente",  bg: "#fffbeb", color: "#92400e", dot: "#f59e0b" },
  SUSPENDED: { label: "Suspenso",  bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
  BLOCKED:   { label: "Bloqueado", bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
};

function DotBadge({ status }: { status: string }) {
  const c = STATUS_CFG[status] ?? { label: status, bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"3px 10px", borderRadius:20, backgroundColor:c.bg, color:c.color, fontSize:12, fontWeight:600, whiteSpace:"nowrap" }}>
      <span style={{ width:6, height:6, borderRadius:"50%", backgroundColor:c.dot, flexShrink:0 }} />
      {c.label}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="usr-skel">
      {[42,30,14,8,9].map((w,i) => (
        <td key={i} style={{ padding:"14px 16px", borderBottom:"1px solid #e2e8f0" }}>
          <div style={{ height:13, width:`${w}%`, borderRadius:6, backgroundColor:"#e2e8f0" }} />
        </td>
      ))}
    </tr>
  );
}

function CardSkeleton() {
  return (
    <div className="usr-skel" style={{ background:C.surface, borderRadius:12, padding:16, border:`1px solid ${C.border}` }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
        <div style={{ height:14, width:"52%", borderRadius:6, backgroundColor:"#e2e8f0" }} />
        <div style={{ height:22, width:"18%", borderRadius:12, backgroundColor:"#e2e8f0" }} />
      </div>
      <div style={{ height:12, width:"38%", borderRadius:6, backgroundColor:"#e2e8f0", marginBottom:14 }} />
      <div style={{ display:"flex", justifyContent:"flex-end" }}>
        <div style={{ height:28, width:80, borderRadius:8, backgroundColor:"#e2e8f0" }} />
      </div>
    </div>
  );
}

const TH: React.CSSProperties = { padding:"11px 16px", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:"#64748b", backgroundColor:"#f8fafc", borderBottom:"1px solid #e2e8f0" };
const TD: React.CSSProperties = { padding:"14px 16px", fontSize:14, color:"#0f172a", borderBottom:"1px solid #e2e8f0", verticalAlign:"middle" };

export default function PrivateUsersListPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminUsersService.list({ page, size });
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch {
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const profileBtn: React.CSSProperties = {
    display:"inline-flex", alignItems:"center", padding:"6px 14px", borderRadius:8,
    border:`1px solid ${C.blue}`, color:C.blue, fontSize:12, fontWeight:600, textDecoration:"none",
  };

  return (
    <section style={{ backgroundColor:C.bg, minHeight:"100vh", padding:16 }}>
      <style>{`
        @keyframes usrpulse { 0%,100%{opacity:1} 50%{opacity:.45} }
        .usr-skel { animation: usrpulse 1.5s ease-in-out infinite; }
        .usr-tbl { display: block; }
        .usr-cards { display: none; }
        @media (max-width: 639px) {
          .usr-tbl { display: none !important; }
          .usr-cards { display: flex !important; flex-direction: column; gap: 12px; padding: 16px; }
        }
      `}</style>

      <PageHeader
        title="Usuários"
        description="Gerenciar usuários do sistema."
        backUrl="/private/dashboard"
        actions={
          <Link href="/private/users/new" style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 18px", borderRadius:8, backgroundColor:C.blue, color:"#fff", fontSize:13, fontWeight:600, textDecoration:"none" }}>
            + Criar Usuário
          </Link>
        }
      />

      <div style={{ background:C.surface, borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden" }}>
        {/* Desktop table */}
        <div className="usr-tbl" style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>
                <th style={TH}>Nome</th>
                <th style={TH}>E-mail</th>
                <th style={TH}>Status</th>
                <th style={{ ...TH, textAlign:"center" }}>Orgs</th>
                <th style={{ ...TH, textAlign:"right", width:120 }} />
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : users.length === 0
                  ? <tr><td colSpan={5} style={{ ...TD, textAlign:"center", color:C.muted, padding:48 }}>Nenhum usuário encontrado</td></tr>
                  : users.map(u => (
                    <tr key={u.id}
                      onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      style={{ transition:"background 0.15s" }}>
                      <td style={TD}><span style={{ fontWeight:600 }}>{u.name}</span></td>
                      <td style={{ ...TD, color:C.muted }}>{u.email}</td>
                      <td style={TD}><DotBadge status={u.status} /></td>
                      <td style={{ ...TD, textAlign:"center" }}>
                        <span style={{ fontWeight:600 }}>{u.organizationCodes?.length || 0}</span>
                      </td>
                      <td style={{ ...TD, textAlign:"right" }}>
                        <Link href={`/private/users/${u.id}`} style={profileBtn}>Ver Perfil</Link>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="usr-cards">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            : users.map(u => (
              <div key={u.id} style={{ background:C.surface, borderRadius:12, padding:16, border:`1px solid ${C.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15, color:C.navy }}>{u.name}</div>
                    <div style={{ fontSize:13, color:C.muted, marginTop:2 }}>{u.email}</div>
                  </div>
                  <DotBadge status={u.status} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12 }}>
                  <span style={{ fontSize:12, color:C.muted }}>{u.organizationCodes?.length || 0} org(s) vinculada(s)</span>
                  <Link href={`/private/users/${u.id}`} style={profileBtn}>Ver Perfil</Link>
                </div>
              </div>
            ))
          }
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 20px", borderTop:`1px solid ${C.border}` }}>
            <span style={{ fontSize:13, color:C.muted }}>Página {page + 1} de {totalPages}</span>
            <div style={{ display:"flex", gap:8 }}>
              {[
                { label:"← Anterior", disabled: page === 0, fn: () => setPage(p => p - 1) },
                { label:"Próxima →",  disabled: page >= totalPages - 1, fn: () => setPage(p => p + 1) },
              ].map(btn => (
                <button key={btn.label} disabled={btn.disabled || loading} onClick={btn.fn}
                  style={{ padding:"6px 14px", borderRadius:8, fontSize:13, fontWeight:600, border:`1px solid ${C.border}`, background:C.surface, color:C.navy, cursor:btn.disabled ? "not-allowed" : "pointer", opacity:btn.disabled ? 0.5 : 1 }}>
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
