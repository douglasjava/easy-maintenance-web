import axios from "axios";
import { ENV } from "./env";

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

export const api = axios.create({ baseURL: buildApiBaseURL() });

api.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};

  // Normaliza URLs para preservar o basePath: remove barra inicial de URLs relativas
  if (config.url && !/^https?:\/\//i.test(config.url)) {
    config.url = config.url.replace(/^\/+/, "");
  }

  // Tenta ler o organizationCode salvo após login
  let orgFromLogin: string | undefined;
  let accessToken: string | undefined;
  let tokenType: string | undefined;
  if (typeof window !== "undefined") {
    try {
      const ls = window.localStorage;
      const ss = window.sessionStorage;

      const storedOrg = ls.getItem("organizationCode") || ss.getItem("organizationCode");
      if (storedOrg) orgFromLogin = storedOrg;

      const storedToken = ls.getItem("accessToken") || ss.getItem("accessToken");
      if (storedToken) accessToken = storedToken;

      const storedType = ls.getItem("tokenType") || ss.getItem("tokenType");
      if (storedType) tokenType = storedType;
    } catch {
      // ignore erros de acesso ao storage
    }
  }

  const orgId = orgFromLogin || ENV.ORG_ID;
  if (orgId) {
    config.headers["X-Org-Id"] = orgId;
  }

  // Admin token para área privativa
  if (typeof window !== "undefined") {
    const adminToken = window.localStorage.getItem("adminToken");
    if (adminToken) {
      config.headers["X-Admin-Token"] = adminToken;
    }
  }

  if (accessToken) {
    const type = tokenType || "Bearer";
    (config.headers as any)["Authorization"] = `${type} ${accessToken}`;
  }

  return config;
});

// Interceptor de resposta para lidar com sessão expirada (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      if (typeof window !== "undefined") {
        try {
          // limpa Local Storage
          window.localStorage.removeItem("organizationCode");
          window.localStorage.removeItem("accessToken");
          window.localStorage.removeItem("tokenType");
          // limpa Session Storage
          window.sessionStorage.removeItem("organizationCode");
          window.sessionStorage.removeItem("accessToken");
          window.sessionStorage.removeItem("tokenType");
        } catch {}
        // Redireciona para login
        const currentPath = window.location.pathname || "";
        if (!currentPath.endsWith("/login")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);
