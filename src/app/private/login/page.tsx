"use client";

import { useState } from "react";
import { api } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function PrivateLoginPage() {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const router = useRouter();

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMsg(null);

        const form = new FormData(e.currentTarget);
        const token = String(form.get("token") ?? "").trim();

        if (!token) {
            setMsg("❌ Informe o token de acesso.");
            return;
        }

        try {
            setLoading(true);

            // Chamada de validação conforme especificado
            await api.get("/private/admin/validate-token", {
                headers: {
                    "X-Admin-Token": token
                }
            });

            if (typeof window !== "undefined") {
                window.localStorage.setItem("adminToken", token);
            }

            setMsg("✔️ Token validado com sucesso. Redirecionando...");
            router.replace("/private/dashboard");
        } catch (err: any) {
            setMsg("❌ Token inválido ou erro na requisição.");
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

                <h1 className="login-title">Área Privativa</h1>
                <p className="login-sub">Informe seu token de acesso de administrador</p>

                <form onSubmit={onSubmit} className="login-form">
                    <label className="login-field">
                        <span className="login-icon" aria-hidden>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                        </span>
                        <input
                            name="token"
                            type="password"
                            placeholder="Token de Acesso"
                            required
                        />
                    </label>

                    <button className="login-btn" disabled={loading}>
                        {loading ? "Validando..." : "Entrar"}
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
