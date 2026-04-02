import React, {useState, useEffect} from "react";
import {createPortal} from "react-dom";
import {api} from "@/lib/apiClient";
import toast from "react-hot-toast";
import {PlanCard, Plan} from "./PlanCard";

interface PlanChangeDialogProps {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
    itemId: number;
    currentPlanCode: string;
    isAdmin?: boolean;
    idUser?: number;
}

export default function PlanChangeDialog({
                                             show,
                                             onClose,
                                             onSuccess,
                                             itemId,
                                             currentPlanCode,
                                             isAdmin = false,
                                             idUser,
                                         }: PlanChangeDialogProps) {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [applyImmediately, setApplyImmediately] = useState(true);
    const [loading, setLoading] = useState<string | null>(null);
    const [fetchingPlans, setFetchingPlans] = useState(false);
    const [selectedPlanCode, setSelectedPlanCode] = useState<string | null>(null);

    useEffect(() => {
        if (show) {
            fetchPlans();
        }
    }, [show]);

    async function fetchPlans() {
        try {
            setFetchingPlans(true);
            const res = await api.get("/private/admin/billing/plans");
            // Map API Plan to the Plan interface used in the dialog
            const mappedPlans = res.data.map((p: any) => ({
                code: p.code,
                name: p.name,
                price: p.priceCents / 100,
                description: p.description || "",
                features: Array.isArray(p.features) ? p.features : []
            }));
            setPlans(mappedPlans);
        } catch (err) {
            console.error("Error fetching plans", err);
            toast.error("Erro ao carregar planos");
        } finally {
            setFetchingPlans(false);
        }
    }

    useEffect(() => {
        if (show) {
            document.body.classList.add("modal-open");
        } else {
            document.body.classList.remove("modal-open");
        }

        return () => {
            document.body.classList.remove("modal-open");
        };
    }, [show]);

    useEffect(() => {
        function handleEsc(e: KeyboardEvent) {
            if (e.key === "Escape" && !loading && show) {
                onClose();
            }
        }

        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [loading, show, onClose]);

    function handleSelectPlan(planCode: string) {
        if (planCode === selectedPlanCode) {
            setSelectedPlanCode(null);
        } else {
            setSelectedPlanCode(planCode);
        }
    }

    async function handleConfirm(planCode: string) {
        try {
            setLoading(planCode);

            const url = isAdmin
                ? `/private/admin/billing/subscription-items/${itemId}/change-plan`
                : `/billing/subscription-items/${itemId}/change-plan`;

            const headers: Record<string, any> = {};
            if (isAdmin) {
                const adminToken = window.localStorage.getItem("adminToken");
                if (adminToken) headers["X-Admin-Token"] = adminToken;
                if (idUser) headers["X-id-User"] = idUser;
            }

            await api.post(url, {
                newPlanCode: planCode,
                applyImmediately
            }, {headers});

            toast.success(
                applyImmediately
                    ? "Plano alterado com sucesso!"
                    : "Alteração agendada para o próximo ciclo."
            );

            setSelectedPlanCode(null);
            onSuccess();
            onClose();

            // Scroll to invoice section after success
            setTimeout(() => {
                document
                    .getElementById("invoice-section")
                    ?.scrollIntoView({behavior: "smooth"});
            }, 300);
        } catch (err) {
            console.error("Erro ao alterar plano", err);
            toast.error("Erro ao alterar plano");
        } finally {
            setLoading(null);
        }
    }

    if (!show) return null;

    return createPortal(
        <>
            <div className="modal fade show d-block" tabIndex={-1} style={{zIndex: 1055}}>
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content border-0 shadow rounded-4 overflow-hidden">
                        <div className="modal-header border-0 bg-light p-4">
                            <div>
                                <h5 className="modal-title fw-bold">Escolha o plano ideal</h5>
                                <p className="text-muted small mb-0">Você pode alterar seu plano a qualquer momento.</p>
                            </div>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onClose}
                                disabled={!!loading}
                            />
                        </div>

                        <div className="modal-body p-4" style={{maxHeight: '70vh', overflowY: 'auto'}}>
                            {fetchingPlans ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Carregando planos...</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4 bg-white p-3 rounded-4 border">
                                        <label
                                            className="form-label fw-bold small text-muted text-uppercase mb-3 d-block">
                                            Quando aplicar a mudança?
                                        </label>
                                        <div className="d-flex gap-4">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="applyMode"
                                                    id="applyNow"
                                                    checked={applyImmediately}
                                                    onChange={() => setApplyImmediately(true)}
                                                    disabled={!!loading}
                                                />
                                                <label className="form-check-label small fw-medium" htmlFor="applyNow">
                                                    Aplicar imediatamente
                                                </label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="applyMode"
                                                    id="applyNext"
                                                    checked={!applyImmediately}
                                                    onChange={() => setApplyImmediately(false)}
                                                    disabled={!!loading}
                                                />
                                                <label className="form-check-label small fw-medium" htmlFor="applyNext">
                                                    Aplicar no próximo ciclo
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="d-flex flex-column gap-2">
                                        {plans.map((plan) => (
                                            <PlanCard
                                                key={plan.code}
                                                plan={plan}
                                                isCurrent={plan.code === currentPlanCode}
                                                isLoading={loading === plan.code}
                                                onSelect={handleSelectPlan}
                                                selectedPlanCode={selectedPlanCode}
                                                setSelectedPlanCode={setSelectedPlanCode}
                                                applyImmediately={applyImmediately}
                                                onConfirm={handleConfirm}
                                                loading={loading}
                                            />
                                        ))}
                                        {plans.length === 0 && (
                                            <div className="text-center py-4 text-muted">
                                                Nenhum plano disponível para troca.
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="modal-backdrop fade show"
                onClick={() => !loading && onClose()}
                style={{zIndex: 1050}}
            />
        </>,
        document.body
    );
}
