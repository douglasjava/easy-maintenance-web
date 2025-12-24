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
  // Tenta ler o organizationCode salvo após login
  let orgFromLogin: string | undefined;
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem("organizationCode");
      if (stored) orgFromLogin = stored;
    } catch {
      // ignore erros de acesso ao localStorage
    }
  }

  const orgId = orgFromLogin || ENV.ORG_ID;
  if (orgId) {
    config.headers["X-Org-Id"] = orgId;
  }
  return config;
});
