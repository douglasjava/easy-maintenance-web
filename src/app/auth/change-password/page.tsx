"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ChangePasswordPage() {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [idUser, setIdUser] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Tenta recuperar o idUser do sessionStorage (definido no login)
        if (typeof window !== "undefined") {
            const storedId = window.sessionStorage.getItem("tempIdUser");
            if (storedId) {
                setIdUser(Number(storedId));
            } else {
                router.replace("/login");
            }
        }
    }, [router]);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMsg(null);

        const form = new FormData(e.currentTarget);
        const newPassword = String(form.get("newPassword") ?? "");
        const confirmPassword = String(form.get("confirmPassword") ?? "");

        if (!newPassword || !confirmPassword) {
            setMsg("❌ Preencha todos os campos.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setMsg("❌ As senhas não coincidem.");
            return;
        }

        if (!idUser) {
            setMsg("❌ Erro de identificação do usuário. Tente fazer login novamente.");
            return;
        }

        try {
            setLoading(true);

            await api.post("/auth/change-password", {
                idUser: idUser,
                newPassword: newPassword,
            });

            // Limpa o ID temporário
            window.sessionStorage.removeItem("tempIdUser");

            setMsg("✔️ Senha alterada com sucesso! Redirecionando para o login...");
            
            setTimeout(() => {
                router.replace("/login");
            }, 2000);
        } catch (err: any) {
            setMsg("❌ Erro ao alterar a senha. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="login-screen">
            <div className="login-hero" aria-hidden />

            <div className="login-card">
                <div className="login-brand">
                    <Image
                        src="/logo.png"
                        alt="Easy Maintenance"
                        width={180}
                        height={48}
                        priority
                    />
                </div>

                <h1 className="login-title">Primeiro Acesso</h1>
                <p className="login-sub">Por segurança, você deve alterar sua senha inicial.</p>

                <form onSubmit={onSubmit} className="login-form">
                    <label className="login-field">
                        <span className="login-icon" aria-hidden>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                        </span>
                        <input
                            name="newPassword"
                            type="password"
                            placeholder="Nova Senha"
                            required
                        />
                    </label>

                    <label className="login-field">
                        <span className="login-icon" aria-hidden>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                        </span>
                        <input
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirme a Nova Senha"
                            required
                        />
                    </label>

                    <button className="login-btn" disabled={loading}>
                        {loading ? "Alterando..." : "Alterar Senha"}
                    </button>

                    {msg && (
                        <p className="login-msg" role="status" aria-live="polite">
                            {msg}
                        </p>
                    )}
                </form>
            </div>
        </section>
    );
}
