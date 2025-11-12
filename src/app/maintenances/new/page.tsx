"use client";
import { useState } from "react";
import { api } from "@/lib/apiClient";

export default function NewMaintenancePage() {
    const [itemId, setItemId] = useState("");
    const [performedAt, setPerformedAt] = useState("");
    const [msg, setMsg] = useState("");

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMsg("");
        try {
            const body = { performedAt, issuedBy: "Empresa X", certificateNumber: null, certificateValidUntil: null, receiptUrl: null };
            const { data } = await api.post(`/api/items/${itemId}/maintenances`, body);
            setMsg(`Registrado: ${data.id}`);
        } catch {
            setMsg("Erro ao registrar.");
        }
    }

    return (
        <section>
            <h1 className="h1">Registrar Manutenção</h1>
            <div className="card">
                <form onSubmit={onSubmit} className="form">
                    <div className="form-field">
                        <label className="label">Item ID</label>
                        <input className="input" value={itemId} onChange={e=>setItemId(e.target.value)} placeholder="Ex.: 3f1a..." required />
                    </div>
                    <div className="form-field">
                        <label className="label">Data da manutenção</label>
                        <input className="input" type="date" value={performedAt} onChange={e=>setPerformedAt(e.target.value)} required />
                    </div>
                    <div className="form-actions">
                        <button className="btn primary">Registrar</button>
                    </div>
                    {msg && <p className="text-sm">{msg}</p>}
                </form>
            </div>
        </section>
    );
}
