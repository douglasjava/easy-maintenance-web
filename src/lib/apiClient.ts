import axios from "axios";
import { ENV } from "./env";

export const api = axios.create({ baseURL: ENV.API_BASE_URL });

api.interceptors.request.use((config) => {
    config.headers = config.headers ?? {};
    config.headers["X-Org-Id"] = ENV.ORG_ID;
    return config;
});
