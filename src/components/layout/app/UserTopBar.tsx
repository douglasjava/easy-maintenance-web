"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { User, Building, CreditCard, LogOut, HelpCircle } from "lucide-react";
import TopBarShell from "../shared/TopBarShell";
import TopBarBrand from "../shared/TopBarBrand";
import TopBarUserMenu from "../shared/TopBarUserMenu";
import NotificationBell from "@/components/NotificationBell";

type OrganizationItem = {
  organization: {
    id: string;
    name: string;
    code: string;
  };
};

export default function UserTopBar() {
  const router = useRouter();
  const { logout, isBlocked } = useAuth();
  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [currentOrgName, setCurrentOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("Usuário");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const orgName = window.localStorage.getItem("organizationName") || window.sessionStorage.getItem("organizationName");
    if (orgName) setCurrentOrgName(orgName);

    const storedUserName = window.localStorage.getItem("userName") || window.sessionStorage.getItem("userName");
    if (storedUserName) setUserName(storedUserName);

    async function fetchOrganizations() {
      try {
        const userId = window.sessionStorage.getItem("userId") || window.localStorage.getItem("userId");
        if (!userId) return;

        const { data } = await api.get(`/organizations/me/${userId}`);
        setOrganizations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro ao carregar organizações no UserTopBar:", err);
      }
    }

    fetchOrganizations();
  }, []);

  async function handleSwitchOrg(item: OrganizationItem) {
    if (typeof window === "undefined") return;
    setLoading(true);

    try {
      const remember = !!window.localStorage.getItem("isLoggedIn");
      const storage = remember ? window.localStorage : window.sessionStorage;

      storage.setItem("organizationCode", item.organization.code);
      storage.setItem("organizationName", item.organization.name);

      setCurrentOrgName(item.organization.name);
      toast.success(`Empresa alterada para: ${item.organization.name}`);
      
      window.location.reload();
    } catch (err) {
      toast.error("Erro ao trocar de empresa.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <TopBarShell>
      <TopBarBrand label="Painel" />

      <div className="d-flex align-items-center gap-2">
        <NotificationBell />

        {organizations.length > 0 && (
          <div className="dropdown">
            <button 
              className="btn btn-sm btn-outline-light dropdown-toggle border-0" 
              type="button" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
              disabled={loading}
            >
              <Building size={18} className="me-1" />
              <span className="d-none d-sm-inline">{currentOrgName || "Selecionar..."}</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow border-0">
              <li><h6 className="dropdown-header">Minhas Empresas</h6></li>
              {organizations.map((item) => (
                <li key={item.organization.id}>
                  <button 
                    className={`dropdown-item ${item.organization.name === currentOrgName ? 'active' : ''}`}
                    onClick={() => handleSwitchOrg(item)}
                    disabled={isBlocked}
                  >
                    {item.organization.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <TopBarUserMenu 
          userName={userName} 
          roleLabel="Bem-vindo," 
          avatarChar={userName.charAt(0).toUpperCase()}
        >
          <li>
            <div className="px-3 py-2 d-lg-none">
              <p className="mb-0 fw-bold">{userName}</p>
              {currentOrgName && <small className="text-muted">{currentOrgName}</small>}
            </div>
          </li>
          {organizations.length > 0 && (
            <li className="d-md-none">
              <h6 className="dropdown-header text-uppercase small fw-bold">Trocar Empresa</h6>
              {organizations.map((item) => (
                <button 
                  key={item.organization.id}
                  className={`dropdown-item d-flex align-items-center gap-2 ${item.organization.name === currentOrgName ? 'active' : ''}`}
                  onClick={() => handleSwitchOrg(item)}
                >
                  <Building size={16} />
                  {item.organization.name}
                </button>
              ))}
              <hr className="dropdown-divider" />
            </li>
          )}
          <li>
            <button className="dropdown-item d-flex align-items-center gap-2 py-2" onClick={() => router.push("/profile")} disabled={isBlocked}>
              <User size={18} className="text-muted" />
              Minha conta
            </button>
          </li>
          <li>
            <button className="dropdown-item d-flex align-items-center gap-2 py-2" onClick={() => router.push("/organizations")} disabled={isBlocked}>
              <Building size={18} className="text-muted" />
              Minhas Empresas
            </button>
          </li>
          <li>
            <button className="dropdown-item d-flex align-items-center gap-2 py-2" onClick={() => router.push("/billing")}>
              <CreditCard size={18} className="text-muted" />
              Faturamento
            </button>
          </li>
          <li>
            <button className="dropdown-item d-flex align-items-center gap-2 py-2" onClick={() => router.push("/help")} disabled={isBlocked}>
              <HelpCircle size={18} className="text-muted" />
              Ajuda / FAQ
            </button>
          </li>
          <li><hr className="dropdown-divider" /></li>
          <li>
            <button className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger" onClick={() => logout()}>
              <LogOut size={18} />
              Sair
            </button>
          </li>
        </TopBarUserMenu>
      </div>
    </TopBarShell>
  );
}
