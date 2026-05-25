"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import BillingAdminLayout from "../BillingAdminLayout";
import { formatMoney, formatDate } from "@/lib/formatters";
import Pagination from "@/components/Pagination";
import GenerateInvoicesModal from "@/components/billing/GenerateInvoicesModal";
import InvoiceDetailsModal from "@/components/billing/InvoiceDetailsModal";
import AsyncSelect from "react-select/async";
import { adminBillingService } from "@/services/private/admin-billing.service";

type Invoice = {
  id: string;
  payerUserId: string;
  payerUserName?: string;
  periodStart: string;
  periodEnd: string;
  totalCents: number;
  status: string;
  dueDate: string;
};

const C = {
  navy: "#0f172a", blue: "#1d4ed8", blueSoft: "#eff6ff",
  border: "#e2e8f0", muted: "#64748b", surface: "#ffffff",
};

const STATUS_CFG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  PAID:     { label: "Pago",      bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
  OPEN:     { label: "Aberto",    bg: "#fffbeb", color: "#92400e", dot: "#f59e0b" },
  PENDING:  { label: "Pendente",  bg: "#fffbeb", color: "#92400e", dot: "#f59e0b" },
  OVERDUE:  { label: "Vencido",   bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
  CANCELED: { label: "Cancelado", bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" },
  DEBT:     { label: "Inadimp.",  bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
};

function DotBadge({ status }: { status: string }) {
  const c = STATUS_CFG[status] ?? { label: status, bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600, backgroundColor:c.bg, color:c.color, whiteSpace:"nowrap" }}>
      <span style={{ width:6, height:6, borderRadius:"50%", backgroundColor:c.dot, flexShrink:0 }} />
      {c.label}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="inv-skel">
      {[28,25,12,12,12,10].map((w,i) => (
        <td key={i} style={{ padding:"13px 14px", borderBottom:"1px solid #e2e8f0" }}>
          <div style={{ height:12, width:`${w}%`, borderRadius:6, backgroundColor:"#e2e8f0" }} />
        </td>
      ))}
    </tr>
  );
}

function CardSkeleton() {
  return (
    <div className="inv-skel" style={{ background:"#fff", borderRadius:12, padding:16, border:"1px solid #e2e8f0" }}>
      {[50,35,20].map((w,i) => (
        <div key={i} style={{ height:12, width:`${w}%`, borderRadius:6, backgroundColor:"#e2e8f0", marginBottom:8 }} />
      ))}
      <div style={{ display:"flex", justifyContent:"flex-end", marginTop:10 }}>
        <div style={{ height:28, width:100, borderRadius:8, backgroundColor:"#e2e8f0" }} />
      </div>
    </div>
  );
}

const SEL: React.CSSProperties = { width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #e2e8f0", fontSize:13, color:"#0f172a", background:"#fff", outline:"none" };
const TH: React.CSSProperties = { padding:"11px 14px", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:"#64748b", backgroundColor:"#f8fafc", borderBottom:"1px solid #e2e8f0" };
const TD: React.CSSProperties = { padding:"13px 14px", fontSize:13, color:"#0f172a", borderBottom:"1px solid #e2e8f0", verticalAlign:"middle" };

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    status: "", periodStart: "", periodEnd: "",
    dueDateStart: "", dueDateEnd: "", payerUserId: "",
  });
  const [payerFilter, setPayerFilter] = useState<{ value: string; label: string } | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (isMounted) fetchInvoices();
  }, [page, size, isMounted]);

  if (!isMounted) return null;

  async function fetchInvoices() {
    try {
      setLoading(true);
      const res = await api.get("/private/admin/billing/invoices", {
        params: { ...filters, payerUserId: filters.payerUserId || undefined, page, size },
      });
      setInvoices(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch {
      toast.error("Erro ao carregar faturas");
    } finally {
      setLoading(false);
    }
  }

  function handleFilter() { setPage(0); fetchInvoices(); }

  function handleClear() {
    setFilters({ status:"", periodStart:"", periodEnd:"", dueDateStart:"", dueDateEnd:"", payerUserId:"" });
    setPayerFilter(null);
  }

  async function loadPayerOptions(inputValue: string) {
    if (!inputValue || inputValue.length < 3) return [];
    try {
      const data = await adminBillingService.listAccounts({ name: inputValue });
      return (data.content || []).map((account: any) => ({
        value: String(account.userId),
        label: account.name,
      }));
    } catch {
      return [];
    }
  }

  return (
    <BillingAdminLayout>
      <style>{`
        @keyframes inv-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
        .inv-skel { animation: inv-pulse 1.5s ease-in-out infinite; }
        .inv-tbl { display: block; }
        .inv-cards { display: none; }
        @media (max-width: 639px) {
          .inv-tbl { display: none !important; }
          .inv-cards { display: flex !important; flex-direction: column; gap: 12px; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <h6 style={{ fontWeight:700, margin:0, color:C.navy }}>Faturas</h6>
        <button
          data-bs-toggle="modal"
          data-bs-target="#generateInvoicesModal"
          style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 18px", borderRadius:8, backgroundColor:C.blue, color:"#fff", fontSize:13, fontWeight:600, border:"none", cursor:"pointer" }}
        >
          Gerar Faturas
        </button>
      </div>

      {/* Filters */}
      <div style={{ background:"#f8fafc", borderRadius:10, padding:16, border:`1px solid ${C.border}`, marginBottom:24 }}>
        <div style={{ fontSize:12, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:12 }}>Filtros</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:12 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:C.muted, display:"block", marginBottom:5 }}>Status</label>
            <select style={SEL} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="">Todos</option>
              <option value="OPEN">Aberto</option>
              <option value="PAID">Pago</option>
              <option value="CANCELED">Cancelado</option>
              <option value="OVERDUE">Vencido</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:C.muted, display:"block", marginBottom:5 }}>Vencimento início</label>
            <input type="date" style={SEL} value={filters.dueDateStart} onChange={e => setFilters(f => ({ ...f, dueDateStart: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:C.muted, display:"block", marginBottom:5 }}>Vencimento fim</label>
            <input type="date" style={SEL} value={filters.dueDateEnd} onChange={e => setFilters(f => ({ ...f, dueDateEnd: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:C.muted, display:"block", marginBottom:5 }}>Pagador</label>
            <AsyncSelect
              cacheOptions
              loadOptions={loadPayerOptions}
              defaultOptions
              value={payerFilter}
              onChange={option => {
                setPayerFilter(option);
                setFilters(f => ({ ...f, payerUserId: option ? option.value : "" }));
              }}
              placeholder="Buscar por nome..."
              noOptionsMessage={() => "Nenhum pagador"}
              loadingMessage={() => "Buscando..."}
              isClearable
              styles={{
                control: base => ({ ...base, minHeight:38, borderRadius:8, borderColor:"#e2e8f0", fontSize:13 }),
                menu: base => ({ ...base, zIndex: 9999 }),
              }}
            />
          </div>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:14 }}>
          <button onClick={handleFilter}
            style={{ padding:"8px 20px", borderRadius:8, backgroundColor:C.blue, color:"#fff", fontSize:13, fontWeight:600, border:"none", cursor:"pointer" }}>
            Filtrar
          </button>
          <button onClick={handleClear}
            style={{ padding:"8px 20px", borderRadius:8, border:`1px solid ${C.border}`, color:C.muted, fontSize:13, fontWeight:600, background:"#fff", cursor:"pointer" }}>
            Limpar
          </button>
        </div>
      </div>

      <div style={{ background:"#fff", borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden", marginBottom:20 }}>
        {/* Desktop */}
        <div className="inv-tbl" style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>
                <th style={TH}>Período</th>
                <th style={TH}>Pagador</th>
                <th style={TH}>Total</th>
                <th style={TH}>Status</th>
                <th style={TH}>Vencimento</th>
                <th style={{ ...TH, textAlign:"right" }} />
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_,i) => <SkeletonRow key={i} />)
                : invoices.length === 0
                  ? <tr><td colSpan={6} style={{ ...TD, textAlign:"center", color:C.muted, padding:48 }}>Nenhuma fatura encontrada</td></tr>
                  : invoices.map(inv => (
                    <tr key={inv.id}
                      onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      style={{ transition:"background 0.15s" }}>
                      <td style={{ ...TD, fontSize:12, color:C.muted }}>
                        {formatDate(inv.periodStart)} — {formatDate(inv.periodEnd)}
                      </td>
                      <td style={TD}>{inv.payerUserName || inv.payerUserId}</td>
                      <td style={{ ...TD, fontWeight:700 }}>{formatMoney(inv.totalCents)}</td>
                      <td style={TD}><DotBadge status={inv.status} /></td>
                      <td style={{ ...TD, fontSize:12, color:C.muted }}>{formatDate(inv.dueDate)}</td>
                      <td style={{ ...TD, textAlign:"right" }}>
                        <button
                          data-bs-toggle="modal"
                          data-bs-target="#invoiceDetailsModal"
                          onClick={() => setSelectedInvoiceId(inv.id)}
                          style={{ padding:"6px 14px", borderRadius:8, border:`1px solid ${C.blue}`, color:C.blue, fontSize:12, fontWeight:600, background:"#fff", cursor:"pointer" }}
                        >
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="inv-cards" style={{ padding:16 }}>
          {loading
            ? Array.from({ length: 4 }).map((_,i) => <CardSkeleton key={i} />)
            : invoices.map(inv => (
              <div key={inv.id} style={{ background:"#fff", borderRadius:12, padding:16, border:`1px solid ${C.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14, color:C.navy }}>{inv.payerUserName || inv.payerUserId}</div>
                    <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{formatDate(inv.periodStart)} — {formatDate(inv.periodEnd)}</div>
                  </div>
                  <DotBadge status={inv.status} />
                </div>
                <div style={{ fontSize:13, fontWeight:700, color:C.blue, marginBottom:4 }}>{formatMoney(inv.totalCents)}</div>
                <div style={{ fontSize:12, color:C.muted, marginBottom:12 }}>Vencimento: {formatDate(inv.dueDate)}</div>
                <div style={{ display:"flex", justifyContent:"flex-end" }}>
                  <button
                    data-bs-toggle="modal"
                    data-bs-target="#invoiceDetailsModal"
                    onClick={() => setSelectedInvoiceId(inv.id)}
                    style={{ padding:"6px 14px", borderRadius:8, border:`1px solid ${C.blue}`, color:C.blue, fontSize:12, fontWeight:600, background:"#fff", cursor:"pointer" }}
                  >
                    Ver Detalhes
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      <Pagination page={page} size={size} totalPages={totalPages} onChange={setPage} onSizeChange={setSize} />

      <GenerateInvoicesModal />
      <InvoiceDetailsModal invoiceId={selectedInvoiceId} />
    </BillingAdminLayout>
  );
}
