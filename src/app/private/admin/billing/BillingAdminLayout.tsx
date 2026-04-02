"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import AdminTabs from "@/components/admin/AdminTabs";

export default function BillingAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { id: "/private/admin/billing", label: "Visão Geral" },
    { id: "/private/admin/billing/subscriptions", label: "Assinaturas" },
    { id: "/private/admin/billing/invoices", label: "Faturas" },
    { id: "/private/admin/billing/plans", label: "Planos" },
  ];

  return (
    <section className="p-3">
      <PageHeader
        title="Faturamento"
        description="Gestão de faturamento, assinaturas e planos do sistema."
        backUrl="/private/dashboard"
      />

      <div className="card border-0 shadow-sm overflow-hidden mt-2">
        <div className="card-body p-4">
          <AdminTabs
            tabs={tabs}
            activeTab={pathname}
            onChange={(id) => router.push(id)}
          />
          <div className="mt-2">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
