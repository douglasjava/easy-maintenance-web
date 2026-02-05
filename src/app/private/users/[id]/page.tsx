"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";
import {roleLabelMap} from "@/lib/enums/labels";

type User = {
    id: string;
    name: string;
    email: string;
    status: string;
    role: string;
};

type Organization = {
    id: string;
    code: string;
    name: string;
    doc: string;
};

const COLORS = {
    primary: "#0B5ED7",
    primaryDark: "#083B7A",
    bg: "#F3F4F6",
};

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [activeTab, setActiveTab] = useState<"profile" | "organizations" | "security">("profile");
    const [loadingOrgs, setLoadingOrgs] = useState(false);
    const [orgCount, setOrgCount] = useState(0);

    const [profileForm, setProfileForm] = useState(
        {
            name: "",
            email: "",
            status: "ACTIVE",
            role: "ADMIN"
        }
    );

    // Link Organization Modal state
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [searchOrgName, setSearchOrgName] = useState("");
    const [searchOrgDoc, setSearchOrgDoc] = useState("");
    const [searchingOrg, setSearchingOrg] = useState(false);
    const [foundOrgs, setFoundOrgs] = useState<Organization[]>([]);
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
    const [linkingOrg, setLinkingOrg] = useState(false);

    // Reset Password Modal state
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetting, setResetting] = useState(false);

    // Unlink Modal state
    const [orgToUnlink, setOrgToUnlink] = useState<Organization | null>(null);
    const [unlinking, setUnlinking] = useState(false);

    useEffect(() => {
        fetchUser();
        fetchUserOrgs();
    }, [id]);

    async function fetchUser() {
        try {
            setLoading(true);
            const adminToken = window.localStorage.getItem("adminToken");
            const { data } = await api.get(`/private/admin/users/${id}`, {
                headers: { "X-Admin-Token": adminToken },
            });
            setUser(data);
            setProfileForm({ name: data.name, email: data.email, status: data.status, role: data.role || "READER" });
        } catch (err) {
            console.error(err);
            toast.error("Erro ao carregar detalhes do usuário.");
        } finally {
            setLoading(false);
        }
    }

    async function fetchUserOrgs() {
        try {
            setLoadingOrgs(true);
            const adminToken = window.localStorage.getItem("adminToken");
            const { data } = await api.get(`/private/admin/users/${id}/organizations`, {
                headers: { "X-Admin-Token": adminToken },
            });
            const organizations = data || [];
            setOrgs(organizations);
            setOrgCount(organizations.length);
        } catch (err) {
            console.error(err);
            toast.error("Erro ao carregar organizações do usuário.");
        } finally {
            setLoadingOrgs(false);
        }
    }

    useEffect(() => {
        if (activeTab === "organizations") {
            fetchUserOrgs();
        }
    }, [activeTab]);

    async function handleUpdateProfile(e: React.FormEvent) {
        e.preventDefault();
        try {
            const adminToken = window.localStorage.getItem("adminToken");
            await api.put(`/private/admin/users/${id}`, profileForm, {
                headers: { "X-Admin-Token": adminToken },
            });
            toast.success("Perfil atualizado.");
            fetchUser();
        } catch (err) {
            toast.error("Erro ao atualizar perfil.");
        }
    }

    async function handleUnlinkOrg(orgId: string) {
        const org = orgs.find(o => o.id === orgId);
        if (org) {
            setOrgToUnlink(org);
        }
    }

    async function confirmUnlinkOrg() {
        if (!orgToUnlink) return;
        try {
            setUnlinking(true);
            const adminToken = window.localStorage.getItem("adminToken");
            await api.delete(`/private/admin/users/${id}/organizations/${orgToUnlink.code}`, {
                headers: { "X-Admin-Token": adminToken },
            });
            toast.success("Vínculo com a organização removido.");
            setOrgToUnlink(null);
            fetchUserOrgs();
        } catch (err) {
            toast.error("Erro ao remover vínculo com a organização.");
        } finally {
            setUnlinking(false);
        }
    }

    async function handleSearchOrg() {
        if (!searchOrgName && !searchOrgDoc) return;
        try {
            setSearchingOrg(true);
            setFoundOrgs([]);
            setSelectedOrg(null);
            const adminToken = window.localStorage.getItem("adminToken");
            const { data } = await api.get(`/private/admin/organizations`, {
                params: { 
                    name: searchOrgName || undefined, 
                    doc: searchOrgDoc || undefined 
                },
                headers: { "X-Admin-Token": adminToken },
            });
            
            const results = data.content || (Array.isArray(data) ? data : []);
            
            if (results && results.length > 0) {
                setFoundOrgs(results);
            } else {
                toast.error("Nenhuma organização encontrada.");
            }
        } catch (err) {
            toast.error("Erro na busca de organizações.");
        } finally {
            setSearchingOrg(false);
        }
    }

    async function handleLinkOrg() {
        if (!selectedOrg) return;
        try {
            setLinkingOrg(true);
            const adminToken = window.localStorage.getItem("adminToken");
            await api.post(`/private/admin/users/${id}/organizations/${selectedOrg.code}`, {}, {
                headers: { "X-Admin-Token": adminToken },
            });
            toast.success("Organização vinculada com sucesso.");
            setShowLinkModal(false);
            setFoundOrgs([]);
            setSelectedOrg(null);
            setSearchOrgName("");
            setSearchOrgDoc("");
            fetchUserOrgs();
        } catch (err) {
            toast.error("Erro ao vincular organização.");
        } finally {
            setLinkingOrg(false);
        }
    }

    async function handleResetPassword() {
        setShowResetModal(true);
    }

    async function confirmResetPassword() {
        if (!user?.email) {
            toast.error("E-mail inválido.");
            return;
        }

        try {
            setResetting(true);

            await api.post("/auth/forgot-password", {
                email: user.email.trim().toLowerCase(),
            });

            toast.success(
                "Se o e-mail estiver cadastrado, enviaremos instruções para redefinição de senha."
            );

            setShowResetModal(false);

        } catch (err: any) {
            console.error("Erro ao redefinir senha", err);

            const message =
                err?.response?.data?.detail ||
                "Não foi possível iniciar a redefinição de senha.";

            toast.error(message);

        } finally {
            setResetting(false);
        }
    }


    if (loading) return <div className="p-4 text-center">Carregando...</div>;
    if (!user) return <div className="p-4 text-center text-danger">Usuário não encontrado.</div>;

    return (
        <section style={{ backgroundColor: COLORS.bg }} className="p-3">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h1 className="h4 m-0" style={{ color: COLORS.primaryDark }}>
                        {user.name}
                    </h1>
                    <div className="d-flex align-items-center gap-2 mt-1">
                        <span className="text-muted small">{user.email}</span>
                        <span className={`badge ${user.status === "ACTIVE" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>
                            {user.status === "ACTIVE" ? "Ativo" : "Inativo"}
                        </span>
                        <span className="text-muted small">• {roleLabelMap[user.role] || user.role}</span>
                        <span className="text-muted small">• {orgCount} organizações vinculadas</span>
                    </div>
                </div>
                <Link className="btn btn-outline-secondary" href="/private/users">
                    ← Voltar para a lista
                </Link>
            </div>

            <div className="card border-0 shadow-sm overflow-hidden">
                <div className="card-header bg-light border-0 p-1">
                    <ul className="nav nav-pills nav-fill">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === "profile" ? "active fw-bold shadow-sm" : "text-muted"}`}
                                onClick={() => setActiveTab("profile")}
                            >
                                Perfil
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === "organizations" ? "active fw-bold shadow-sm" : "text-muted"}`}
                                onClick={() => setActiveTab("organizations")}
                            >
                                Organizações
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === "security" ? "active fw-bold shadow-sm" : "text-muted"}`}
                                onClick={() => setActiveTab("security")}
                            >
                                Segurança
                            </button>
                        </li>
                    </ul>
                </div>

                <div className="card-body p-4">
                    {activeTab === "profile" && (
                        <form onSubmit={handleUpdateProfile}>
                            <div className="row g-3">
                                <div className="col-12 col-md-6">
                                    <label className="form-label">Nome</label>
                                    <input
                                        className="form-control"
                                        value={profileForm.name}
                                        onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={profileForm.email}
                                        onChange={(e) => setProfileForm(p => ({ ...p, email: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label">Status</label>
                                    <select
                                        className="form-select"
                                        value={profileForm.status}
                                        onChange={(e) => setProfileForm(p => ({ ...p, status: e.target.value }))}
                                    >
                                        <option value="ACTIVE">Ativo</option>
                                        <option value="INACTIVE">Inativo</option>
                                    </select>
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label">Perfil</label>
                                    <select
                                        className="form-select"
                                        value={profileForm.role}
                                        onChange={(e) => setProfileForm(p => ({ ...p, role: e.target.value}))}
                                        required
                                    >
                                        {Object.entries(roleLabelMap).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button className="btn btn-primary mt-4" type="submit">Salvar Alterações</button>
                        </form>
                    )}

                    {activeTab === "organizations" && (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="mb-0">Empresas Vinculadas</h6>
                                <button className="btn btn-sm btn-outline-primary" onClick={() => setShowLinkModal(true)}>
                                    + Adicionar Empresa
                                </button>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Nome Empresa</th>
                                            <th>Documento</th>
                                            <th className="text-end">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingOrgs ? (
                                            <tr><td colSpan={3} className="text-center">Carregando...</td></tr>
                                        ) : orgs.length === 0 ? (
                                            <tr><td colSpan={3} className="text-center text-muted">Usuário não vinculado a nenhuma empresa.</td></tr>
                                        ) : (
                                            orgs.map(org => (
                                                <tr key={org.id}>
                                                    <td className="fw-semibold">{org.name}</td>
                                                    <td className="fw-semibold">{org.doc}</td>
                                                    <td className="text-end">
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleUnlinkOrg(org.id)}
                                                        >
                                                            Remover
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div style={{ maxWidth: "500px" }}>
                            <div className="card border-warning-subtle bg-warning-subtle p-3 mb-4">
                                <h6 className="text-warning-emphasis">Redefinir Senha</h6>
                                <p className="small text-warning-emphasis mb-3">
                                    Isso permitirá que o usuário defina uma nova senha. Use esta opção caso o usuário tenha perdido o acesso à sua conta.
                                </p>
                                <button className="btn btn-warning w-auto" onClick={handleResetPassword}>
                                    Enviar redefinição de senha
                                </button>
                            </div>

                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                show={!!orgToUnlink}
                title="Remover Organização"
                message={`Tem certeza que deseja remover este usuário da empresa ${orgToUnlink?.name}?`}
                onConfirm={confirmUnlinkOrg}
                onCancel={() => setOrgToUnlink(null)}
                loading={unlinking}
                confirmLabel="Remover"
            />

            <ConfirmModal
                show={showResetModal}
                title="Redefinir Senha"
                message="Deseja enviar instruções de redefinição de senha para este usuário?"
                onConfirm={confirmResetPassword}
                onCancel={() => setShowResetModal(false)}
                loading={resetting}
                confirmLabel="Enviar Redefinição"
            />

            {showLinkModal && (
                <div className="modal fade show d-block" tabIndex={-1}>
                    <div className="modal-dialog modal-dialog-centered" style={{ zIndex: 1060 }}>
                        <div className="modal-content shadow">
                            <div className="modal-header">
                                <h5 className="modal-title">Vincular a Organização</h5>
                                <button type="button" className="btn-close" onClick={() => { setShowLinkModal(false); setFoundOrgs([]); setSelectedOrg(null); setSearchOrgName(""); setSearchOrgDoc(""); }}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Buscar por Nome</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Nome da organização..."
                                        value={searchOrgName}
                                        onChange={(e) => setSearchOrgName(e.target.value)}
                                        onBlur={handleSearchOrg}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Buscar por Documento</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Documento..."
                                        value={searchOrgDoc}
                                        onChange={(e) => setSearchOrgDoc(e.target.value)}
                                        onBlur={handleSearchOrg}
                                    />
                                </div>

                                {searchingOrg && <div className="text-center p-2"><div className="spinner-border spinner-border-sm text-primary"></div></div>}

                                {foundOrgs.length > 0 && (
                                    <div className="list-group mb-3" style={{ maxHeight: "200px", overflowY: "auto" }}>
                                        {foundOrgs.map(org => (
                                            <button
                                                key={org.id}
                                                type="button"
                                                className={`list-group-item list-group-item-action ${selectedOrg?.id === org.id ? "active" : ""}`}
                                                onClick={() => setSelectedOrg(org)}
                                            >
                                                <div className="fw-bold">{org.name}</div>
                                                <div className={`small ${selectedOrg?.id === org.id ? "text-white-50" : "text-muted"}`}>
                                                    Doc: {org.doc}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => { setShowLinkModal(false); setFoundOrgs([]); setSelectedOrg(null); setSearchOrgName(""); setSearchOrgDoc(""); }}>Cancelar</button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary" 
                                    disabled={!selectedOrg || linkingOrg}
                                    onClick={handleLinkOrg}
                                >
                                    {linkingOrg ? "Vinculando..." : "Vincular à Organização"}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" onClick={() => { setShowLinkModal(false); setFoundOrgs([]); setSelectedOrg(null); setSearchOrgName(""); setSearchOrgDoc(""); }} style={{ zIndex: 1050 }}></div>
                </div>
            )}
        </section>
    );
}
