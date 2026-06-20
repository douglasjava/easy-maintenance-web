import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Gestão de Manutenção Preventiva",
    description:
        "Software completo para gestão de manutenção preventiva. Conformidade ABNT, relatórios com evidências e controle de tarefas para condomínios, hospitais e escolas.",
    robots: {
        index: true,
        follow: true,
    },
    alternates: {
        canonical: "https://easymaintenance.com.br/landing",
    },
    openGraph: {
        title: "Gestão de Manutenção Preventiva | Easy Maintenance",
        description:
            "Elimine o caos das planilhas. Controle ativos, vencimentos e conformidade ABNT (NBR 5674, NBR 14037, NBR 16280) em uma única plataforma.",
        url: "https://easymaintenance.com.br/landing",
        images: [
            {
                url: "/dashboard_preview.png",
                width: 1200,
                height: 630,
                alt: "Dashboard do Easy Maintenance — visão geral de manutenções preventivas",
            },
        ],
    },
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
