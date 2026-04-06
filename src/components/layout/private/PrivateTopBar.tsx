"use client";

import { useRouter } from "next/navigation";
import { User, Building, CreditCard, LogOut } from "lucide-react";
import TopBarShell from "../shared/TopBarShell";
import TopBarBrand from "../shared/TopBarBrand";
import TopBarUserMenu from "../shared/TopBarUserMenu";

export default function PrivateTopBar() {
  const router = useRouter();

  function handleLogout() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("adminToken");
      router.push("/private/login");
    }
  }

  return (
    <TopBarShell>
      <TopBarBrand label="Admin Global" />

      <div className="d-flex align-items-center gap-2">
        <TopBarUserMenu 
          userName="Global" 
          roleLabel="Administrador" 
          avatarChar="A"
        >
          <li>
            <div className="px-3 py-2 d-lg-none">
              <p className="mb-0 fw-bold">Administrador Global</p>
            </div>
          </li>
          <li>
            <button className="dropdown-item d-flex align-items-center gap-2 py-2" onClick={() => router.push("/private/users")}>
              <User size={18} className="text-muted" />
              Usuários
            </button>
          </li>
          <li>
            <button className="dropdown-item d-flex align-items-center gap-2 py-2" onClick={() => router.push("/private/organizations")}>
              <Building size={18} className="text-muted" />
              Empresas
            </button>
          </li>
          <li>
            <button className="dropdown-item d-flex align-items-center gap-2 py-2" onClick={() => router.push("/private/admin/billing")}>
              <CreditCard size={18} className="text-muted" />
              Faturamento
            </button>
          </li>
          <li><hr className="dropdown-divider" /></li>
          <li>
            <button className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger" onClick={handleLogout}>
              <LogOut size={18} />
              Sair
            </button>
          </li>
        </TopBarUserMenu>
      </div>
    </TopBarShell>
  );
}
