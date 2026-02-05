"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import Image from "next/image";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const email = String(form.get("email") ?? "").trim();

        if (!email) {
            toast.error("Informe seu e-mail.");
            return;
        }

        try {
            setLoading(true);
            await api.post("/auth/forgot-password", { email });
            setEmailSent(true);
            toast.success("E-mail de recuperação enviado!");
        } catch (err: any) {
            console.error(err);
            toast.error("Erro ao solicitar recuperação de senha. Verifique o e-mail informado.");
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

                <h1 className="login-title">Recuperar senha</h1>
                
                {!emailSent ? (
                    <>
                        <p className="login-sub">Informe seu e-mail para receber as instruções de recuperação</p>
                        <form onSubmit={onSubmit} className="login-form">
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
                                    placeholder="Seu e-mail"
                                    required
                                />
                            </label>

                            <button className="login-btn" disabled={loading}>
                                {loading ? "Enviando..." : "Enviar link de recuperação"}
                            </button>

                            <div className="login-foot">
                                <Link href="/login">Voltar para o login</Link>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <div className="mb-4" style={{ color: "#0B5ED7" }}>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="mx-auto">
                                <path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <p className="mb-4 text-muted">Se este e-mail estiver cadastrado, você receberá um link para criar uma nova senha em instantes.</p>
                        <Link href="/login" className="btn btn-outline-primary w-100">
                            Voltar para o login
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
