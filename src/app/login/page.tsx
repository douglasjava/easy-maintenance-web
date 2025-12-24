"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const router = useRouter();

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMsg(null);
        const form = new FormData(e.currentTarget);

        const payload = {
            email: String(form.get("email")).trim(),
            password: String(form.get("password")),
            remember: Boolean(form.get("remember")),
        };

        if (!payload.email || !payload.password) {
            setMsg("❌ Informe e-mail e senha.");
            return;
        }

        try {
            setLoading(true);
            const { data } = await api.post("/auth/login", payload);
            // opcional: guarda organizationCode para uso futuro
            if (data?.organizationCode && typeof window !== "undefined") {
                try {
                    localStorage.setItem("organizationCode", String(data.organizationCode));
                } catch {}
            }
            setMsg("✔️ Login realizado com sucesso. Redirecionando...");
            // redireciona para o dashboard
            router.replace("/");
        } catch {
            setMsg("❌ Falha no login. Verifique suas credenciais.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="login-screen">
            {/* fundo com gradiente */}
            <div className="login-hero" aria-hidden />

            {/* card */}
            <div className="login-card">
                <div className="login-avatar" aria-hidden>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M4 20c1.6-3.6 5-5 8-5s6.4 1.4 8 5" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                </div>

                <h1 className="login-title">Entrar</h1>
                <p className="login-sub">Acesse sua conta para continuar</p>

                <form onSubmit={onSubmit} className="login-form">
                    {/* email */}
                    <label className="login-field">
            <span className="login-icon" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18v12H3z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </span>
                        <input
                            name="email"
                            type="email"
                            placeholder="Email"
                            autoComplete="username"
                            required
                        />
                    </label>

                    {/* senha */}
                    <label className="login-field">
            <span className="login-icon" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </span>
                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            autoComplete="current-password"
                            required
                        />
                    </label>

                    <div className="login-row">
                        <label className="login-remember">
                            <input type="checkbox" name="remember" />
                            <span>Remember me</span>
                        </label>
                        <Link href="#" className="login-forgot">
                            Forgot password?
                        </Link>
                    </div>

                    <button className="login-btn" disabled={loading}>
                        {loading ? "Entrando..." : "LOGIN"}
                    </button>

                    {msg && <p className="login-msg">{msg}</p>}

                    <div className="login-foot">
                        <span>Ainda não tem conta?</span>
                        <Link href="/users/new">Criar conta</Link>
                    </div>
                </form>
            </div>
        </section>
    );
}