"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import { useCurrentOrganizationAccess } from "@/hooks/useAccessControl";
import UsageMeter from "@/components/UsageMeter";
import { Users, Pencil, Trash2, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

type OrgInfo = { code: string; name: string };

type Member = {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
  organizations: OrgInfo[];
};

function roleBadgeClass(role: string): string {
  switch (role) {
    case "ADMIN":   return "bg-primary text-white";
    case "READER":  return "bg-info bg-opacity-25 text-info-emphasis";
    case "TECH":    return "bg-secondary bg-opacity-25 text-secondary-emphasis";
    case "SYNDIC":  return "bg-warning bg-opacity-25 text-warning-emphasis";
    default:        return "bg-light text-muted";
  }
}

function statusBadgeClass(status: string): string {
  return status === "ACTIVE"
    ? "bg-success bg-opacity-10 text-success"
    : "bg-danger bg-opacity-10 text-danger";
}

export default function UsersPage() {
  const router = useRouter();
  const [members, setMembers]         = useState<Member[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(false);
  const [removing, setRemoving]       = useState<number | null>(null);
  const [guardChecked, setGuardChecked] = useState(false);
  const { features } = useCurrentOrganizationAccess();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const role = window.localStorage.getItem("userRole") || window.sessionStorage.getItem("userRole");
    if (role !== "ADMIN") {
      router.replace("/");
      return;
    }
    setGuardChecked(true);
  }, [router]);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await api.get("/me/team/users");
      setMembers(Array.isArray(data) ? data : []);
    } catch {
      setError(true);
      toast.error("Erro ao carregar equipe.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!guardChecked) return;
    fetchMembers();
  }, [guardChecked, fetchMembers]);

  async function handleRemove(member: Member) {
    if (!window.confirm(`Remover ${member.name} da equipe?`)) return;
    setRemoving(member.id);
    try {
      await api.delete(`/me/team/users/${member.id}`);
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      toast.success(`${member.name} removido da equipe.`);
    } catch {
      toast.error("Erro ao remover membro. Tente novamente.");
    } finally {
      setRemoving(null);
    }
  }

  if (!guardChecked) return null;

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="mb-1 fw-bold">Minha Equipe</h2>
          <p className="text-muted mb-0">Gerencie os membros que acessam suas organizações</p>
        </div>
        <Link
          href="/users/new"
          className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-3 shadow-sm"
          style={{ width: "fit-content" }}
        >
          <UserPlus size={18} />
          Convidar membro
        </Link>
      </div>

      {/* UsageMeter */}
      {features && features.maxUsers > 0 && (
        <div className="mb-4 p-3 bg-white rounded-4 shadow-sm border" style={{ maxWidth: 280 }}>
          <UsageMeter
            label="Membros da equipe"
            current={members.length}
            max={features.maxUsers}
            upgradeHref="/billing"
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          Não foi possível carregar a equipe.{" "}
          <button className="btn btn-link p-0 align-baseline" onClick={fetchMembers}>
            Tentar novamente
          </button>
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm border">
          <Users size={48} className="text-muted mb-3 opacity-25" />
          <h5 className="mb-1">Nenhum membro na equipe</h5>
          <p className="text-muted mb-4">
            Convide colaboradores para ajudar a gerenciar suas organizações.
          </p>
          <Link href="/users/new" className="btn btn-primary">
            <UserPlus size={16} className="me-2" />
            Convidar primeiro membro
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop — tabela */}
          <div className="d-none d-md-block card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Nome</th>
                    <th>E-mail</th>
                    <th>Perfil</th>
                    <th>Empresas</th>
                    <th>Status</th>
                    <th className="text-end pe-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id}>
                      <td className="ps-4 fw-medium">{m.name}</td>
                      <td className="text-muted small">{m.email}</td>
                      <td>
                        <span className={`badge rounded-pill ${roleBadgeClass(m.role)}`}>
                          {m.role}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {m.organizations.map((org) => (
                            <span key={org.code} className="badge bg-light text-dark border small">
                              {org.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`badge rounded-pill ${statusBadgeClass(m.status)}`}>
                          {m.status === "ACTIVE" ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-flex gap-2 justify-content-end">
                          <Link
                            href={`/users/${m.id}/edit`}
                            className="btn btn-sm btn-outline-secondary"
                            title="Editar"
                          >
                            <Pencil size={14} />
                          </Link>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Remover"
                            onClick={() => handleRemove(m)}
                            disabled={removing === m.id}
                          >
                            {removing === m.id
                              ? <span className="spinner-border spinner-border-sm" role="status" />
                              : <Trash2 size={14} />
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile — cards empilhados */}
          <div className="d-md-none d-flex flex-column gap-3">
            {members.map((m) => (
              <div key={m.id} className="card border-0 shadow-sm rounded-4 p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <p className="fw-bold mb-0">{m.name}</p>
                    <p className="text-muted small mb-0">{m.email}</p>
                  </div>
                  <span className={`badge rounded-pill ${statusBadgeClass(m.status)}`}>
                    {m.status === "ACTIVE" ? "Ativo" : "Inativo"}
                  </span>
                </div>

                <div className="d-flex flex-wrap gap-1 mb-3">
                  <span className={`badge rounded-pill ${roleBadgeClass(m.role)}`}>{m.role}</span>
                  {m.organizations.map((org) => (
                    <span key={org.code} className="badge bg-light text-dark border small">
                      {org.name}
                    </span>
                  ))}
                </div>

                <div className="d-flex gap-2">
                  <Link
                    href={`/users/${m.id}/edit`}
                    className="btn btn-sm btn-outline-secondary flex-grow-1"
                  >
                    <Pencil size={14} className="me-1" />
                    Editar
                  </Link>
                  <button
                    className="btn btn-sm btn-outline-danger flex-grow-1"
                    onClick={() => handleRemove(m)}
                    disabled={removing === m.id}
                  >
                    {removing === m.id
                      ? <span className="spinner-border spinner-border-sm me-1" role="status" />
                      : <Trash2 size={14} className="me-1" />
                    }
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
