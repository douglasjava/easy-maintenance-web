import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import type { Metadata, Viewport } from "next";
import Shell from "@/components/Shell";
import Providers from "@/components/Providers";
import FcmHandler from "@/components/messaging/FcmHandler";

export const viewport: Viewport = {
    themeColor: "#0F172A",
};

export const metadata: Metadata = {
    metadataBase: new URL("https://easymaintenance.com.br"),
    title: {
        default: "Easy Maintenance | Gestão de Manutenção Preventiva",
        template: "%s | Easy Maintenance",
    },
    description:
        "Software de manutenção preventiva para condomínios, hospitais e escolas. Conformidade com NBR 5674, NBR 14037 e NBR 16280.",
    manifest: "/manifest.webmanifest",
    openGraph: {
        type: "website",
        locale: "pt_BR",
        url: "https://easymaintenance.com.br",
        siteName: "Easy Maintenance",
        images: [
            {
                url: "/dashboard_preview.png",
                width: 1200,
                height: 630,
                alt: "Easy Maintenance — Plataforma de Gestão de Manutenção Preventiva",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        images: ["/dashboard_preview.png"],
    },
    robots: {
        index: true,
        follow: true,
    },
    alternates: {
        canonical: "https://easymaintenance.com.br",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
        <body>
        <Providers>
            <FcmHandler />
            <Shell>{children}</Shell>
        </Providers>
        </body>
        </html>
    );
}
