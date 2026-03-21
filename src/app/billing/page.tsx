"use client";

import {useEffect, useState} from "react";
import {api} from "@/lib/apiClient";
import {formatMoney, formatDate} from "@/lib/formatters";
import PlanChangeDialog from "@/components/billing/PlanChangeDialog";
import InvoiceList from "@/components/billing/InvoiceList";
import ConfirmModal from "@/components/ConfirmModal";
import {
    Calendar,
    CreditCard,
    AlertCircle,
    CheckCircle,
    RefreshCw,
    User,
    Building,
    ArrowRight,
    ChevronRight,
    Clock,
    ExternalLink
} from "lucide-react";
import {useAuth} from "@/contexts/AuthContext";
import toast from "react-hot-toast";

// --- Types ---

type Plan = {
    code: string;
    name: string;
    priceCents: number;
};

type PendingChange = {
    nextPlan: Plan;
    effectiveAt: string;
};

type SubscriptionItem = {
    id: number;
    type: "USER" | "ORGANIZATION";
    name: string;
    reference: string;
    plan: Plan;
    valueCents: number;
    pendingChange: PendingChange | null;
};

type Subscription = {
    id: number;
    status: string;
    cycle: string;
    totalCents: number;
    nextDueDate: string;
};

type Invoice = {
    id: number;
    status: string;
    amountCents: number;
    periodStart: string;
    periodEnd: string;
    paymentLink?: string | null;
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

// --- Components ---

const StatusBadge = ({status}: { status: string }) => {
    const getBadgeStyles = (s: string) => {
        switch (s.toUpperCase()) {
            case "ACTIVE":
            case "PAID":
                return "bg-success-subtle text-success border-success-subtle";
            case "PAST_DUE":
            case "OVERDUE":
            case "DEBT":
                return "bg-danger-subtle text-danger border-danger-subtle";
            case "OPEN":
            case "PENDING":
                return "bg-warning-subtle text-warning-emphasis border-warning-subtle";
            case "CANCELED":
                return "bg-secondary-subtle text-secondary border-secondary-subtle";
            default:
                return "bg-light text-dark border-light";
        }
    };

    return (
        <span className={`badge rounded-pill border px-2 py-1 ${getBadgeStyles(status)}`}>
      {status}
    </span>
    );
};

const SubscriptionItemCard = ({
                                  item,
                                  onChangePlan,
                                  onCancel
                              }: {
    item: SubscriptionItem;
    onChangePlan: (id: number) => void;
    onCancel: (id: number) => void;
}) => {
    return (
        <div className="card border shadow-sm rounded-4 mb-3 overflow-hidden">
            <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-3">
                        <div
                            className={`p-2 rounded-3 ${item.type === "USER" ? "bg-primary-subtle text-primary" : "bg-info-subtle text-info-emphasis"}`}>
                            {item.type === "USER" ? <User size={20}/> : <Building size={20}/>}
                        </div>
                        <div>
                            <div className="d-flex align-items-center gap-2">
                                <h6 className="mb-0 fw-bold">{item.name}</h6>
                                <span
                                    className={`badge rounded-pill small ${item.type === "USER" ? "bg-primary-subtle text-primary" : "bg-info-subtle text-info-emphasis"}`}
                                    style={{fontSize: '0.7rem'}}>
                                  {item.type}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-end">
                        <div className="fw-bold">{formatMoney(item.valueCents)}</div>
                        <div className="text-muted small">Plano: {item.plan.name}</div>
                    </div>
                </div>

                {item.pendingChange && (
                    <div className="alert alert-warning border-0 bg-warning-subtle rounded-3 p-3 mb-3">
                        <div className="d-flex gap-2">
                            <Clock size={18} className="text-warning-emphasis"/>
                            <div>
                                <div className="fw-bold small text-warning-emphasis">Mudança agendada</div>
                                <p className="mb-0 small text-warning-emphasis">
                                    Atual: <strong>{item.plan.name}</strong> <ArrowRight size={12}
                                                                                         className="mx-1"/> Novo: <strong>{item.pendingChange.nextPlan.name}</strong> a
                                    partir de {formatDate(item.pendingChange.effectiveAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="d-flex justify-content-end gap-2">
                    <button
                        className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-medium d-flex align-items-center gap-1"
                        onClick={() => onCancel(item.id)}
                    >
                        Cancelar
                    </button>
                    <button
                        className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-medium d-flex align-items-center gap-1"
                        onClick={() => onChangePlan(item.id)}
                    >
                        Alterar Plano <ChevronRight size={14}/>
                    </button>
                </div>
            </div>
        </div>
    );
};


const PaymentMethodCard = ({account}: { account: BillingAccount }) => {
    return (
        <div className="card border shadow-sm rounded-4">
            <div className="card-header bg-white border-0 py-3 px-4">
                <h6 className="mb-0 fw-bold">Método de Pagamento</h6>
            </div>
            <div className="card-body px-4 pb-4 pt-0">
                <div className="d-flex align-items-center gap-3 p-3 border rounded-4 bg-light bg-opacity-50">
                    <div className="bg-white p-2 rounded-3 border shadow-sm">
                        <CreditCard size={24} className="text-primary"/>
                    </div>
                    <div className="text-muted small fw-medium">
                        {account.paymentMethod}
                    </div>
                </div>
                <button className="btn btn-link btn-sm w-100 text-decoration-none mt-2 text-muted">
                    Gerenciar no portal de pagamento
                </button>
            </div>
        </div>
    );
};

// --- Page ---

export default function BillingPage() {
    const {isBlocked} = useAuth();
    const [summary, setSummary] = useState<BillingSummary | null>(null);
    const [loading, setLoading] = useState(true);

    // Plan Change Modal State
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<{ id: number; planCode: string } | null>(null);

    // Cancellation Modal State
    const [itemToCancel, setItemToCancel] = useState<number | null>(null);
    const [cancelLoading, setCancelLoading] = useState(false);

    async function fetchSummary() {
        try {
            setLoading(true);
            const {data} = await api.get("/me/billing/summary");
            setSummary(data);
        } catch (err) {
            console.error("Erro ao carregar faturamento", err);
            toast.error("Não foi possível carregar os dados de faturamento.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchSummary();
    }, []);

    async function handleChangePlan(itemId: number) {
        const item = summary?.items.find(i => i.id === itemId);
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
        } catch (err) {
            console.error("Erro ao cancelar item", err);
            toast.error("Erro ao cancelar item da assinatura.");
        } finally {
            setCancelLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="container py-5">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </div>
                    <p className="mt-3 text-muted">Carregando informações de faturamento...</p>
                </div>
            </div>
        );
    }

    const hasSubscription = !!summary?.subscription;
    const hasItems = (summary?.items?.length || 0) > 0;
    const hasBillingAccount = !!summary?.billingAccount;

    return (
        <div className="container py-4">
            <div className="mb-4 d-flex justify-content-between align-items-end">
                <div>
                    <h2 className="mb-1 fw-bold">Faturamento</h2>
                    <p className="text-muted mb-0">Gerencie sua assinatura, itens e pagamentos</p>
                </div>
            </div>

            {isBlocked && (
                <div className="alert alert-danger border-0 shadow-sm mb-4 rounded-4 p-4 d-flex align-items-center">
                    <div className="me-3 bg-danger bg-opacity-10 p-3 rounded-circle text-danger">
                        <AlertCircle size={24}/>
                    </div>
                    <div>
                        <h5 className="fw-bold mb-1">Acesso Bloqueado</h5>
                        <p className="mb-0 text-muted">Seu período de avaliação terminou ou há faturas pendentes.
                            Regularize sua situação para retomar o uso completo do sistema.</p>
                    </div>
                </div>
            )}

            {!hasSubscription ? (
                <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
                    <div className="mb-4 text-primary bg-primary-subtle d-inline-flex p-4 rounded-circle mx-auto">
                        <CreditCard size={48}/>
                    </div>
                    <h4 className="fw-bold mb-2">Você ainda não possui uma assinatura ativa</h4>
                    <p className="text-muted mb-4 mx-auto" style={{maxWidth: '400px'}}>
                        Escolha um plano para começar a aproveitar todos os recursos do Easy Maintenance.
                    </p>
                    <button className="btn btn-primary rounded-pill px-5 py-2 fw-bold shadow-sm">
                        Escolher plano
                    </button>
                </div>
            ) : (
                <>
                    {/* Section 1: Subscription Summary */}
                    <div className="row g-4 mb-5">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-primary text-white">
                                <div
                                    className="card-body p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
                                    <div className="d-flex align-items-center gap-4">
                                        <div className="bg-white bg-opacity-20 p-3 rounded-4">
                                            <CheckCircle size={32}/>
                                        </div>
                                        <div>
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <span className="h4 mb-0 fw-bold">Plano Ativo</span>
                                                <span className="badge bg-white text-primary rounded-pill px-2 py-1"
                                                      style={{fontSize: '0.75rem'}}>
                          {summary.subscription?.status}
                        </span>
                                            </div>
                                            <div className="opacity-75 h5 mb-0">
                                                {formatMoney(summary.subscription?.totalCents || 0)} / {summary.subscription?.cycle === 'MONTHLY' ? 'mês' : 'ano'}
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className="bg-white bg-opacity-10 p-3 rounded-4 border border-white border-opacity-10 text-center text-md-end min-w-md-200">
                                        <div className="small opacity-75 mb-1">Próxima cobrança</div>
                                        <div className="h5 mb-0 fw-bold">
                                            {formatDate(summary.subscription?.nextDueDate || "")}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4">
                        {/* Section 2: Subscription Items (Main) */}
                        <div className="col-12 col-lg-8">
                            <div className="mb-3 d-flex justify-content-between align-items-center">
                                <h5 className="fw-bold mb-0">Itens da Assinatura</h5>
                                <span className="badge bg-light text-dark border rounded-pill">
                  {summary.items.length} {summary.items.length === 1 ? 'item' : 'itens'}
                </span>
                            </div>

                            {!hasItems ? (
                                <div className="card border shadow-sm rounded-4 p-5 text-center bg-light bg-opacity-50">
                                    <p className="text-muted mb-0">Nenhum item ativo na sua assinatura.</p>
                                </div>
                            ) : (
                                summary.items.map(item => (
                                    <SubscriptionItemCard
                                        key={item.id}
                                        item={item}
                                        onChangePlan={handleChangePlan}
                                        onCancel={(id) => setItemToCancel(id)}
                                    />
                                ))
                            )}
                        </div>

                        {/* Sections 3 & 4: Sidebar */}
                        <div className="col-12 col-lg-4">
                            <div className="d-flex flex-column gap-4">
                                {/* Section 3: Invoices */}
                                <InvoiceList invoices={summary.invoices} />

                                {/* Section 4: Payment Method */}
                                {hasBillingAccount ? (
                                    <PaymentMethodCard account={summary.billingAccount!}/>
                                ) : (
                                    <div className="card border shadow-sm rounded-4">
                                        <div className="card-header bg-white border-0 py-3 px-4">
                                            <h6 className="mb-0 fw-bold">Método de Pagamento</h6>
                                        </div>
                                        <div className="card-body p-4 pt-0">
                                            <div className="alert alert-info border-0 rounded-4 mb-3 small">
                                                Nenhum método de pagamento cadastrado.
                                            </div>
                                            <button className="btn btn-outline-primary w-100 rounded-pill fw-bold">
                                                Cadastrar um método de pagamento
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {isPlanModalOpen && selectedItem && (
                <PlanChangeDialog
                    show={isPlanModalOpen}
                    onClose={() => {
                        setIsPlanModalOpen(false);
                        setSelectedItem(null);
                    }}
                    onSuccess={fetchSummary}
                    itemId={selectedItem.id}
                    currentPlanCode={selectedItem.planCode}
                />
            )}

            <ConfirmModal
                show={!!itemToCancel}
                title="Cancelar Item da Assinatura"
                message="Tem certeza que deseja cancelar este item da assinatura? Esta ação removerá o acesso aos recursos relacionados a este item ao final do período vigente."
                confirmLabel="Confirmar Cancelamento"
                cancelLabel="Manter Item"
                loading={cancelLoading}
                onConfirm={() => itemToCancel && handleCancelItem(itemToCancel)}
                onCancel={() => !cancelLoading && setItemToCancel(null)}
            />

            <style jsx>{`
                .bg-success-subtle {
                    background-color: #d1e7dd;
                }

                .bg-danger-subtle {
                    background-color: #f8d7da;
                }

                .bg-warning-subtle {
                    background-color: #fff3cd;
                }

                .bg-info-subtle {
                    background-color: #cff4fc;
                }

                .bg-primary-subtle {
                    background-color: #cfe2ff;
                }

                .bg-secondary-subtle {
                    background-color: #e2e3e5;
                }

                .fw-mono {
                    font-family: var(--bs-font-monospace);
                }

                .min-w-md-200 {
                    min-width: 200px;
                }
            `}</style>
        </div>
    );
}
