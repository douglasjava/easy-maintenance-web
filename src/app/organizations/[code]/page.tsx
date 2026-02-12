"use client";

import { useState, useEffect, use } from "react";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import { Building, ArrowLeft, Calendar, CreditCard, MapPin, Hash, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function OrganizationDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const [data, setData] = useState<OrganizationItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const userId = window.sessionStorage.getItem("userId") || window.localStorage.getItem("userId");
        if (!userId) {
          router.push("/login");
          return;
        }

        const response = await api.get(`/auth/me/organizations/${userId}`);
        const orgs = Array.isArray(response.data) ? response.data : [];
        const found = orgs.find((item: OrganizationItem) => item.organization.code === code);

        if (found) {
          setData(found);
        } else {
          toast.error("Organização não encontrada.");
          router.push("/organizations");
        }
      } catch (err) {
        console.error("Erro ao carregar detalhes:", err);
        toast.error("Erro ao carregar os dados da empresa.");
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [code, router]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAccess = () => {
    if (data) {
      window.localStorage.setItem("organizationCode", data.organization.code);
      window.localStorage.setItem("organizationName", data.organization.name);
      router.push("/");
      // Em alguns casos o reload é necessário se o estado global não reagir ao localStorage
      setTimeout(() => window.location.reload(), 100);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { organization: org, subscription: sub } = data;

  return (
    <div className="container py-4">
      <div className="mb-4">
        <Link href="/organizations" className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-2 text-muted mb-3">
          <ArrowLeft size={18} />
          Voltar para a lista
        </Link>
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <h2 className="mb-1 fw-bold">{org.name}</h2>
            <p className="text-muted mb-0">Detalhes completos da organização e assinatura</p>
          </div>
          <button onClick={handleAccess} className="btn btn-primary px-4 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2">
            Selecionar e Acessar
            <CheckCircle size={20} />
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Dados da Organização */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-0 pt-4 px-4">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <Building className="text-primary" size={22} />
                Dados da Empresa
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="text-muted small d-block mb-1">Nome Fantasia</label>
                  <div className="fw-medium">{org.name}</div>
                </div>
                <div className="col-md-6">
                  <label className="text-muted small d-block mb-1">CNPJ/CPF</label>
                  <div className="fw-medium">{org.doc || "-"}</div>
                </div>
                <div className="col-md-6">
                  <label className="text-muted small d-block mb-1">Código Identificador</label>
                  <div className="fw-medium text-primary">{org.code}</div>
                </div>
                <div className="col-md-6">
                  <label className="text-muted small d-block mb-1">ID Interno</label>
                  <div className="fw-medium">{org.id}</div>
                </div>
                
                <div className="col-12">
                  <hr className="my-2 opacity-10" />
                </div>

                <div className="col-12">
                  <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <MapPin className="text-primary" size={18} />
                    Endereço
                  </h6>
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="text-muted small d-block mb-1">Logradouro</label>
                      <div className="fw-medium">{org.street || "-"}</div>
                    </div>
                    <div className="col-md-4">
                      <label className="text-muted small d-block mb-1">Número</label>
                      <div className="fw-medium">{org.number || "-"}</div>
                    </div>
                    <div className="col-md-6">
                      <label className="text-muted small d-block mb-1">Complemento</label>
                      <div className="fw-medium">{org.complement || "-"}</div>
                    </div>
                    <div className="col-md-6">
                      <label className="text-muted small d-block mb-1">Bairro</label>
                      <div className="fw-medium">{org.neighborhood || "-"}</div>
                    </div>
                    <div className="col-md-6">
                      <label className="text-muted small d-block mb-1">Cidade</label>
                      <div className="fw-medium">{org.city || "-"}</div>
                    </div>
                    <div className="col-md-2">
                      <label className="text-muted small d-block mb-1">UF</label>
                      <div className="fw-medium">{org.state || "-"}</div>
                    </div>
                    <div className="col-md-4">
                      <label className="text-muted small d-block mb-1">CEP</label>
                      <div className="fw-medium">{org.zipCode || "-"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assinatura */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-0 pt-4 px-4">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <CreditCard className="text-primary" size={22} />
                Assinatura e Plano
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="bg-light p-3 rounded-4 mb-4 d-flex align-items-center justify-content-between">
                <div>
                  <label className="text-muted small d-block mb-1">Plano Atual</label>
                  <div className="h4 fw-bold mb-0 text-primary">{sub.planName}</div>
                </div>
                <span className={`badge ${sub.status === "ACTIVE" ? "bg-success" : "bg-danger"} rounded-pill px-3 py-2`}>
                  {sub.status}
                </span>
              </div>

              <div className="row g-4">
                <div className="col-6">
                  <label className="text-muted small d-block mb-1">Valor</label>
                  <div className="fw-medium">{formatCurrency(sub.priceCents)}</div>
                </div>
                <div className="col-6">
                  <label className="text-muted small d-block mb-1">Código do Plano</label>
                  <div className="fw-medium">{sub.planCode}</div>
                </div>
                
                <div className="col-12">
                  <hr className="my-2 opacity-10" />
                </div>

                <div className="col-12">
                  <div className="d-flex align-items-start gap-3 mb-3">
                    <Calendar size={20} className="text-muted mt-1" />
                    <div>
                      <label className="text-muted small d-block">Período Atual</label>
                      <div className="fw-medium">
                        {new Date(sub.currentPeriodStart).toLocaleDateString("pt-BR")} até {new Date(sub.currentPeriodEnd).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3 mb-3">
                    <Hash size={20} className="text-muted mt-1" />
                    <div>
                      <label className="text-muted small d-block">ID da Assinatura</label>
                      <div className="fw-medium">{sub.id}</div>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3 mb-3">
                    {sub.cancelAtPeriodEnd ? (
                      <XCircle size={20} className="text-danger mt-1" />
                    ) : (
                      <CheckCircle size={20} className="text-success mt-1" />
                    )}
                    <div>
                      <label className="text-muted small d-block">Renovação Automática</label>
                      <div className="fw-medium">{sub.cancelAtPeriodEnd ? "Cancelamento agendado" : "Ativa"}</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-top">
                    <label className="text-muted small d-block mb-1">Pagador</label>
                    <div className="fw-medium">{sub.payerEmail}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-muted x-small mt-2">
                  Criado em: {formatDate(sub.createdAt)}<br />
                  Atualizado em: {formatDate(sub.updatedAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .x-small {
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
}
