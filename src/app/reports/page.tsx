"use client";

import { useState } from "react";
import { BarChart2, Building2, Wrench, FileText } from "lucide-react";

type Tab = "overview" | "maintenances";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <div
          className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: 56, height: 56 }}
        >
          <BarChart2 size={28} />
        </div>
        <div>
          <h2 className="mb-0 fw-bold">Relatórios</h2>
          <p className="text-muted mb-0 small">
            Visão consolidada de todas as suas empresas
          </p>
        </div>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link d-flex align-items-center gap-1 ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <Building2 size={16} />
            Visão Geral
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link d-flex align-items-center gap-1 ${activeTab === "maintenances" ? "active" : ""}`}
            onClick={() => setActiveTab("maintenances")}
          >
            <Wrench size={16} />
            Manutenções
          </button>
        </li>
      </ul>

      {activeTab === "overview" && <OverviewPlaceholder />}
      {activeTab === "maintenances" && <MaintenancesPlaceholder />}
    </div>
  );
}

function OverviewPlaceholder() {
  return (
    <div>
      <div className="row g-3 mb-4">
        {[
          "Total de Itens",
          "Em Atraso",
          "Vencem em Breve",
          "Manutenções este Mês",
        ].map((label) => (
          <div key={label} className="col-6 col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 placeholder-glow">
              <div className="small text-muted mb-1">{label}</div>
              <span className="placeholder col-4 rounded" style={{ height: 32 }} />
            </div>
          </div>
        ))}
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-white border-bottom py-3 d-flex align-items-center gap-2">
          <BarChart2 size={18} className="text-primary" />
          <span className="fw-semibold">Por Empresa</span>
        </div>
        <div className="card-body text-center py-5 text-muted placeholder-glow">
          <Building2 size={40} className="mb-3 opacity-25" />
          <p className="mb-0">Carregando dados das empresas…</p>
        </div>
      </div>
    </div>
  );
}

function MaintenancesPlaceholder() {
  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-header bg-white border-bottom py-3 d-flex align-items-center gap-2">
        <FileText size={18} className="text-primary" />
        <span className="fw-semibold">Manutenções Cross-Org</span>
      </div>
      <div className="card-body text-center py-5 text-muted">
        <Wrench size={40} className="mb-3 opacity-25" />
        <p className="mb-0">Filtros e listagem de manutenções em breve</p>
      </div>
    </div>
  );
}
