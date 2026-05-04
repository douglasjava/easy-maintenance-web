"use client";

import {useState} from "react";
import Link from "next/link";
import {api} from "@/lib/apiClient";
import {useRouter} from "next/navigation";
import {useAuth} from "@/contexts/AuthContext";
import BrandLogo from "@/components/ui/BrandLogo";
import toast from "react-hot-toast";

type PendingTwoFactor = {
    pendingToken: string;
    remember: boolean;
    userId: number;
    organizationCodes: string[];
    email: string;
    name: string;
};

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [twoFactorPending, setTwoFactorPending] = useState<PendingTwoFactor | null>(null);
    const [totpCode, setTotpCode] = useState("");
    const [showRecovery, setShowRecovery] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const form = new FormData(e.currentTarget);
        const email = String(form.get("email") ?? "").trim();
        const password = String(form.get("password") ?? "");
        const remember = Boolean(form.get("remember"));

        if (!email || !password) {
            toast.error("Informe e-mail e senha.");
            return;
        }

        try {
            setLoading(true);
            const {data} = await api.post("/auth/login", {email, password, remember});

            if (data?.requiresTwoFactor) {
                setTwoFactorPending({
                    pendingToken: data.pendingToken,
                    remember,
                    userId: data.id,
                    organizationCodes: data.organizationCodes ?? [],
                    email: data.email,
                    name: data.name,
                });
                return;
            }

            await completeLogin(data, remember);
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 401) {
                toast.error("E-mail ou senha inválidos.");
            } else {
                toast.error("Não foi possível acessar o sistema. Tente novamente.");
            }
        } finally {
            setLoading(false);
        }
    }

    async function onTwoFactorSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!twoFactorPending) return;

        const code = totpCode.trim().replace(/\s/g, "");
        if (!code) {
            toast.error("Informe o código de 6 dígitos.");
            return;
        }

        try {
            setLoading(true);
            const {data} = await api.post("/auth/2fa/verify", {
                pendingToken: twoFactorPending.pendingToken,
                code,
                remember: twoFactorPending.remember,
            });

            await completeLogin(data, twoFactorPending.remember);
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 401) {
                toast.error("Código inválido. Verifique o app autenticador ou use um código de backup.");
            } else {
                toast.error("Erro ao verificar o código. Tente novamente.");
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleRecoveryRequest() {
        if (!twoFactorPending) return;
        try {
            setLoading(true);
            await api.post("/auth/2fa/request-recovery", {email: twoFactorPending.email});
            toast.success("E-mail de recuperação enviado. Verifique sua caixa de entrada.");
            setShowRecovery(false);
        } catch {
            toast.error("Erro ao solicitar recuperação. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    async function completeLogin(data: any, remember: boolean) {
        await login(data, remember);

        if (data?.firstAccess === true) {
            if (typeof window !== "undefined") {
                window.sessionStorage.setItem("tempIdUser", String(data.id));
            }
            toast.success("Primeiro acesso detectado. Redirecionando para alteração de senha...");
            router.replace("/auth/change-password");
            return;
        }

        if (typeof window !== "undefined") {
            const storage = remember ? window.localStorage : window.sessionStorage;
            try {
                if (data?.organizationCodes && data.organizationCodes.length === 1) {
                    const orgCode = data.organizationCodes[0];
                    storage.setItem("organizationCode", String(orgCode));
                    try {
                        const res = await api.get(`/organizations/me/${data.id}`);
                        const orgs = res.data;
                        if (Array.isArray(orgs)) {
                            const currentOrg = orgs.find((item: any) => item.organization.code === orgCode);
                            if (currentOrg) {
                                storage.setItem("organizationName", currentOrg.organization.name);
                            }
                        }
                    } catch (err) {
                        console.error("Erro ao buscar detalhes da organização:", err);
                    }
                }
            } catch (e) {
                console.error("Erro ao salvar dados no storage:", e);
            }

            try {
                const fcm = window.localStorage.getItem("fcmToken") || window.sessionStorage.getItem("fcmToken");
                if (fcm) {
                    await api.post("/push/tokens/link", { token: fcm });
                }
            } catch (err) {
                console.warn("Falha ao vincular FCM token ao usuário:", err);
            }
        }

        toast.success("Login realizado com sucesso. Redirecionando...");

        if (data?.organizationCodes && data.organizationCodes.length > 1) {
            router.replace("/select-organization");
        } else if (data?.organizationCodes && data.organizationCodes.length === 1) {
            router.replace("/");
        } else {
            router.replace("/onboarding");
        }
    }

    // ─── 2FA verification step ───────────────────────────────────────────────
    if (twoFactorPending) {
        return (
            <section className="login-screen">
                <div className="login-hero" aria-hidden/>
                <div className="login-card">
                    <div className="login-brand">
                        <BrandLogo variant="stacked" priority />
                    </div>

                    <h1 className="login-title">Verificação em Dois Fatores</h1>
                    <p className="login-sub">
                        Abra o app autenticador e insira o código de 6 dígitos
                    </p>

                    {!showRecovery ? (
                        <form onSubmit={onTwoFactorSubmit} className="login-form">
                            <label className="login-field">
                                <span className="login-icon" aria-hidden>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                                        <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.5"/>
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    placeholder="Código de 6 dígitos"
                                    maxLength={8}
                                    value={totpCode}
                                    onChange={(e) => setTotpCode(e.target.value)}
                                    required
                                />
                            </label>

                            <button className="login-btn" disabled={loading}>
                                {loading ? "Verificando..." : "Verificar"}
                            </button>

                            <div style={{textAlign: "center", marginTop: "1rem"}}>
                                <button
                                    type="button"
                                    className="login-forgot"
                                    onClick={() => setShowRecovery(true)}
                                >
                                    Perdi o acesso ao autenticador
                                </button>
                            </div>
                            <div style={{textAlign: "center", marginTop: "0.5rem"}}>
                                <button
                                    type="button"
                                    className="login-forgot"
                                    onClick={() => setTwoFactorPending(null)}
                                >
                                    ← Voltar ao login
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="login-form">
                            <p style={{textAlign: "center", color: "#555"}}>
                                Enviaremos um link para seu e-mail para desabilitar o 2FA e recuperar o acesso.
                            </p>
                            <button
                                className="login-btn"
                                disabled={loading}
                                onClick={handleRecoveryRequest}
                            >
                                {loading ? "Enviando..." : "Enviar e-mail de recuperação"}
                            </button>
                            <div style={{textAlign: "center", marginTop: "1rem"}}>
                                <button
                                    type="button"
                                    className="login-forgot"
                                    onClick={() => setShowRecovery(false)}
                                >
                                    ← Voltar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        );
    }

    // ─── Normal login ────────────────────────────────────────────────────────
    return (
        <section className="login-screen">
            <div className="login-hero" aria-hidden/>
            <div className="login-card">
                <div className="login-brand">
                    <BrandLogo variant="stacked" priority />
                </div>

                <h1 className="login-title">Entrar no Easy Maintenance</h1>
                <p className="login-sub">Gerencie manutenções, prazos e conformidade</p>

                <form onSubmit={onSubmit} className="login-form">
                    <label className="login-field">
            <span className="login-icon" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18v12H3z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </span>
                        <input
                            name="email"
                            type="email"
                            placeholder="E-mail"
                            autoComplete="username"
                            required
                        />
                    </label>

                    <label className="login-field">
            <span className="login-icon" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </span>
                        <input
                            name="password"
                            type="password"
                            placeholder="Senha"
                            autoComplete="current-password"
                            required
                        />
                    </label>

                    <div className="login-row">
                        <label className="login-remember">
                            <input type="checkbox" name="remember"/>
                            <span>Manter conectado</span>
                        </label>
                        <Link href="/forgot-password" className="login-forgot">
                            Esqueci minha senha
                        </Link>
                    </div>

                    <button className="login-btn" disabled={loading}>
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                </form>
            </div>
        </section>
    );
}
