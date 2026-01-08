"use client";

import Link from "next/link";
import Logo from "./Logo";
import {useRouter, usePathname} from "next/navigation";

const COLORS = {
    primary: "#0B5ED7",
    primaryDark: "#083B7A",
    accent: "#F59E0B",
    bg: "#F3F4F6",
    white: "#FFFFFF",
};

type NavItem = {
    href: string;
    label: string;
    section?: "main" | "actions" | "admin";
};

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();

    function closeOffcanvas() {
        try {
            const el = document.getElementById("appSidebar");
            const bs = (window as any).bootstrap;
            if (el && bs?.Offcanvas) {
                const instance = bs.Offcanvas.getInstance(el) || new bs.Offcanvas(el);
                instance?.hide();
            }
        } catch {
        }
    }

    function handleNavigate(e: React.MouseEvent, href: string) {
        e.preventDefault();
        closeOffcanvas();
        router.push(href);
    }

    const items: NavItem[] = [
        {href: "/", label: "Dashboard", section: "main"},
        {href: "/items", label: "Itens", section: "main"},
        {href: "/maintenances", label: "Manutenções", section: "main"},

        {href: "/items/new", label: "Novo Item", section: "actions"},
        {href: "/maintenances/new", label: "Registrar Manutenção", section: "actions"},

        {href: "/organizations/new", label: "Nova Organização", section: "admin"},
        {href: "/users/new", label: "Cadastro de Usuário", section: "admin"},
    ];

    function isActive(href: string) {
        if (href === "/") return pathname === "/";
        return pathname?.startsWith(href);
    }

    function SectionTitle({children}: { children: React.ReactNode }) {
        return (
            <div
                className="px-3 pt-2 pb-1 text-uppercase small fw-semibold"
                style={{color: "#6B7280", letterSpacing: "0.06em"}}
            >
                {children}
            </div>
        );
    }

    function NavLink({href, label}: { href: string; label: string }) {
        const active = isActive(href);

        return (
            <Link
                href={href}
                onClick={(e) => handleNavigate(e, href)}
                data-bs-dismiss="offcanvas"
                className="nav-link d-flex align-items-center justify-content-between px-3 py-2 rounded"
                style={{
                    color: active ? COLORS.primaryDark : "#111827",
                    backgroundColor: active ? "rgba(11, 94, 215, 0.10)" : "transparent",
                    borderLeft: active ? `3px solid ${COLORS.primary}` : "3px solid transparent",
                }}
                aria-current={active ? "page" : undefined}
            >
                <span className="fw-medium">{label}</span>

                {/* detalhe sutil de "ativo" (accent somente para indicar foco) */}
                {active ? (
                    <span
                        aria-hidden
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: 999,
                            backgroundColor: COLORS.accent,
                            display: "inline-block",
                        }}
                    />
                ) : null}
            </Link>
        );
    }

    return (
        <div
            className="offcanvas offcanvas-start"
            tabIndex={-1}
            id="appSidebar"
            aria-labelledby="appSidebarLabel"
            style={{
                backgroundColor: COLORS.white,
                width: 320,
            }}
        >
            <div className="offcanvas-header border-bottom" style={{borderColor: "rgba(0,0,0,0.06)"}}>
                <div className="d-flex align-items-center gap-2" id="appSidebarLabel">
                    <Logo/>
                </div>

                <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="offcanvas"
                    aria-label="Fechar"
                />
            </div>

            <div className="offcanvas-body d-flex flex-column p-0">
                {/* Fundo leve na área de navegação */}
                <div className="px-2 py-2" style={{backgroundColor: COLORS.bg}}>
                    <SectionTitle>Principal</SectionTitle>
                    <nav className="nav flex-column gap-1">
                        {items
                            .filter((i) => i.section === "main")
                            .map((i) => (
                                <NavLink key={i.href} href={i.href} label={i.label}/>
                            ))}
                    </nav>

                    <div className="mt-2"/>

                    <SectionTitle>Ações</SectionTitle>
                    <nav className="nav flex-column gap-1">
                        {items
                            .filter((i) => i.section === "actions")
                            .map((i) => (
                                <NavLink key={i.href} href={i.href} label={i.label}/>
                            ))}
                    </nav>

                    <div className="mt-2"/>

                    <SectionTitle>Admin</SectionTitle>
                    <nav className="nav flex-column gap-1">
                        {items
                            .filter((i) => i.section === "admin")
                            .map((i) => (
                                <NavLink key={i.href} href={i.href} label={i.label}/>
                            ))}
                    </nav>
                </div>

                {/* rodapé */}
                <div className="mt-auto px-3 py-3 border-top" style={{borderColor: "rgba(0,0,0,0.06)"}}>
                    <div className="d-flex align-items-center justify-content-between">
                        <span className="small text-muted">Easy Maintenance</span>
                        <span className="small" style={{color: COLORS.primaryDark}}>
              v0 • MVP
            </span>
                    </div>

                    {/* dica sutil de IA */}
                    <div className="small mt-2" style={{color: "#6B7280"}}>
                        🤖 Dica: use o <span style={{color: COLORS.primary}}>SAMU</span> para tirar dúvidas e encontrar
                        prazos.
                    </div>
                </div>
            </div>
        </div>
    );
}