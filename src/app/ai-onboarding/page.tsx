"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import { 
    CompanyType, 
    COMPANY_TYPE_MAP, 
    AiItemPreview, 
    AiBootstrapPreviewResponse 
} from "@/types/ai-onboarding";

const COLORS = {
    primary: "#0B5ED7",
    primaryDark: "#083B7A",
    accent: "#F59E0B",
    bg: "#F3F4F6",
    white: "#FFFFFF",
};

interface SelectedItem extends AiItemPreview {
    selected: boolean;
    localId: string;
}

export default function AiOnboardingPage() {
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);
    
    // Form Passo 1
    const [companyType, setCompanyType] = useState<CompanyType>("CONDOMINIUM");
    const [description, setDescription] = useState("");

    // Estado Passo 2
    const [items, setItems] = useState<SelectedItem[]>([]);
    const [editingItem, setEditingItem] = useState<SelectedItem | null>(null);

    async function handleGenerate() {
        setLoading(true);
        try {
            const payload = {
                companyType: companyType, // Envia a chave (ex: CONDOMINIUM)
                description
            };
            const { data } = await api.post<AiBootstrapPreviewResponse>("/ai/bootstrap/preview", payload);

            if (!data.usedAi) {
                toast.error("A IA não conseguiu gerar sugestões para este contexto.");
                return;
            }

            const itemsWithMeta = data.items.map((it, idx) => ({
                ...it,
                selected: true,
                localId: `${Date.now()}-${idx}`
            }));

            setItems(itemsWithMeta);
            setStep(2);
        } catch (err: any) {
            toast.error("Falha ao gerar pré-cadastros. Tente novamente.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function toggleSelect(localId: string) {
        setItems(prev => prev.map(it => 
            it.localId === localId ? { ...it, selected: !it.selected } : it
        ));
    }

    function removeItem(localId: string) {
        setItems(prev => prev.filter(it => it.localId !== localId));
    }

    function handleEdit(item: SelectedItem) {
        setEditingItem(item);
    }

    function saveEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editingItem) return;

        if (editingItem.maintenance.periodQty < 1 || editingItem.maintenance.toleranceDays < 0) {
            toast.error("Periodicidade deve ser >= 1 e Tolerância >= 0.");
            return;
        }

        setItems(prev => prev.map(it => 
            it.localId === editingItem.localId ? editingItem : it
        ));
        setEditingItem(null);
        toast.success("Item atualizado localmente.");
    }

    function handleApply() {
        const selectedItems = items.filter(it => it.selected);
        console.log("Itens selecionados para aplicação futura:", selectedItems);
        toast.success("Itens logados no console!");
    }

    return (
        <section style={{ backgroundColor: COLORS.bg, minHeight: "100vh" }} className="p-3">
            <div className="container" style={{ maxWidth: "900px" }}>
                {/* TOPO */}
                <div className="text-center mb-4">
                    <h1 className="h3" style={{ color: COLORS.primaryDark }}>
                        Onboarding Assistido por IA
                    </h1>
                    <p className="text-muted">
                        Configure sua organização rapidamente com sugestões inteligentes
                    </p>
                </div>

                {step === 1 && (
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-4">
                            <h5 className="card-title mb-4">Passo 1: Contexto da Empresa</h5>
                            
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Tipo de Empresa</label>
                                <select 
                                    className="form-select"
                                    value={companyType}
                                    onChange={(e) => setCompanyType(e.target.value as CompanyType)}
                                >
                                    {Object.entries(COMPANY_TYPE_MAP).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-semibold">Descrição da estrutura (opcional)</label>
                                <textarea 
                                    className="form-control"
                                    rows={4}
                                    placeholder="Ex: Condomínio com 2 torres, 3 elevadores, piscina e gerador..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                                <div className="form-text">
                                    Quanto mais detalhes, melhor será a sugestão da IA.
                                </div>
                            </div>

                            <div className="d-grid">
                                <button 
                                    className="btn btn-primary btn-lg"
                                    onClick={handleGenerate}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Gerando pré-cadastros...
                                        </>
                                    ) : (
                                        "Gerar pré-cadastros com IA"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="card-title m-0">Passo 2: Preview dos itens</h5>
                                <span className="badge rounded-pill bg-info text-dark" style={{ fontSize: "0.85rem" }}>
                                    ✨ Gerado por IA
                                </span>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th style={{ width: "40px" }}></th>
                                            <th>Item</th>
                                            <th>Categoria</th>
                                            <th>Criticidade</th>
                                            <th>Periodicidade</th>
                                            <th>Norma</th>
                                            <th className="text-end">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((it) => (
                                            <tr key={it.localId}>
                                                <td>
                                                    <input 
                                                        type="checkbox" 
                                                        className="form-check-input"
                                                        checked={it.selected}
                                                        onChange={() => toggleSelect(it.localId)}
                                                    />
                                                </td>
                                                <td>{it.itemType}</td>
                                                <td>{it.category}</td>
                                                <td>
                                                    <span className={`badge ${
                                                        it.criticality === 'ALTA' ? 'bg-danger' : 
                                                        it.criticality === 'MEDIA' ? 'bg-warning' : 'bg-success'
                                                    }`}>
                                                        {it.criticality}
                                                    </span>
                                                </td>
                                                <td>{it.maintenance.periodQty} {it.maintenance.periodUnit}</td>
                                                <td className="small text-muted">{it.maintenance.norm}</td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm">
                                                        <button 
                                                            className="btn btn-outline-primary"
                                                            onClick={() => handleEdit(it)}
                                                        >
                                                            Editar
                                                        </button>
                                                        <button 
                                                            className="btn btn-outline-danger"
                                                            onClick={() => removeItem(it.localId)}
                                                        >
                                                            Remover
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="d-flex justify-content-between mt-4">
                                <button 
                                    className="btn btn-outline-secondary"
                                    onClick={() => setStep(1)}
                                >
                                    Voltar
                                </button>
                                <button 
                                    className="btn btn-success px-5"
                                    onClick={handleApply}
                                    disabled={items.filter(it => it.selected).length === 0}
                                >
                                    Aplicar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Edição Simples (Bootstrap style) */}
            {editingItem && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <form onSubmit={saveEdit}>
                                <div className="modal-header">
                                    <h5 className="modal-title">Editar Manutenção: {editingItem.itemType}</h5>
                                    <button type="button" className="btn-close" onClick={() => setEditingItem(null)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label">Norma</label>
                                            <input 
                                                className="form-control"
                                                value={editingItem.maintenance.norm}
                                                onChange={e => setEditingItem({
                                                    ...editingItem,
                                                    maintenance: { ...editingItem.maintenance, norm: e.target.value }
                                                })}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label">Qtd. Período</label>
                                            <input 
                                                type="number"
                                                className="form-control"
                                                min={1}
                                                value={editingItem.maintenance.periodQty}
                                                onChange={e => setEditingItem({
                                                    ...editingItem,
                                                    maintenance: { ...editingItem.maintenance, periodQty: parseInt(e.target.value) || 0 }
                                                })}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label">Unidade</label>
                                            <input 
                                                className="form-control"
                                                value={editingItem.maintenance.periodUnit}
                                                onChange={e => setEditingItem({
                                                    ...editingItem,
                                                    maintenance: { ...editingItem.maintenance, periodUnit: e.target.value }
                                                })}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">Tolerância (dias)</label>
                                            <input 
                                                type="number"
                                                className="form-control"
                                                min={0}
                                                value={editingItem.maintenance.toleranceDays}
                                                onChange={e => setEditingItem({
                                                    ...editingItem,
                                                    maintenance: { ...editingItem.maintenance, toleranceDays: parseInt(e.target.value) || 0 }
                                                })}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">Notas</label>
                                            <textarea 
                                                className="form-control"
                                                rows={2}
                                                value={editingItem.maintenance.notes}
                                                onChange={e => setEditingItem({
                                                    ...editingItem,
                                                    maintenance: { ...editingItem.maintenance, notes: e.target.value }
                                                })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setEditingItem(null)}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary">Salvar Alterações</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
