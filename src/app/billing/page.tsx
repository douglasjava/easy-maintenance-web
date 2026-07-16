"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import { formatMoney, formatDate } from "@/lib/formatters";
import PlanChangeDialog from "@/components/billing/PlanChangeDialog";
import InvoiceList from "@/components/billing/InvoiceList";
import PendingPixPaymentCard from "@/components/billing/PendingPixPaymentCard";
import PlanComparisonSection from "@/components/billing/PlanComparisonSection";
import BillingFaq from "@/components/billing/BillingFaq";
import PaymentMethodSelectionModal from "@/components/billing/PaymentMethodSelectionModal";
import { usePendingPayment } from "@/hooks/usePendingPayment";
import { useCurrentOrganizationAccess } from "@/hooks/useAccessControl";
import { useAccessContext } from "@/providers/AccessContextProvider";
import ConfirmModal from "@/components/ConfirmModal";
import { CreditCard, AlertCircle, CheckCircle, User, Building, ArrowRight, ChevronRight, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

// ── Types ────────────────────────────────────────────────────────────────────

type Plan = { code: string; name: string; priceCents: number };

type PendingChange = { nextPlan: Plan; effectiveAt: string };

type SubscriptionItem = {
  id: number;
  type: "USER" | "ORGANIZATION";
  name: string;
  reference: string;
  plan: Plan;
  valueCents: number;
  pendingChange: PendingChange | null;
  cancelAtPeriodEnd: boolean;
  scheduledCancellationDate: string | null;
  /** Itens cadastrados nesta organização, dentro do pool compartilhado da conta (null para o item USER). */
  itemsUsedByOrg: number | null;
};

type Subscription = {
  id: number;
  status: string;
  cycle: string;
  totalCents: number;
  nextDueDate: string;
  projectedTotalCents: number | null;
  projectedChangeDate: string | null;
  // EPIC-014: uso do plano único por conta (0 = ilimitado)
  maxOrganizations: number;
  organizationsUsed: number;
  maxUsers: number;
  usersUsed: number;
  maxItems: number;
  itemsUsedTotalAccount: number;
};

type Invoice = {
  id: number;
  status: string;
  amountCents: number;
  periodStart: string;
  periodEnd: string;
  paymentLink?: string | null;
  receiptUrl?: string | null;
};

type BillingAccount = {
  email: string;
  paymentMethod: string;
  cardLast4: string;
  cardBrand: string;
};

type BillingSummary = {
  subscription: Subscription | null;
  items: SubscriptionItem[];
  invoices: Invoice[];
  billingAccount: BillingAccount | null;
};

// ── Design tokens ─────────────────────────────────────────────────────────────

const TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  USER:         { bg: "#eff6ff", color: "#1d4ed8" },
  ORGANIZATION: { bg: "#f0f9ff", color: "#0369a1" },
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE:         "Ativa",
  TRIAL:          "Trial",
  TRIAL_EXPIRED:  "Trial expirado",
  PAST_DUE:       "Em atraso",
  CANCELED:       "Cancelada",
};

const METHOD_LABELS: Record<string, string> = {
  CARD: "Cartão de Crédito",
  PIX:  "PIX — cobrança mensal",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function SubscriptionItemCard({
  item,
  onChangePlan,
  onCancel,
  onUndoCancel,
  undoLoading,
}: {
  item: SubscriptionItem;
  onChangePlan: (id: number) => void;
  onCancel: (id: number) => void;
  onUndoCancel: (id: number) => void;
  undoLoading: boolean;
}) {
  const typeStyle = TYPE_STYLE[item.type] ?? { bg: "#f3f4f6", color: "#374151" };

  return (
    <div
      className="card border-0 shadow-sm mb-3"
      style={{ borderRadius: 12, overflow: "hidden" }}
    >
      <div className="card-body p-4">
        {/* Header row */}
        <div className="d-flex justify-content-between align-items-start gap-3 mb-3 flex-wrap">
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: typeStyle.bg }}
            >
              {item.type === "USER"
                ? <User size={18} style={{ color: typeStyle.color }} />
                : <Building size={18} style={{ color: typeStyle.color }} />}
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span className="fw-bold text-dark" style={{ fontSize: "0.9rem" }}>{item.name}</span>
                <span
                  style={{
                    display: "inline-block",
                    padding: "1px 8px",
                    borderRadius: 20,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    backgroundColor: typeStyle.bg,
                    color: typeStyle.color,
                  }}
                >
                  {item.type}
                </span>
              </div>
            </div>
          </div>

          <div className="text-end flex-shrink-0">
            <div className="fw-bold text-dark">{formatMoney(item.valueCents)}</div>
            <div className="text-muted" style={{ fontSize: "0.78rem" }}>Plano: {item.plan.name}</div>
          </div>
        </div>

        {/* Cancellation scheduled */}
        {item.cancelAtPeriodEnd && (
          <div
            className="rounded-3 p-3 mb-3 d-flex align-items-start gap-2"
            style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa" }}
          >
            <Clock size={16} style={{ color: "#c2410c", flexShrink: 0, marginTop: 1 }} />
            <div>
              <div className="fw-semibold" style={{ fontSize: "0.8rem", color: "#c2410c" }}>Cancelamento agendado</div>
              <div style={{ fontSize: "0.78rem", color: "#9a3412" }}>
                Este item será encerrado em{" "}
                <strong>{item.scheduledCancellationDate ? formatDate(item.scheduledCancellationDate) : "breve"}</strong>.
                {" "}O acesso permanece ativo até o fim do período vigente.
              </div>
            </div>
          </div>
        )}

        {/* Pending change */}
        {item.pendingChange && (
          <div
            className="rounded-3 p-3 mb-3 d-flex align-items-start gap-2"
            style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}
          >
            <Clock size={16} style={{ color: "#92400e", flexShrink: 0, marginTop: 1 }} />
            <div>
              <div className="fw-semibold" style={{ fontSize: "0.8rem", color: "#92400e" }}>Mudança agendada</div>
              <div style={{ fontSize: "0.78rem", color: "#78350f" }}>
                <strong>{item.plan.name}</strong>
                <ArrowRight size={11} className="mx-1" />
                <strong>{item.pendingChange.nextPlan.name}</strong>
                {" "}a partir de {formatDate(item.pendingChange.effectiveAt)}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="d-flex justify-content-end gap-2">
          {item.cancelAtPeriodEnd ? (
            <button
              className="btn btn-sm"
              style={{ border: "1px solid #fed7aa", color: "#c2410c", borderRadius: 20, padding: "3px 12px", fontSize: "0.78rem" }}
              onClick={() => onUndoCancel(item.id)}
              disabled={undoLoading}
            >
              {undoLoading ? "Desfazendo..." : "Desfazer cancelamento"}
            </button>
          ) : (
            <>
              <button
                className="btn btn-sm"
                style={{ border: "1px solid #fecaca", color: "#dc2626", borderRadius: 20, padding: "3px 12px", fontSize: "0.78rem" }}
                onClick={() => onCancel(item.id)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-sm d-flex align-items-center gap-1"
                style={{ border: "1px solid #bfdbfe", color: "#1d4ed8", borderRadius: 20, padding: "3px 12px", fontSize: "0.78rem" }}
                onClick={() => onChangePlan(item.id)}
              >
                Alterar Plano <ChevronRight size={13} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function formatUsage(used: number, max: number) {
  if (max <= 0) return `${used} (ilimitado)`;
  return `${used}/${max}`;
}

function AccountUsageStats({ subscription }: { subscription: Subscription }) {
  const stats = [
    { label: "Organizações", value: formatUsage(subscription.organizationsUsed, subscription.maxOrganizations) },
    { label: "Usuários", value: formatUsage(subscription.usersUsed, subscription.maxUsers) },
    { label: "Itens", value: formatUsage(subscription.itemsUsedTotalAccount, subscription.maxItems) },
  ];

  return (
    <div className="d-flex flex-wrap gap-2 mt-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded-3 px-3 py-2" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
          <div style={{ fontSize: "0.66rem", opacity: 0.75 }}>{s.label}</div>
          <div style={{ fontSize: "0.88rem", fontWeight: 700 }}>{s.value}</div>
        </div>
      ))}
    </div>
  );
}

/** Lista somente-leitura das organizações incluídas no plano da conta — sem ações de plano/cancelamento. */
function OrganizationsIncludedList({ items }: { items: SubscriptionItem[] }) {
  if (items.length === 0) {
    return (
      <div
        className="card border-0 text-center py-4"
        style={{ borderRadius: 12, backgroundColor: "#f8f9fa", border: "1px dashed #e5e7eb" }}
      >
        <p className="text-muted mb-0" style={{ fontSize: "0.875rem" }}>
          Nenhuma organização cadastrada ainda.
        </p>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 12, overflow: "hidden" }}>
      {items.map((org, idx) => (
        <div
          key={org.id}
          className="d-flex align-items-center justify-content-between gap-3 px-4 py-3"
          style={{ borderBottom: idx < items.length - 1 ? "1px solid #f1f5f9" : "none" }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#f0f9ff" }}
            >
              <Building size={16} style={{ color: "#0369a1" }} />
            </div>
            <span className="fw-semibold text-dark" style={{ fontSize: "0.85rem" }}>{org.name}</span>
          </div>
          <span
            style={{
              padding: "2px 10px",
              borderRadius: 20,
              fontSize: "0.72rem",
              fontWeight: 600,
              backgroundColor: "#f3f4f6",
              color: "#6b7280",
              border: "1px solid #e5e7eb",
              whiteSpace: "nowrap",
            }}
          >
            {org.itemsUsedByOrg ?? 0} {(org.itemsUsedByOrg ?? 0) === 1 ? "item" : "itens"}
          </span>
        </div>
      ))}
    </div>
  );
}

function PaymentMethodCard({ account, onChangeMethod }: { account: BillingAccount; onChangeMethod: () => void }) {
  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div
            style={{ fontSize: "0.68rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}
          >
            Método de Pagamento
          </div>
          <button
            className="btn btn-sm"
            style={{ border: "1px solid #bfdbfe", color: "#1d4ed8", borderRadius: 20, padding: "2px 10px", fontSize: "0.78rem" }}
            onClick={onChangeMethod}
          >
            Alterar
          </button>
        </div>

        <div
          className="d-flex align-items-center gap-3 p-3 rounded-3"
          style={{ backgroundColor: "#f8f9fa", border: "1px solid #e5e7eb" }}
        >
          <div
            className="d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#fff", border: "1px solid #e5e7eb" }}
          >
            <CreditCard size={20} style={{ color: "#2563eb" }} />
          </div>
          <div className="text-dark" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
            {METHOD_LABELS[account.paymentMethod] ?? account.paymentMethod}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function BillingSkeleton() {
  return (
    <section style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }} className="pb-5">
      <div className="container px-3 px-md-4">
        <div className="pt-4 pb-3 placeholder-glow">
          <span className="placeholder rounded d-block mb-2" style={{ height: 26, width: 120 }} />
          <span className="placeholder rounded d-block" style={{ height: 14, width: 260 }} />
        </div>

        {/* summary card skeleton */}
        <div className="placeholder-glow mb-4">
          <span className="placeholder rounded-3 d-block w-100" style={{ height: 100 }} />
        </div>

        <div className="row g-4 placeholder-glow">
          <div className="col-12 col-lg-8">
            <span className="placeholder rounded-3 d-block w-100 mb-3" style={{ height: 100 }} />
            <span className="placeholder rounded-3 d-block w-100" style={{ height: 100 }} />
          </div>
          <div className="col-12 col-lg-4">
            <span className="placeholder rounded-3 d-block w-100 mb-3" style={{ height: 140 }} />
            <span className="placeholder rounded-3 d-block w-100" style={{ height: 100 }} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const router = useRouter();
  const { isBlocked } = useAuth();
  const { accessContext, isLoading: isAccessLoading } = useAccessContext();
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { organization } = useCurrentOrganizationAccess();
  const currentPlanCode = organization?.plan?.code ?? null;
  const { pendingPayment } = usePendingPayment();

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ id: number; planCode: string } | null>(null);
  const [itemToCancel, setItemToCancel] = useState<number | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [undoLoading, setUndoLoading] = useState(false);
  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false);

  useEffect(() => {
    if (isAccessLoading) return;
    const canBilling = accessContext?.accountAccess?.permissions?.canManageOwnBilling ?? true;
    if (!canBilling) {
      router.replace("/");
    }
  }, [isAccessLoading, accessContext, router]);

  useEffect(() => { fetchSummary(); }, []);

  async function fetchSummary() {
    try {
      setLoading(true);
      const { data } = await api.get("/me/billing/summary");
      setSummary(data);
    } catch {
      toast.error("Não foi possível carregar os dados de faturamento.");
    } finally {
      setLoading(false);
    }
  }

  function handleChangePlan(itemId: number) {
    const item = summary?.items.find((i) => i.id === itemId);
    if (item) {
      setSelectedItem({ id: item.id, planCode: item.plan.code });
      setIsPlanModalOpen(true);
    }
  }

  async function handleCancelItem(itemId: number) {
    try {
      setCancelLoading(true);
      await api.post(`/billing/subscription-items/${itemId}/cancel`);
      toast.success("Item da assinatura cancelado com sucesso!");
      setItemToCancel(null);
      fetchSummary();
    } catch {
      toast.error("Erro ao cancelar item da assinatura.");
    } finally {
      setCancelLoading(false);
    }
  }

  async function handleUndoCancelItem(itemId: number) {
    try {
      setUndoLoading(true);
      await api.post(`/billing/subscription-items/${itemId}/undo-cancel`);
      toast.success("Cancelamento desfeito com sucesso!");
      fetchSummary();
    } catch {
      toast.error("Erro ao desfazer o cancelamento.");
    } finally {
      setUndoLoading(false);
    }
  }

  if (isAccessLoading || loading) return <BillingSkeleton />;

  const hasSubscription = !!summary?.subscription;
  const hasBillingAccount = !!summary?.billingAccount;
  const userItem = summary?.items.find((i) => i.type === "USER") ?? null;
  const organizationItems = summary?.items.filter((i) => i.type === "ORGANIZATION") ?? [];

  return (
    <section style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }} className="pb-5">
      <div className="container px-3 px-md-4">

        {/* ── HEADER ── */}
        <div className="pt-4 pb-3">
          <h1
            style={{
              fontSize: "clamp(1.25rem, 3vw, 1.6rem)",
              fontWeight: 700,
              color: "#0f172a",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Faturamento
          </h1>
          <p className="text-muted mb-0 mt-1" style={{ fontSize: "0.85rem" }}>
            Gerencie sua assinatura, itens e pagamentos
          </p>
        </div>

        {/* ── BLOCKED BANNER ── */}
        {isBlocked && (
          <div
            className="d-flex align-items-start gap-3 rounded-3 p-4 mb-4"
            style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}
          >
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#fee2e2" }}
            >
              <AlertCircle size={20} style={{ color: "#dc2626" }} />
            </div>
            <div>
              <div className="fw-bold text-dark mb-1" style={{ fontSize: "0.9rem" }}>Acesso Bloqueado</div>
              <p className="mb-0 text-muted" style={{ fontSize: "0.82rem" }}>
                Seu período de avaliação terminou ou há faturas pendentes.
                Regularize sua situação para retomar o uso completo do sistema.
              </p>
            </div>
          </div>
        )}

        {/* ── NO SUBSCRIPTION ── */}
        {!hasSubscription ? (
          <div
            className="card border-0 shadow-sm text-center"
            style={{ borderRadius: 12, padding: "3rem 2rem" }}
          >
            <div
              className="d-flex align-items-center justify-content-center mx-auto mb-4"
              style={{ width: 80, height: 80, borderRadius: "50%", backgroundColor: "#eff6ff" }}
            >
              <CreditCard size={40} style={{ color: "#2563eb" }} />
            </div>
            <h4 className="fw-bold mb-2 text-dark">Você ainda não possui uma assinatura ativa</h4>
            <p className="text-muted mb-4 mx-auto" style={{ maxWidth: 400, fontSize: "0.875rem" }}>
              Escolha um plano para começar a aproveitar todos os recursos do Easy Maintenance.
            </p>
            <button
              className="btn btn-primary mx-auto"
              style={{ borderRadius: 20, padding: "8px 32px", fontWeight: 600 }}
            >
              Escolher plano
            </button>
          </div>
        ) : (
          <>
            {/* ── SUBSCRIPTION SUMMARY CARD ── */}
            <div className="mb-4">
              <div
                className="rounded-3 p-4 text-white"
                style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)" }}
              >
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.15)" }}
                  >
                    <CheckCircle size={28} />
                  </div>
                  <div>
                    <div className="mb-1">
                      <span
                        style={{
                          display: "inline-block",
                          backgroundColor: "rgba(255,255,255,0.25)",
                          padding: "1px 10px",
                          borderRadius: 20,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          letterSpacing: "0.04em",
                        }}
                      >
                        {STATUS_LABEL[summary.subscription?.status ?? ""] ?? summary.subscription?.status}
                      </span>
                    </div>
                    <div style={{ fontSize: "clamp(1.1rem, 3vw, 1.4rem)", fontWeight: 700, opacity: 0.95 }}>
                      {formatMoney(summary.subscription?.totalCents || 0)}
                      <span style={{ fontSize: "0.8rem", fontWeight: 400, opacity: 0.75 }}>
                        {" "}/ {summary.subscription?.cycle === "MONTHLY" ? "mês" : "ano"}
                      </span>
                    </div>
                    {summary.subscription?.projectedTotalCents != null && (
                      <div
                        className="d-flex align-items-center gap-1 mt-1"
                        style={{ fontSize: "0.75rem", opacity: 0.85 }}
                      >
                        <ArrowRight size={12} />
                        <span>
                          {formatMoney(summary.subscription.projectedTotalCents)}/mês após{" "}
                          {summary.subscription.projectedChangeDate
                            ? formatDate(summary.subscription.projectedChangeDate)
                            : "próximo ciclo"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="rounded-3 p-3 text-center text-md-end"
                  style={{ backgroundColor: "rgba(255,255,255,0.12)", minWidth: 0 }}
                >
                  <div style={{ fontSize: "0.72rem", opacity: 0.75, marginBottom: 2 }}>Próxima cobrança</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                    {formatDate(summary.subscription?.nextDueDate || "")}
                  </div>
                </div>
              </div>

                {/* Uso do plano — organizações / usuários / itens (pool compartilhado da conta) */}
                {summary.subscription && <AccountUsageStats subscription={summary.subscription} />}
              </div>
            </div>

            {/* ── MAIN CONTENT ── */}
            <div className="row g-4">

              {/* Account plan + organizations — main column */}
              <div className="col-12 col-lg-8">
                {userItem?.cancelAtPeriodEnd && (
                  <div
                    className="rounded-3 p-3 mb-3 d-flex align-items-start gap-2"
                    style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa" }}
                  >
                    <AlertCircle size={16} style={{ color: "#c2410c", flexShrink: 0, marginTop: 1 }} />
                    <div style={{ fontSize: "0.82rem", color: "#9a3412" }}>
                      Sua assinatura será encerrada
                      {userItem.scheduledCancellationDate ? <> em <strong>{formatDate(userItem.scheduledCancellationDate)}</strong></> : " em breve"}.
                      {" "}O acesso permanece ativo até o fim do período vigente.
                    </div>
                  </div>
                )}

                <div
                  style={{ fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}
                  className="mb-3"
                >
                  Seu Plano
                </div>

                {userItem ? (
                  <SubscriptionItemCard
                    item={userItem}
                    onChangePlan={handleChangePlan}
                    onCancel={(id) => setItemToCancel(id)}
                    onUndoCancel={handleUndoCancelItem}
                    undoLoading={undoLoading}
                  />
                ) : (
                  <div
                    className="card border-0 text-center py-5 mb-4"
                    style={{ borderRadius: 12, backgroundColor: "#f8f9fa", border: "1px dashed #e5e7eb" }}
                  >
                    <p className="text-muted mb-0" style={{ fontSize: "0.875rem" }}>
                      Nenhum plano ativo encontrado para sua conta.
                    </p>
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                  <div
                    style={{ fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}
                  >
                    Organizações incluídas
                  </div>
                  <span
                    style={{
                      padding: "2px 10px",
                      borderRadius: 20,
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      backgroundColor: "#f3f4f6",
                      color: "#6b7280",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    {organizationItems.length} {organizationItems.length === 1 ? "organização" : "organizações"}
                  </span>
                </div>

                <OrganizationsIncludedList items={organizationItems} />
              </div>

              {/* Sidebar */}
              <div className="col-12 col-lg-4">
                <div className="d-flex flex-column gap-4">

                  {/* PIX pending payment */}
                  {pendingPayment && pendingPayment.methodType === "PIX" && (
                    <PendingPixPaymentCard payment={pendingPayment} />
                  )}

                  {/* Invoices */}
                  <InvoiceList invoices={summary.invoices} />

                  {/* Payment method */}
                  {hasBillingAccount ? (
                    <PaymentMethodCard
                      account={summary.billingAccount!}
                      onChangeMethod={() => setIsPaymentMethodModalOpen(true)}
                    />
                  ) : (
                    <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
                      <div className="card-body p-4">
                        <div
                          style={{ fontSize: "0.68rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}
                        >
                          Método de Pagamento
                        </div>
                        <div
                          className="rounded-3 p-3 mb-3"
                          style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", fontSize: "0.82rem", color: "#1d4ed8" }}
                        >
                          Nenhum método de pagamento cadastrado.
                        </div>
                        <button
                          className="btn btn-primary w-100"
                          style={{ borderRadius: 20, fontWeight: 600 }}
                          onClick={() => setIsPaymentMethodModalOpen(true)}
                        >
                          Confirmar forma de pagamento
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Plan comparison + FAQ */}
        <PlanComparisonSection
          currentPlanCode={currentPlanCode}
          onUpgradeClick={() => {
            if (userItem) {
              setSelectedItem({ id: userItem.id, planCode: userItem.plan.code });
              setIsPlanModalOpen(true);
            }
          }}
        />
        <BillingFaq />

      </div>

      {/* Modals */}
      {isPlanModalOpen && selectedItem && (
        <PlanChangeDialog
          show={isPlanModalOpen}
          onClose={() => { setIsPlanModalOpen(false); setSelectedItem(null); }}
          onSuccess={fetchSummary}
          itemId={selectedItem.id}
          currentPlanCode={selectedItem.planCode}
        />
      )}

      <PaymentMethodSelectionModal
        show={isPaymentMethodModalOpen}
        onClose={() => setIsPaymentMethodModalOpen(false)}
        onSuccess={fetchSummary}
        currentMethod={summary?.billingAccount?.paymentMethod as "CARD" | "PIX" | null ?? null}
        subscriptionStatus={summary?.subscription?.status ?? null}
      />

      <ConfirmModal
        show={!!itemToCancel}
        title="Cancelar Assinatura"
        message="Tem certeza que deseja cancelar sua assinatura? Esta ação removerá o acesso a todas as organizações da sua conta ao final do período vigente."
        confirmLabel="Confirmar Cancelamento"
        cancelLabel="Manter Assinatura"
        loading={cancelLoading}
        onConfirm={() => itemToCancel && handleCancelItem(itemToCancel)}
        onCancel={() => !cancelLoading && setItemToCancel(null)}
      />
    </section>
  );
}
