"use client";

import {useState, useEffect, useCallback} from "react";
import {api} from "@/lib/apiClient";
import toast from "react-hot-toast";
import {User, Mail, Shield, Save, ShieldCheck, ShieldOff, RefreshCw, Key} from "lucide-react";
import Image from "next/image";

type TwoFactorStatus = { enabled: boolean; backupCodesRemaining: number };
type SetupData = { secret: string; qrCodeDataUri: string; otpAuthUri: string };
type TwoFactorStep =
    | "idle"
    | "setup-qr"
    | "setup-confirm"
    | "setup-done"
    | "disable-confirm"
    | "regen-confirm";

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

    // 2FA state
    const [twoFactorStatus, setTwoFactorStatus] = useState<TwoFactorStatus | null>(null);
    const [twoFactorStep, setTwoFactorStep] = useState<TwoFactorStep>("idle");
    const [setupData, setSetupData] = useState<SetupData | null>(null);
    const [twoFactorCode, setTwoFactorCode] = useState("");
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [twoFactorLoading, setTwoFactorLoading] = useState(false);
    const [showSecret, setShowSecret] = useState(false);

    const loadTwoFactorStatus = useCallback(async () => {
        try {
            const {data} = await api.get("/me/2fa/status");
            setTwoFactorStatus(data);
        } catch {
            // not critical — silently ignore
        }
    }, []);

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
        loadTwoFactorStatus();
    }, [loadTwoFactorStatus]);

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

    // ─── 2FA handlers ────────────────────────────────────────────────────────

    async function handle2faSetupStart() {
        setTwoFactorLoading(true);
        try {
            const {data} = await api.post("/me/2fa/setup");
            setSetupData(data);
            setTwoFactorCode("");
            setShowSecret(false);
            setTwoFactorStep("setup-qr");
        } catch {
            toast.error("Erro ao iniciar configuração do 2FA.");
        } finally {
            setTwoFactorLoading(false);
        }
    }

    async function handle2faConfirm() {
        if (!twoFactorCode.trim()) {
            toast.error("Informe o código de 6 dígitos.");
            return;
        }
        setTwoFactorLoading(true);
        try {
            const {data} = await api.post("/me/2fa/confirm", {code: twoFactorCode.trim()});
            setBackupCodes(data.backupCodes ?? []);
            setTwoFactorCode("");
            setSetupData(null);
            setTwoFactorStep("setup-done");
            await loadTwoFactorStatus();
            toast.success("2FA ativado com sucesso!");
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 401 || status === 400) {
                toast.error("Código inválido. Verifique o app autenticador.");
            } else {
                toast.error("Erro ao confirmar 2FA. Tente novamente.");
            }
        } finally {
            setTwoFactorLoading(false);
        }
    }

    async function handle2faDisable() {
        if (!twoFactorCode.trim()) {
            toast.error("Informe o código TOTP ou backup code.");
            return;
        }
        setTwoFactorLoading(true);
        try {
            await api.post("/me/2fa/disable", {code: twoFactorCode.trim()});
            setTwoFactorCode("");
            setTwoFactorStep("idle");
            await loadTwoFactorStatus();
            toast.success("2FA desativado com sucesso.");
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 401 || status === 400) {
                toast.error("Código inválido.");
            } else {
                toast.error("Erro ao desativar 2FA. Tente novamente.");
            }
        } finally {
            setTwoFactorLoading(false);
        }
    }

    async function handle2faRegenCodes() {
        if (!twoFactorCode.trim()) {
            toast.error("Informe seu código TOTP atual para confirmar.");
            return;
        }
        setTwoFactorLoading(true);
        try {
            const {data} = await api.post("/me/2fa/backup-codes/regenerate", {code: twoFactorCode.trim()});
            setBackupCodes(data.backupCodes ?? []);
            setTwoFactorCode("");
            setTwoFactorStep("setup-done");
            await loadTwoFactorStatus();
            toast.success("Novos backup codes gerados!");
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 401 || status === 400) {
                toast.error("Código inválido.");
            } else {
                toast.error("Erro ao regenerar backup codes.");
            }
        } finally {
            setTwoFactorLoading(false);
        }
    }

    function resetTwoFactorFlow() {
        setTwoFactorStep("idle");
        setTwoFactorCode("");
        setSetupData(null);
        setBackupCodes([]);
        setShowSecret(false);
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

                    {/* Dados Pessoais */}
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

                    {/* Segurança — Alterar Senha */}
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

                    {/* Autenticação em Dois Fatores */}
                    <div className="card border-0 shadow-sm rounded-4 mt-4 overflow-hidden">
                        <div className="card-header bg-white border-bottom py-3 d-flex align-items-center gap-2">
                            <ShieldCheck size={20} className="text-primary"/>
                            <h5 className="card-title mb-0 fw-bold">Autenticação em Dois Fatores (2FA)</h5>
                        </div>
                        <div className="card-body p-4">

                            {/* Idle — show status */}
                            {twoFactorStep === "idle" && (
                                <>
                                    {twoFactorStatus?.enabled ? (
                                        <div>
                                            <div className="d-flex align-items-center gap-2 mb-3">
                                                <span className="badge bg-success px-3 py-2 fs-6">Ativo</span>
                                                <span className="text-muted small">
                                                    {twoFactorStatus.backupCodesRemaining} backup code{twoFactorStatus.backupCodesRemaining !== 1 ? "s" : ""} disponível{twoFactorStatus.backupCodesRemaining !== 1 ? "is" : ""}
                                                </span>
                                            </div>
                                            <p className="text-muted small mb-4">
                                                O 2FA está ativo na sua conta. Use seu app autenticador (Google Authenticator, Authy, etc.) ao fazer login.
                                            </p>
                                            <div className="d-flex flex-wrap gap-2">
                                                <button
                                                    className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                                                    onClick={() => { setTwoFactorCode(""); setTwoFactorStep("regen-confirm"); }}
                                                    disabled={twoFactorLoading}
                                                >
                                                    <RefreshCw size={15}/> Regenerar Backup Codes
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                                                    onClick={() => { setTwoFactorCode(""); setTwoFactorStep("disable-confirm"); }}
                                                    disabled={twoFactorLoading}
                                                >
                                                    <ShieldOff size={15}/> Desativar 2FA
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="d-flex align-items-center gap-2 mb-3">
                                                <span className="badge bg-secondary px-3 py-2 fs-6">Inativo</span>
                                            </div>
                                            <p className="text-muted small mb-4">
                                                Adicione uma camada extra de segurança exigindo um código do app autenticador ao entrar na conta.
                                            </p>
                                            <button
                                                className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                                                onClick={handle2faSetupStart}
                                                disabled={twoFactorLoading}
                                            >
                                                <ShieldCheck size={15}/>
                                                {twoFactorLoading ? "Iniciando..." : "Habilitar 2FA"}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Step: show QR code */}
                            {twoFactorStep === "setup-qr" && setupData && (
                                <div>
                                    <h6 className="fw-bold mb-3">Passo 1 — Escaneie o QR Code</h6>
                                    <p className="text-muted small mb-3">
                                        Abra o Google Authenticator (ou outro app TOTP) e escaneie o código abaixo:
                                    </p>
                                    <div className="text-center mb-4">
                                        <Image
                                            src={setupData.qrCodeDataUri}
                                            alt="QR Code 2FA"
                                            width={200}
                                            height={200}
                                            className="border rounded p-2"
                                            unoptimized
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <button
                                            type="button"
                                            className="btn btn-link btn-sm p-0 text-muted d-flex align-items-center gap-1"
                                            onClick={() => setShowSecret(!showSecret)}
                                        >
                                            <Key size={14}/>
                                            {showSecret ? "Ocultar chave manual" : "Não consigo escanear — mostrar chave manual"}
                                        </button>
                                        {showSecret && (
                                            <div className="mt-2 p-3 bg-light rounded border">
                                                <p className="text-muted small mb-1">Chave secreta (insira manualmente no app):</p>
                                                <code className="fs-6 user-select-all">{setupData.secret}</code>
                                            </div>
                                        )}
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => { setTwoFactorCode(""); setTwoFactorStep("setup-confirm"); }}
                                        >
                                            Já escaniei → Continuar
                                        </button>
                                        <button
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={resetTwoFactorFlow}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step: enter TOTP to confirm setup */}
                            {twoFactorStep === "setup-confirm" && (
                                <div>
                                    <h6 className="fw-bold mb-3">Passo 2 — Confirme o código</h6>
                                    <p className="text-muted small mb-3">
                                        Insira o código de 6 dígitos exibido no seu app autenticador para confirmar a ativação:
                                    </p>
                                    <div className="mb-3" style={{maxWidth: 220}}>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className="form-control text-center fs-5 letter-spacing-wide"
                                            placeholder="000000"
                                            maxLength={8}
                                            value={twoFactorCode}
                                            onChange={(e) => setTwoFactorCode(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={handle2faConfirm}
                                            disabled={twoFactorLoading}
                                        >
                                            {twoFactorLoading ? "Verificando..." : "Confirmar e Ativar"}
                                        </button>
                                        <button
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={() => setTwoFactorStep("setup-qr")}
                                            disabled={twoFactorLoading}
                                        >
                                            ← Voltar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step: show backup codes (after setup or regen) */}
                            {twoFactorStep === "setup-done" && backupCodes.length > 0 && (
                                <div>
                                    <div className="alert alert-warning d-flex gap-2 mb-3" role="alert">
                                        <span>⚠️</span>
                                        <div>
                                            <strong>Guarde estes códigos agora!</strong> Eles são exibidos apenas uma vez.
                                            Cada código pode ser usado uma única vez caso você perca acesso ao app autenticador.
                                        </div>
                                    </div>
                                    <div className="row g-2 mb-4">
                                        {backupCodes.map((code, i) => (
                                            <div key={i} className="col-6 col-sm-4 col-md-3">
                                                <div className="p-2 bg-light border rounded text-center">
                                                    <code className="small user-select-all">{code}</code>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={resetTwoFactorFlow}
                                    >
                                        Concluído
                                    </button>
                                </div>
                            )}

                            {/* Step: confirm disable */}
                            {twoFactorStep === "disable-confirm" && (
                                <div>
                                    <h6 className="fw-bold mb-2 text-danger">Desativar Autenticação em Dois Fatores</h6>
                                    <p className="text-muted small mb-3">
                                        Insira seu código TOTP atual (ou um backup code) para confirmar a desativação:
                                    </p>
                                    <div className="mb-3" style={{maxWidth: 220}}>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className="form-control text-center fs-5"
                                            placeholder="000000"
                                            maxLength={8}
                                            value={twoFactorCode}
                                            onChange={(e) => setTwoFactorCode(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={handle2faDisable}
                                            disabled={twoFactorLoading}
                                        >
                                            {twoFactorLoading ? "Desativando..." : "Confirmar Desativação"}
                                        </button>
                                        <button
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={resetTwoFactorFlow}
                                            disabled={twoFactorLoading}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step: confirm regen backup codes */}
                            {twoFactorStep === "regen-confirm" && (
                                <div>
                                    <h6 className="fw-bold mb-2">Regenerar Backup Codes</h6>
                                    <p className="text-muted small mb-3">
                                        Os backup codes atuais serão invalidados. Insira seu código TOTP para confirmar:
                                    </p>
                                    <div className="mb-3" style={{maxWidth: 220}}>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className="form-control text-center fs-5"
                                            placeholder="000000"
                                            maxLength={8}
                                            value={twoFactorCode}
                                            onChange={(e) => setTwoFactorCode(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={handle2faRegenCodes}
                                            disabled={twoFactorLoading}
                                        >
                                            {twoFactorLoading ? "Gerando..." : "Gerar Novos Códigos"}
                                        </button>
                                        <button
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={resetTwoFactorFlow}
                                            disabled={twoFactorLoading}
                                        >
                                            Cancelar
                                        </button>
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
