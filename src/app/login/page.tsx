"use client";

import {useState} from "react";
import Link from "next/link";
import {api} from "@/lib/apiClient";
import {useRouter} from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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

            const {data} = await api.post("/auth/login", {email, password});

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
                    if (data?.organizationCode) {
                        storage.setItem("organizationCode", String(data.organizationCode));
                    }
                    if (data?.accessToken) {
                        storage.setItem("accessToken", String(data.accessToken));
                    }
                    if (data?.tokenType) {
                        storage.setItem("tokenType", String(data.tokenType));
                    }
                } catch {
                    // ignore
                }
            }

            toast.success("Login realizado com sucesso. Redirecionando...");

            // UX: após login, enviar para o dashboard (visão geral).
            router.replace("/");
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

    return (
        <section className="login-screen">
            {/* fundo com gradiente */}
            <div className="login-hero" aria-hidden/>

            {/* card */}
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

                <h1 className="login-title">Entrar no Easy Maintenance</h1>
                <p className="login-sub">Gerencie manutenções, prazos e conformidade</p>

                <form onSubmit={onSubmit} className="login-form">
                    {/* email */}
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

                    {/* senha */}
                    <label className="login-field">
            <span className="login-icon" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect
                    x="4"
                    y="10"
                    width="16"
                    height="10"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                />
                <path
                    d="M8 10V7a4 4 0 0 1 8 0v3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                />
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
                        {/* Agora a opção tem efeito real (storage) */}
                        <label className="login-remember">
                            <input type="checkbox" name="remember"/>
                            <span>Manter conectado</span>
                        </label>

                        {/* Se ainda não existe, melhor deixar como "em breve" ou remover */}
                        <Link href="#" className="login-forgot" aria-disabled="true">
                            Esqueci minha senha
                        </Link>
                    </div>

                    <button className="login-btn" disabled={loading}>
                        {loading ? "Entrando..." : "Entrar"}
                    </button>

                    <div className="login-foot">
                        <span>Ainda não tem conta?</span>
                        <Link href="/users/new">Criar conta</Link>
                    </div>

                </form>
            </div>
        </section>
    );
}
