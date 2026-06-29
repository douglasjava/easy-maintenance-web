"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/apiClient";
import { useAccessContext } from "@/providers/AccessContextProvider";
import toast from "react-hot-toast";

const ROLE_OPTIONS = [
  { value: "READER",  label: "Leitor — acesso de leitura" },
  { value: "TECH",    label: "Técnico — pode registrar manutenções" },
  { value: "SYNDIC",  label: "Síndico — pode gerenciar itens e normas" },
];

type OrgInfo = { code: string; name: string };
type Member = {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
  organizations: OrgInfo[];
};

export default function EditUserPage() {
  const router   = useRouter();
  const params   = useParams();
  const memberId = Number(params?.id);

  const { accessContext } = useAccessContext();

  const [member, setMember]           = useState<Member | null>(null);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [notFound, setNotFound]       = useState(false);
  const [fetchError, setFetchError]   = useState(false);
  const [guardChecked, setGuardChecked] = useState(false);
  const [isSelf, setIsSelf]           = useState(false);
  const [selectedOrgs, setSelectedOrgs] = useState<Set<string>>(new Set());
  const [name, setName]               = useState("");
  const [role, setRole]               = useState("READER");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const userRole = window.localStorage.getItem("userRole") || window.sessionStorage.getItem("userRole");
    if (userRole !== "ADMIN") {
      router.replace("/");
      return;
    }
    const userId = window.localStorage.getItem("userId") || window.sessionStorage.getItem("userId");
    setIsSelf(Number(userId) === memberId);
    setGuardChecked(true);
  }, [router, memberId]);

  const fetchMember = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const { data } = await api.get("/me/team/users");
      const found: Member | undefined = Array.isArray(data)
        ? data.find((m: Member) => m.id === memberId)
        : undefined;

      if (!found) {
        setNotFound(true);
        return;
      }

      setMember(found);
      setName(found.name);
      setRole(found.role);
      setSelectedOrgs(new Set(found.organizations.map((o) => o.code)));
    } catch {
      setFetchError(true);
      toast.error("Erro ao carregar dados do membro.");
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    if (!guardChecked) return;
    fetchMember();
  }, [guardChecked, fetchMember]);

  const orgs = accessContext?.organizationsAccess ?? [];

  function toggleOrg(code: string) {
    if (isSelf) return;
    setSelectedOrgs((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selectedOrgs.size === 0) {
      toast.error("Selecione ao menos uma organização.");
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/me/team/users/${memberId}`, {
        name,
        role,
        orgCodes: Array.from(selectedOrgs),
      });
      toast.success("Membro atualizado com sucesso.");
      router.push("/users");
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      toast.error(detail || "Erro ao salvar alterações. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  if (!guardChecked) return null;

  // Loading
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  // Not found
  if (notFound) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning d-flex align-items-center gap-2">
          Membro não encontrado na sua equipe.{" "}
          <Link href="/users" className="alert-link">← Voltar para equipe</Link>
        </div>
      </div>
    );
  }

  // Fetch error
  if (fetchError) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger d-flex align-items-center gap-2">
          Não foi possível carregar os dados.{" "}
          <button className="btn btn-link p-0 align-baseline" onClick={fetchMember}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="container py-4">
      {/* Cabeçalho */}
      <div className="d-flex flex-column flex-md-row align-items-md-start justify-content-between gap-3 mb-4">
        <div>
          <h2 className="mb-1 fw-bold">Editar membro</h2>
          <p className="text-muted mb-0">{member?.email}</p>
        </div>
        <Link href="/users" className="btn btn-outline-secondary" style={{ width: "fit-content" }}>
          ← Voltar
        </Link>
      </div>

      {/* Aviso: dono tentando editar a si mesmo */}
      {isSelf && (
        <div className="alert alert-warning mb-4">
          Você não pode editar sua própria conta por aqui. Para alterar seus dados, acesse{" "}
          <Link href="/profile" className="alert-link">Minha conta</Link>.
        </div>
      )}

      {/* Formulário */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <form onSubmit={onSubmit}>
            {/* Dados básicos */}
            <div className="mb-4">
              <h6 className="fw-semibold mb-3 text-secondary text-uppercase small">
                Dados do membro
              </h6>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">Nome <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isSelf}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">E-mail</label>
                  <input
                    type="email"
                    className="form-control bg-light"
                    value={member?.email ?? ""}
                    readOnly
                    disabled
                  />
                  <div className="form-text">O e-mail não pode ser alterado.</div>
                </div>
              </div>
            </div>

            {/* Perfil */}
            <div className="mb-4">
              <h6 className="fw-semibold mb-3 text-secondary text-uppercase small">
                Perfil de acesso
              </h6>
              <div className="col-12 col-md-4">
                <label className="form-label">Perfil (Role) <span className="text-danger">*</span></label>
                <select
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  disabled={isSelf}
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Organizações */}
            <div className="mb-4">
              <h6 className="fw-semibold mb-1 text-secondary text-uppercase small">
                Organizações vinculadas <span className="text-danger">*</span>
              </h6>
              <p className="text-muted small mb-3">
                Marque as organizações que este membro poderá acessar. Desmarcar remove o acesso.
              </p>

              {orgs.length === 0 ? (
                <p className="text-muted fst-italic">Nenhuma organização disponível.</p>
              ) : (
                <div className="row g-2">
                  {orgs.map((org) => (
                    <div key={org.organizationCode} className="col-12 col-sm-6 col-lg-4">
                      <div
                        className={`form-check border rounded-3 p-3 ${
                          selectedOrgs.has(org.organizationCode)
                            ? "border-primary bg-primary bg-opacity-10"
                            : "border-light"
                        }`}
                        onClick={() => toggleOrg(org.organizationCode)}
                        style={{ cursor: isSelf ? "not-allowed" : "pointer" }}
                      >
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedOrgs.has(org.organizationCode)}
                          onChange={() => toggleOrg(org.organizationCode)}
                          disabled={isSelf}
                          readOnly
                        />
                        <label
                          className="form-check-label ms-2 fw-medium"
                          style={{ cursor: "inherit" }}
                        >
                          {org.organizationName}
                        </label>
                        <div className="text-muted small ms-2">{org.organizationCode}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isSelf && selectedOrgs.size === 0 && (
                <div className="mt-2 small text-danger">
                  Selecione ao menos uma organização.
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="d-flex flex-wrap gap-2 pt-2 border-top">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving || isSelf || selectedOrgs.size === 0}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Salvando...
                  </>
                ) : "Salvar alterações"}
              </button>
              <Link href="/users" className="btn btn-outline-secondary">
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
