import { api } from "@/lib/apiClient";

export type AdminUser = {
    id: string;
    name: string;
    email: string;
    status: string;
    role: string;
    organizationCodes?: string[];
};

export type UserOrganization = {
    organization: {
        id: string;
        code: string;
        name: string;
        doc: string;
    };
    subscription: {
        id: string;
        sourceId: string;
        sourceType: string;
        planCode: string;
        planName: string;
        valueCents: string;
        status: string;
        currentPeriodStart: string;
        currentPeriodEnd: string;
    };
};

export type PaginatedUsers = {
    content: AdminUser[];
    totalPages: number;
    totalElements: number;
};

export const adminUsersService = {
    async list(params: { page?: number; size?: number }): Promise<PaginatedUsers> {
        const { data } = await api.get("/private/admin/users", { params });
        return data;
    },

    async getById(id: string): Promise<AdminUser> {
        const { data } = await api.get(`/private/admin/users/${id}`);
        return data;
    },

    async update(id: string, payload: any): Promise<AdminUser> {
        const { data } = await api.put(`/private/admin/users/${id}`, payload);
        return data;
    },

    async listOrganizations(userId: string): Promise<UserOrganization[]> {
        const { data } = await api.get(`/private/admin/users/${userId}/organizations`);
        return data || [];
    },

    async linkOrganization(userId: string, orgCode: string): Promise<void> {
        await api.post(`/private/admin/users/${userId}/organizations/${orgCode}`);
    },

    async unlinkOrganization(userId: string, orgCode: string): Promise<void> {
        await api.delete(`/private/admin/users/${userId}/organizations/${orgCode}`);
    },

    async resetPassword(userId: string): Promise<void> {
        await api.post(`/private/admin/users/${userId}/reset-password`);
    }
};
