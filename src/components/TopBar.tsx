"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

type OrganizationItem = {
  organization: {
    id: string;
    name: string;
    code: string;
  };
};

import { User, Building, CreditCard, LogOut, ChevronDown } from "lucide-react";

export default function TopBar() {
  const router = useRouter();
  const { logout, isBlocked } = useAuth();
  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [currentOrgName, setCurrentOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("Usuário");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const adminToken = window.localStorage.getItem("adminToken");
    setIsAdmin(!!adminToken);

    if (adminToken) {
      // Se for admin privado, não precisamos carregar dados de usuário comum
      return;
    }

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
        console.error("Erro ao carregar organizações no TopBar:", err);
      }
    }

    fetchOrganizations();
  }, []);

  function handleLogout() {
    if (isAdmin) {
      window.localStorage.removeItem("adminToken");
      router.push("/private/login");
    } else {
      logout();
    }
  }

  async function handleSwitchOrg(item: OrganizationItem) {
    if (typeof window === "undefined") return;
    setLoading(true);

    try {
      const remember = !!window.localStorage.getItem("accessToken");
      const storage = remember ? window.localStorage : window.sessionStorage;

      storage.setItem("organizationCode", item.organization.code);
      storage.setItem("organizationName", item.organization.name);

      setCurrentOrgName(item.organization.name);
      toast.success(`Empresa alterada para: ${item.organization.name}`);
      
      // Forçar recarregamento da página para atualizar todos os contextos com o novo X-Org-Id
      window.location.reload();
    } catch (err) {
      toast.error("Erro ao trocar de empresa.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <nav className="navbar navbar-dark bg-dark sticky-top">
      <div className="container-fluid">
        <div className="d-flex align-items-center">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#appSidebar"
            aria-controls="appSidebar"
            aria-label="Abrir menu"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <span className="navbar-brand ms-2 d-none d-sm-inline">Painel</span>
        </div>

        <div className="d-flex align-items-center gap-2">
          {!isAdmin && organizations.length > 0 && (
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

          <div className="dropdown">
            <button 
              className="btn btn-link text-light d-flex align-items-center gap-2 text-decoration-none border-0 p-1"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <div 
                className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white"
                style={{ width: 34, height: 34, fontSize: '0.9rem', fontWeight: 600 }}
              >
                {isAdmin ? "A" : userName.charAt(0).toUpperCase()}
              </div>
              <div className="d-none d-lg-block text-start" style={{ lineHeight: 1.1 }}>
                <small className="d-block opacity-75" style={{ fontSize: '0.7rem' }}>{isAdmin ? "Administrador" : "Bem-vindo,"}</small>
                <span className="fw-medium" style={{ fontSize: '0.85rem' }}>{isAdmin ? "Global" : userName}</span>
              </div>
              <ChevronDown size={14} className="opacity-50" />
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2" style={{ minWidth: 200 }}>
              <li>
                <div className="px-3 py-2 d-lg-none">
                  <p className="mb-0 fw-bold">{isAdmin ? "Administrador Global" : userName}</p>
                  {!isAdmin && currentOrgName && <small className="text-muted">{currentOrgName}</small>}
                </div>
              </li>
              {!isAdmin && organizations.length > 0 && (
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
              {isAdmin ? (
                <>
                  <li>
                    <button className="dropdown-item d-flex align-items-center gap-2 py-2" onClick={() => router.push("/private/users")}>
                      <User size={18} className="text-muted" />
                      Usuarios
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
                </>
              ) : (
                <>
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
                </>
              )}
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger" onClick={handleLogout}>
                  <LogOut size={18} />
                  Sair
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
