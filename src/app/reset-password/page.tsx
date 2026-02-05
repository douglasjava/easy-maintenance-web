"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import Image from "next/image";
import toast from "react-hot-toast";

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!token) {
            toast.error("Token de recuperação ausente ou inválido.");
            return;
        }

        if (password.length < 6) {
            toast.error("A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("As senhas não coincidem.");
            return;
        }

        try {
            setLoading(true);
            await api.post("/auth/reset-password", {
                token,
                newPassword: password
            });

            toast.success("Senha redefinida com sucesso! Faça login com sua nova senha.");
            router.push("/login");
        } catch (err: any) {
            console.error(err);
            toast.error("Erro ao redefinir senha. O link pode ter expirado.");
        } finally {
            setLoading(false);
        }
    }

    if (!token) {
        return (
            <div className="text-center p-4">
                <p className="text-danger mb-4">Link de redefinição inválido ou expirado.</p>
                <Link href="/forgot-password" style={{ color: "#0B5ED7", textDecoration: "underline" }}>
                    Solicitar novo link
                </Link>
            </div>
        );
    }

    return (
        <>
            <p className="login-sub">Crie uma nova senha para sua conta</p>
            <form onSubmit={onSubmit} className="login-form">
                <label className="login-field">
                    <span className="login-icon" aria-hidden>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                    </span>
                    <input
                        type="password"
                        placeholder="Nova senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                        type="password"
                        placeholder="Confirme a nova senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </label>

                <button className="login-btn" disabled={loading}>
                    {loading ? "Redefinindo..." : "Alterar senha"}
                </button>
            </form>
        </>
    );
}

export default function ResetPasswordPage() {
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

                <h1 className="login-title">Nova senha</h1>
                
                <Suspense fallback={<p className="text-center p-4">Carregando...</p>}>
                    <ResetPasswordContent />
                </Suspense>

                <div className="login-foot mt-3">
                    <Link href="/login">Voltar para o login</Link>
                </div>
            </div>
        </section>
    );
}
