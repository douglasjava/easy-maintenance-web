"use client";

import { useState, useEffect, use } from "react";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import { Building, ArrowLeft, MapPin, CheckCircle, Pencil, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type OrganizationInfo = {
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

type OrganizationItem = {
  organization: OrganizationInfo;
};

const EMPTY_EDIT_FORM = {
  name: "", city: "", street: "", number: "", complement: "",
  neighborhood: "", state: "", zipCode: "", doc: "",
};

export default function OrganizationDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const [data, setData] = useState<OrganizationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActiveOrg, setIsActiveOrg] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const userId = window.sessionStorage.getItem("userId") || window.localStorage.getItem("userId");
        if (!userId) {
          router.push("/login");
          return;
        }

        const response = await api.get(`/organizations/me/${userId}`);
        const orgs = Array.isArray(response.data) ? response.data : [];
        const found = orgs.find((item: OrganizationItem) => item.organization.code === code);

        if (found) {
          setData(found);
          const activeOrgCode = window.localStorage.getItem("organizationCode") || window.sessionStorage.getItem("organizationCode");
          setIsActiveOrg(activeOrgCode === found.organization.code);
        } else {
          toast.error("Empresa não encontrada.");
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

  const handleAccess = () => {
    if (data) {
      window.localStorage.setItem("organizationCode", data.organization.code);
      window.localStorage.setItem("organizationName", data.organization.name);
      router.push("/");
      // Em alguns casos o reload é necessário se o estado global não reagir ao localStorage
      setTimeout(() => window.location.reload(), 100);
    }
  };

  // EPIC-014/TASK-119: edição só é permitida para a organização atualmente ativa — o header
  // X-Org-Id enviado pelo apiClient sempre reflete a organização selecionada na sessão, então
  // editar uma organização diferente falharia na validação de tenant do backend.
  function handleStartEdit() {
    if (!data) return;
    const org = data.organization;
    setEditForm({
      name: org.name || "",
      city: org.city || "",
      street: org.street || "",
      number: org.number || "",
      complement: org.complement || "",
      neighborhood: org.neighborhood || "",
      state: org.state || "",
      zipCode: org.zipCode || "",
      doc: org.doc || "",
    });
    setIsEditing(true);
  }

  async function handleSaveEdit() {
    if (!data || saving) return;
    if (!editForm.name.trim()) {
      toast.error("Por favor, preencha o nome da empresa.");
      return;
    }

    try {
      setSaving(true);
      const { data: updated } = await api.patch(`/organizations/${data.organization.id}`, editForm);
      setData({ organization: { ...data.organization, ...updated } });
      toast.success("Dados da empresa atualizados com sucesso!");
      setIsEditing(false);
    } catch (err) {
      console.error("Erro ao atualizar empresa:", err);
      toast.error("Erro ao atualizar os dados da empresa.");
    } finally {
      setSaving(false);
    }
  }

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

  const { organization: org } = data;

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
            <p className="text-muted mb-0">Detalhes da empresa</p>
          </div>
          <button onClick={handleAccess} className="btn btn-primary px-4 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2">
            Selecionar e Acessar
            <CheckCircle size={20} />
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Dados da Organização */}
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-0 pt-4 px-4 d-flex align-items-center justify-content-between">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <Building className="text-primary" size={22} />
                Dados da Empresa
              </h5>
              {isActiveOrg && !isEditing && (
                <button
                  onClick={handleStartEdit}
                  className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
                >
                  <Pencil size={14} />
                  Editar
                </button>
              )}
              {isEditing && (
                <div className="d-flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                    className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                  >
                    <X size={14} />
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                  >
                    <CheckCircle size={14} />
                    {saving ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              )}
            </div>
            <div className="card-body p-4">
              {isEditing ? (
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="text-muted small d-block mb-1">Nome Fantasia</label>
                    <input className="form-control" value={editForm.name}
                      onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))} required />
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small d-block mb-1">CNPJ/CPF</label>
                    <input className="form-control" value={editForm.doc}
                      onChange={(e) => setEditForm(p => ({ ...p, doc: e.target.value.replace(/\D/g, "") }))} />
                  </div>
                  <div className="col-12"><hr className="my-2 opacity-10" /></div>
                  <div className="col-12">
                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                      <MapPin className="text-primary" size={18} />
                      Endereço
                    </h6>
                    <div className="row g-3">
                      <div className="col-md-8">
                        <label className="text-muted small d-block mb-1">Logradouro</label>
                        <input className="form-control" value={editForm.street}
                          onChange={(e) => setEditForm(p => ({ ...p, street: e.target.value }))} />
                      </div>
                      <div className="col-md-4">
                        <label className="text-muted small d-block mb-1">Número</label>
                        <input className="form-control" value={editForm.number}
                          onChange={(e) => setEditForm(p => ({ ...p, number: e.target.value }))} />
                      </div>
                      <div className="col-md-6">
                        <label className="text-muted small d-block mb-1">Complemento</label>
                        <input className="form-control" value={editForm.complement}
                          onChange={(e) => setEditForm(p => ({ ...p, complement: e.target.value }))} />
                      </div>
                      <div className="col-md-6">
                        <label className="text-muted small d-block mb-1">Bairro</label>
                        <input className="form-control" value={editForm.neighborhood}
                          onChange={(e) => setEditForm(p => ({ ...p, neighborhood: e.target.value }))} />
                      </div>
                      <div className="col-md-6">
                        <label className="text-muted small d-block mb-1">Cidade</label>
                        <input className="form-control" value={editForm.city}
                          onChange={(e) => setEditForm(p => ({ ...p, city: e.target.value }))} />
                      </div>
                      <div className="col-md-2">
                        <label className="text-muted small d-block mb-1">UF</label>
                        <input className="form-control" maxLength={2} value={editForm.state}
                          onChange={(e) => setEditForm(p => ({ ...p, state: e.target.value }))} />
                      </div>
                      <div className="col-md-4">
                        <label className="text-muted small d-block mb-1">CEP</label>
                        <input className="form-control" value={editForm.zipCode}
                          onChange={(e) => setEditForm(p => ({ ...p, zipCode: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="text-muted small d-block mb-1">Nome Fantasia</label>
                  <div className="fw-medium">{org.name}</div>
                </div>
                <div className="col-md-6">
                  <label className="text-muted small d-block mb-1">CNPJ/CPF</label>
                  <div className="fw-medium">{org.doc || "-"}</div>
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
