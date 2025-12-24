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
      const storedOrg = window.localStorage.getItem("organizationCode");
      if (storedOrg) orgFromLogin = storedOrg;
      const storedToken = window.localStorage.getItem("accessToken");
      if (storedToken) accessToken = storedToken;
      const storedType = window.localStorage.getItem("tokenType");
      if (storedType) tokenType = storedType;
    } catch {
      // ignore erros de acesso ao localStorage
    }
  }

  const orgId = orgFromLogin || ENV.ORG_ID;
  if (orgId) {
    config.headers["X-Org-Id"] = orgId;
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
          window.localStorage.removeItem("organizationCode");
          window.localStorage.removeItem("accessToken");
          window.localStorage.removeItem("tokenType");
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
