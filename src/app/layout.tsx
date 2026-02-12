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
    title: "Easy Maintenance",
    description: "Manutenções regulatórias e operacionais",
    manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR">
        <body>
        <Providers>
            <FcmHandler />
            <Shell>{children}</Shell>
        </Providers>
        </body>
        </html>
    );
}
