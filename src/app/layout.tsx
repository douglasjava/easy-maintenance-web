import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import type { Metadata } from "next";
import Shell from "@/components/Shell";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
    title: "Easy Maintenance",
    description: "Manutenções regulatórias e operacionais",
    manifest: "/manifest.webmanifest",
    themeColor: "#0F172A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR">
        <body>
        <Providers>
            <Shell>{children}</Shell>
        </Providers>
        </body>
        </html>
    );
}
