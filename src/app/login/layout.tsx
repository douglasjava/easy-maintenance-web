import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Entrar na sua conta",
    description:
        "Acesse sua conta Easy Maintenance e gerencie suas manutenções preventivas com segurança.",
    robots: {
        index: true,
        follow: true,
    },
    alternates: {
        canonical: "https://easymaintenance.com.br/login",
    },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
