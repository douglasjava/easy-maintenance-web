import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import ObrigadoContent from "./ObrigadoContent";

export const metadata: Metadata = {
    title: "Obrigado pelo contato",
    description: "Recebemos sua solicitação de demonstração do Easy Maintenance.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function ObrigadoPage() {
    return (
        <>
            <nav className="navbar navbar-light bg-white sticky-top shadow-sm">
                <div className="container">
                    <Link href="/landing" className="navbar-brand mb-0">
                        <Logo />
                    </Link>
                </div>
            </nav>
            <div className="container py-5 text-center" style={{ maxWidth: 640 }}>
                <ObrigadoContent />
                <div className="mt-5 pt-3 border-top">
                    <Link href="/landing" className="btn btn-outline-secondary btn-sm">
                        ← Voltar para o site
                    </Link>
                </div>
            </div>
        </>
    );
}
