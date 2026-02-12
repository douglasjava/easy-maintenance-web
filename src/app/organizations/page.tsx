"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import { Building, Plus, Search, ArrowRight } from "lucide-react";
import Link from "next/link";

type OrganizationItem = {
  organization: {
    id: string;
    code: string;
    name: string;
    city: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    state: string;
    zipCode: string;
    doc: string;
  };
  subscription: {
    id: number;
    organizationId: number;
    organizationCode: string;
    organizationName: string;
    payerUserId: number;
    payerEmail: string;
    planCode: string;
    planName: string;
    priceCents: number;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    createdAt: string;
    updatedAt: string;
  };
};

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const userId = window.sessionStorage.getItem("userId") || window.localStorage.getItem("userId");
        if (!userId) return;

        const { data } = await api.get(`/auth/me/organizations/${userId}`);
        setOrganizations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro ao carregar organizações:", err);
        toast.error("Erro ao carregar lista de empresas.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrganizations();
  }, []);

  const filteredOrgs = organizations.filter(item => 
    item.organization.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.organization.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="mb-1 fw-bold">Minhas Empresas</h2>
          <p className="text-muted mb-0">Gerencie e alterne entre as organizações que você tem acesso</p>
        </div>
        <Link href="/organizations/new" className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-3 shadow-sm">
          <Plus size={20} />
          Nova Empresa
        </Link>
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-3">
          <div className="input-group border rounded-3 overflow-hidden bg-light">
            <span className="input-group-text bg-transparent border-0 pe-0">
              <Search size={18} className="text-muted" />
            </span>
            <input 
              type="text" 
              className="form-control bg-transparent border-0 shadow-none ps-2" 
              placeholder="Buscar por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      ) : filteredOrgs.length > 0 ? (
        <div className="row g-3">
          {filteredOrgs.map((item) => (
            <div key={item.organization.id} className="col-12 col-md-6 col-xl-4">
              <div className="card border-0 shadow-sm h-100 rounded-4 card-hover transition-all">
                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div className="bg-light p-3 rounded-3 text-primary">
                      <Building size={24} />
                    </div>
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-2">
                      {item.subscription.planCode || "FREE"}
                    </span>
                  </div>
                  <h5 className="fw-bold mb-1">{item.organization.name}</h5>
                  
                  <div className="mt-auto pt-3 border-top d-flex align-items-center justify-content-between">
                    <span className="text-muted small">Status: <span className="text-success fw-medium">{item.subscription.status}</span></span>
                    <Link 
                      href={`/organizations/${item.organization.code}`}
                      className="btn btn-link text-primary p-0 d-flex align-items-center gap-1 text-decoration-none fw-medium"
                    >
                      Acessar <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm border">
          <Building size={48} className="text-muted mb-3 opacity-25" />
          <h5>Nenhuma empresa encontrada</h5>
          <p className="text-muted">Tente ajustar sua busca ou cadastre uma nova empresa.</p>
        </div>
      )}

      <style jsx>{`
        .card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important;
        }
        .transition-all {
          transition: all 0.3s ease;
        }
        .bg-primary-subtle {
          background-color: #e7f0fe;
        }
      `}</style>
    </div>
  );
}
