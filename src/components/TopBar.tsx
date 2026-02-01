"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";

type Organization = {
  id: string;
  name: string;
  code: string;
};

export default function TopBar() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrgName, setCurrentOrgName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const orgName = window.localStorage.getItem("organizationName") || window.sessionStorage.getItem("organizationName");
    if (orgName) setCurrentOrgName(orgName);

    async function fetchOrganizations() {
      try {
        const userId = window.sessionStorage.getItem("userId") || window.localStorage.getItem("userId");
        if (!userId) return;

        const { data } = await api.get(`/auth/me/organizations/${userId}`);
        setOrganizations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro ao carregar organizações no TopBar:", err);
      }
    }

    fetchOrganizations();
  }, []);

  function handleLogout() {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("organizationCode");
        window.localStorage.removeItem("organizationName");
        window.localStorage.removeItem("accessToken");
        window.localStorage.removeItem("tokenType");
        window.localStorage.removeItem("userId");

        window.sessionStorage.removeItem("organizationCode");
        window.sessionStorage.removeItem("organizationName");
        window.sessionStorage.removeItem("accessToken");
        window.sessionStorage.removeItem("tokenType");
        window.sessionStorage.removeItem("userId");
      }
    } catch {}
    router.replace("/login");
  }

  async function handleSwitchOrg(org: Organization) {
    if (typeof window === "undefined") return;
    setLoading(true);

    try {
      const remember = !!window.localStorage.getItem("accessToken");
      const storage = remember ? window.localStorage : window.sessionStorage;

      storage.setItem("organizationCode", org.code);
      storage.setItem("organizationName", org.name);

      setCurrentOrgName(org.name);
      toast.success(`Empresa alterada para: ${org.name}`);
      
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

        <div className="d-flex align-items-center gap-3">
          {organizations.length > 0 && (
            <div className="dropdown">
              <button 
                className="btn btn-sm btn-outline-light dropdown-toggle" 
                type="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
                disabled={loading}
              >
                Empresa: {currentOrgName || "Selecionar..."}
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow">
                <li><h6 className="dropdown-header">Minhas Empresas</h6></li>
                {organizations.map((org) => (
                  <li key={org.id}>
                    <button 
                      className={`dropdown-item ${org.name === currentOrgName ? 'active' : ''}`}
                      onClick={() => handleSwitchOrg(org)}
                    >
                      {org.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button className="btn btn-sm btn-outline-light" onClick={handleLogout} title="Sair">
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}
