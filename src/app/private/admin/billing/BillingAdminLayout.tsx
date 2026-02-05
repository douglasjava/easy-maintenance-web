"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const COLORS = {
  primary: "#0B5ED7",
  primaryDark: "#083B7A",
  bg: "#F3F4F6",
};

interface BillingAdminLayoutProps {
  children: React.ReactNode;
}

export default function BillingAdminLayout({ children }: BillingAdminLayoutProps) {
  const pathname = usePathname();

  const tabs = [
    { label: "Visão Geral", href: "/private/admin/billing" },
    { label: "Assinaturas", href: "/private/admin/billing/subscriptions" },
    { label: "Faturas", href: "/private/admin/billing/invoices" },
    { label: "Planos", href: "/private/admin/billing/plans" },
  ];

  const isActive = (href: string) => {
    if (href === "/private/admin/billing") {
      return pathname === "/private/admin/billing";
    }
    return pathname.startsWith(href);
  };

  return (
    <section style={{ backgroundColor: COLORS.bg }} className="p-3 min-vh-100">
      {/* HEADER */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="h4 m-0" style={{ color: COLORS.primaryDark }}>
            Faturamento
          </h1>
          <p className="text-muted mt-1 mb-0">
            Gestão de faturamento, assinaturas e planos do sistema.
          </p>
        </div>

        <Link className="btn btn-outline-secondary btn-sm" href="/private/dashboard">
          ← Voltar para Dashboard
        </Link>
      </div>

      <ul className="nav nav-tabs border-0 mb-0">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <li className="nav-item" key={tab.href}>
              <Link
                href={tab.href}
                className={`nav-link border-0 ${active ? "active fw-bold" : "text-muted"}`}
                style={{
                  backgroundColor: active ? "#FFFFFF" : "transparent",
                  color: active ? COLORS.primary : undefined,
                  borderRadius: "8px 8px 0 0",
                  padding: "10px 20px",
                }}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="card border-0 shadow-sm" style={{ borderRadius: "0 8px 8px 8px" }}>
        <div className="card-body p-4">{children}</div>
      </div>
    </section>
  );
}
