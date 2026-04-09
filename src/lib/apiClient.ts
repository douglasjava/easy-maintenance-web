import axios from "axios";
import { ENV } from "./env";
import toast from "react-hot-toast";

function buildApiBaseURL() {
  const rawBase = (ENV.API_BASE_URL || "").replace(/\/+$/, ""); // remove barras ao fim
  let rawPath = (ENV.API_BASE_PATH || "").trim();
  if (!rawPath) rawPath = "/";
  // garante exatamente uma barra no início e nenhuma no fim
  rawPath = `/${rawPath.replace(/^\/+/, "").replace(/\/+$/, "")}`;

  // Se não houver domínio configurado, use apenas o path (servirá relativo ao origin atual)
  if (!rawBase) return rawPath;
  return `${rawBase}${rawPath}`;
}

export const api = axios.create({ baseURL: buildApiBaseURL(), withCredentials: true });

api.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};

  // Normaliza URLs para preservar o basePath: remove barra inicial de URLs relativas
  if (config.url && !/^https?:\/\//i.test(config.url)) {
    config.url = config.url.replace(/^\/+/, "");
  }

  // Tenta ler o organizationCode salvo após login
  let orgFromLogin: string | undefined;
  if (typeof window !== "undefined") {
    try {
      const storedOrg = window.localStorage.getItem("organizationCode") || window.sessionStorage.getItem("organizationCode");
      if (storedOrg) orgFromLogin = storedOrg;
    } catch {
      // ignore erros de acesso ao storage
    }
  }

  const orgId = orgFromLogin || ENV.ORG_ID;
  if (orgId) {
    config.headers["X-Org-Id"] = orgId;
  } else {
    delete config.headers["X-Org-Id"];
  }

  // Admin token para área privativa
  if (typeof window !== "undefined" && !config.headers["X-Skip-Interceptor-Admin-Token"]) {
    const adminToken = window.localStorage.getItem("adminToken");
    if (adminToken) {
      config.headers["X-Admin-Token"] = adminToken;
    }
  }

  delete config.headers["X-Skip-Interceptor-Admin-Token"];

  return config;
});

// Interceptor de resposta para lidar com sessão expirada ou falta de permissão (401/403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const detail = error?.response?.data?.detail;

    if (status === 403 && detail) {
      toast.error(detail);
    }

    if (status === 401 || (status === 403 && !detail)) {
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname || "";
        const isPrivate = currentPath.startsWith("/private");

        if (isPrivate) {
          // Área privativa: limpar apenas o token de admin e redirecionar para /private/login
          try {
            window.localStorage.removeItem("adminToken");
          } catch {}

          if (!currentPath.endsWith("/private/login")) {
            window.location.href = "/private/login";
          }
        } else {
          // Aplicação convencional: limpar flags de sessão e redirecionar para /login
          try {
            ["localStorage", "sessionStorage"].forEach(storeName => {
              const s = (window as any)[storeName];
              s.removeItem("isLoggedIn");
              s.removeItem("organizationCode");
              s.removeItem("userId");
              s.removeItem("userName");
            });
          } catch {}

          if (!currentPath.endsWith("/login")) {
            window.location.href = "/login";
          }
        }
      }
    }
    return Promise.reject(error);
  }
);
