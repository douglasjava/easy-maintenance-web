import { api } from "@/lib/apiClient";

export type AdminMetrics = {
    totalOrganizations: number;
    totalUsers: number;
    organizationsByPlan: {
        STARTER: number;
        BUSINESS: number;
        ENTERPRISE: number;
    };
};

export const adminDashboardService = {
    async getMetrics(): Promise<AdminMetrics> {
        const { data } = await api.get("/private/admin/metrics");
        return data;
    }
};
