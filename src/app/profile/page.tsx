"use client";

import {useState, useEffect} from "react";
import {api} from "@/lib/apiClient";
import toast from "react-hot-toast";
import {User, Mail, Shield, Save} from "lucide-react";

export default function ProfilePage() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [user, setUser] = useState({
        id: "",
        name: "",
        email: "",
        role: "",
        status: "ACTIVE",
    });

    useEffect(() => {
        async function loadProfile() {
            try {
                const userId = window.sessionStorage.getItem("userId") || window.localStorage.getItem("userId");
                if (!userId) {
                    toast.error("Usuário não identificado.");
                    return;
                }

                const {data} = await api.get(`/user/${userId}`);
                setUser({
                    id: userId,
                    name: data.name || "",
                    email: data.email || "",
                    role: data.role || "",
                    status: data.status || "ACTIVE",
                });
            } catch (err) {
                console.error("Erro ao carregar perfil:", err);
                toast.error("Erro ao carregar dados do perfil.");
            } finally {
                setFetching(false);
            }
        }

        loadProfile();
    }, []);

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            await api.patch(`/user/${user.id}`, {
                email: user.email,
                name: user.name,
                role: user.role,
                status: user.status
            });

            toast.success("Perfil atualizado com sucesso!");

            if (typeof window !== "undefined") {
                window.localStorage.setItem("userName", user.name);
                window.sessionStorage.setItem("userName", user.name);
            }
        } catch (err) {
            console.error("Erro ao atualizar perfil:", err);
            toast.error("Erro ao atualizar perfil.");
        } finally {
            setLoading(false);
        }
    }

    async function handleForgotPassword() {
        if (!user.email) return;

        setLoading(true);
        try {
            await api.post("/auth/forgot-password", {email: user.email});
            toast.success("E-mail de redefinição enviado!");
        } catch (err) {
            console.error("Erro ao solicitar nova senha:", err);
            toast.error("Erro ao solicitar redefinição de senha.");
        } finally {
            setLoading(false);
        }
    }

    if (fetching) {
        return <div className="container py-5 text-center">Carregando perfil...</div>;
    }

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-8">
                    <div className="d-flex align-items-center gap-3 mb-4">
                        <div
                            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                            style={{width: 64, height: 64, fontSize: '1.5rem'}}>
                            <User size={32}/>
                        </div>
                        <div>
                            <h2 className="mb-0 fw-bold">Minha Conta</h2>
                            <p className="text-muted mb-0">Gerencie suas informações pessoais e configurações</p>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div className="card-header bg-white border-bottom py-3">
                            <h5 className="card-title mb-0 fw-bold">Dados Pessoais</h5>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleUpdate}>
                                <div className="row g-4">
                                    <div className="col-12">
                                        <label className="form-label fw-medium text-muted small text-uppercase mb-2">Nome
                                            Completo</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0"><User size={18}
                                                                                                           className="text-muted"/></span>
                                            <input
                                                type="text"
                                                className="form-control bg-light border-start-0 ps-0"
                                                value={user.name}
                                                onChange={(e) => setUser({...user, name: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label
                                            className="form-label fw-medium text-muted small text-uppercase mb-2">E-mail</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0"><Mail size={18}
                                                                                                           className="text-muted"/></span>
                                            <input
                                                type="email"
                                                className="form-control bg-light border-start-0 ps-0"
                                                value={user.email}
                                                readOnly
                                            />
                                        </div>
                                        <div className="form-text small">O e-mail não pode ser alterado por aqui.</div>
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-medium text-muted small text-uppercase mb-2">Nível
                                            de Acesso</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0"><Shield size={18}
                                                                                                             className="text-muted"/></span>
                                            <select
                                                className="form-select bg-light border-start-0 ps-0 shadow-none"
                                                value={user.role}
                                                onChange={(e) => setUser({...user, role: e.target.value})}
                                                required
                                            >
                                                <option value="ADMIN">Administrador</option>
                                                <option value="USER">Usuário</option>
                                                <option value="OPERATOR">Operador</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label
                                            className="form-label fw-medium text-muted small text-uppercase mb-2">Status</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0"><Shield size={18}
                                                                                                             className="text-muted"/></span>
                                            <select
                                                className="form-select bg-light border-start-0 ps-0 shadow-none"
                                                value={user.status}
                                                onChange={(e) => setUser({...user, status: e.target.value})}
                                                required
                                            >
                                                <option value="ACTIVE">Ativo</option>
                                                <option value="INACTIVE">Inativo</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 pt-3 border-top">
                                    <button type="submit"
                                            className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-3 shadow-sm"
                                            disabled={loading}>
                                        <Save size={18}/>
                                        {loading ? "Salvando..." : "Salvar Alterações"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div
                        className="card border-0 shadow-sm rounded-4 mt-4 overflow-hidden border-start border-warning border-4">
                        <div className="card-body p-4 d-flex align-items-center justify-content-between">
                            <div>
                                <h6 className="fw-bold mb-1">Segurança</h6>
                                <p className="text-muted small mb-0">Deseja alterar sua senha de acesso?</p>
                                <p className="text-muted small mb-0">Um e-mail será enviado com as instruções para a troca da senha</p>
                            </div>
                            <button
                                type="button"
                                className="btn btn-outline-warning btn-sm px-3 rounded-pill"
                                onClick={handleForgotPassword}
                                disabled={loading}
                            >
                                {loading ? "Processando..." : "Alterar Senha"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
