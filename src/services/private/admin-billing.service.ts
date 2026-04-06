import { api } from "@/lib/apiClient";

export const adminBillingService = {
    async getSummary() {
        const { data } = await api.get("/private/admin/billing/summary");
        return data;
    },

    async listSubscriptions(params: any) {
        const { data } = await api.get("/private/admin/billing/subscriptions", { params });
        return data;
    },

    async listInvoices(params: any) {
        const { data } = await api.get("/private/admin/billing/invoices", { params });
        return data;
    },

    async listPlans() {
        const { data } = await api.get("/private/admin/billing/plans");
        return data;
    },

    async getUserSubscription(userId: string) {
        const { data } = await api.get(`/private/admin/billing/user/${userId}/subscription`);
        return data;
    },

    async updateUserSubscription(userIdOrOrgCode: string, payload: any) {
        // userIdOrOrgCode pode ser o ID do usuário ou o CODE da organização dependendo do contexto
        const url = isNaN(Number(userIdOrOrgCode)) 
            ? `/private/admin/billing/organizations/${userIdOrOrgCode}/subscription`
            : `/private/admin/billing/user/${userIdOrOrgCode}/subscription`;
            
        const { data } = await api.put(url, payload);
        return data;
    },

    async getUserAccount(userId: string) {
        const { data } = await api.get(`/private/admin/billing/users/${userId}/account`);
        return data;
    },

    async updateUserAccount(userId: string, payload: any) {
        const { data } = await api.put(`/private/admin/billing/users/${userId}/account`, payload);
        return data;
    },

    async generateInvoices(payload: any) {
        const { data } = await api.post("/private/admin/billing/invoices/generate", payload);
        return data;
    },

    async listAccounts(params: any) {
        const { data } = await api.get("/private/admin/billing/accounts", { params });
        return data;
    }
};
