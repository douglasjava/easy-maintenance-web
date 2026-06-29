"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import { useAccessContext } from "@/providers/AccessContextProvider";
import { useCurrentOrganizationAccess } from "@/hooks/useAccessControl";
import UsageMeter from "@/components/UsageMeter";
import toast from "react-hot-toast";

const ROLE_OPTIONS = [
  { value: "READER",  label: "Leitor — acesso de leitura" },
  { value: "TECH",    label: "Técnico — pode registrar manutenções" },
  { value: "SYNDIC",  label: "Síndico — pode gerenciar itens e normas" },
];

export default function NewUserPage() {
  const router = useRouter();
  const { accessContext } = useAccessContext();
  const { features, organization } = useCurrentOrganizationAccess();

  const [loading, setLoading]           = useState(false);
  const [guardChecked, setGuardChecked] = useState(false);
  const [selectedOrgs, setSelectedOrgs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const role = window.localStorage.getItem("userRole") || window.sessionStorage.getItem("userRole");
    if (role !== "ADMIN") {
      router.replace("/");
      return;
    }
    setGuardChecked(true);
  }, [router]);

  const orgs = accessContext?.organizationsAccess ?? [];
  const currentUsers = organization?.currentUsage?.currentUsers ?? 0;
  const maxUsers = features?.maxUsers ?? 0;
  const atLimit = maxUsers > 0 && currentUsers >= maxUsers;

  function toggleOrg(code: string) {
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

    const form = new FormData(e.currentTarget);
    const payload = {
      email:    String(form.get("email")).trim(),
      name:     String(form.get("name")).trim(),
      role:     String(form.get("role")),
      orgCodes: Array.from(selectedOrgs),
    };

    if (!payload.email || !payload.name) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/me/team/users", payload);
      toast.success(
        `Convite enviado! ${data?.name ?? payload.name} receberá um e-mail com as instruções de primeiro acesso.`
      );
      router.push("/users");
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      toast.error(detail || "Erro ao enviar convite. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (!guardChecked) return null;

  return (
    <section className="container py-4">
      {/* Cabeçalho */}
      <div className="d-flex flex-column flex-md-row align-items-md-start justify-content-between gap-3 mb-4">
        <div>
          <h2 className="mb-1 fw-bold">Convidar membro</h2>
          <p className="text-muted mb-0">
            O membro receberá um e-mail com instruções de primeiro acesso.
          </p>
        </div>
        <div className="d-flex flex-column align-items-md-end gap-2">
          <Link href="/users" className="btn btn-outline-secondary">
            ← Voltar
          </Link>
          {features && maxUsers > 0 && organization?.currentUsage != null && (
            <UsageMeter
              label="Membros da equipe"
              current={currentUsers}
              max={maxUsers}
              upgradeHref="/billing"
            />
          )}
        </div>
      </div>

      {atLimit && (
        <div className="alert alert-warning mb-4">
          Você atingiu o limite de <strong>{maxUsers} membros</strong> do seu plano.{" "}
          <Link href="/billing" className="alert-link">Faça upgrade</Link> para convidar mais.
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
                  <label className="form-label">E-mail <span className="text-danger">*</span></label>
                  <input
                    name="email"
                    type="email"
                    className="form-control"
                    placeholder="email@empresa.com"
                    required
                    disabled={atLimit}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Nome <span className="text-danger">*</span></label>
                  <input
                    name="name"
                    className="form-control"
                    placeholder="Nome completo"
                    required
                    disabled={atLimit}
                  />
                </div>
              </div>
            </div>

            {/* Perfil de acesso */}
            <div className="mb-4">
              <h6 className="fw-semibold mb-3 text-secondary text-uppercase small">
                Perfil de acesso
              </h6>
              <div className="col-12 col-md-4">
                <label className="form-label">Perfil (Role) <span className="text-danger">*</span></label>
                <select name="role" className="form-select" defaultValue="READER" required disabled={atLimit}>
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
                Selecione as organizações que este membro poderá acessar.
              </p>

              {orgs.length === 0 ? (
                <p className="text-muted fst-italic">Nenhuma organização disponível.</p>
              ) : (
                <div className="row g-2">
                  {orgs.map((org) => (
                    <div key={org.organizationCode} className="col-12 col-sm-6 col-lg-4">
                      <div
                        className={`form-check border rounded-3 p-3 cursor-pointer ${
                          selectedOrgs.has(org.organizationCode) ? "border-primary bg-primary bg-opacity-10" : "border-light"
                        }`}
                        onClick={() => !atLimit && toggleOrg(org.organizationCode)}
                        style={{ cursor: atLimit ? "not-allowed" : "pointer" }}
                      >
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedOrgs.has(org.organizationCode)}
                          onChange={() => !atLimit && toggleOrg(org.organizationCode)}
                          disabled={atLimit}
                          readOnly
                        />
                        <label className="form-check-label ms-2 fw-medium" style={{ cursor: "inherit" }}>
                          {org.organizationName}
                        </label>
                        <div className="text-muted small ms-2">{org.organizationCode}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedOrgs.size === 0 && (
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
                disabled={loading || atLimit || selectedOrgs.size === 0}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Enviando convite...
                  </>
                ) : "Enviar convite"}
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
