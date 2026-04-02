import { api } from "@/lib/apiClient";

export type Organization = {
    id: string;
    code: string;
    name: string;
    doc: string;
    plan?: string;
    city?: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    state: string;
    zipCode: string;
    country: string;
    companyType: string;

};

export type PaginatedOrganizations = {
    content: Organization[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
};

export const adminOrganizationsService = {
    async list(params: { page?: number; size?: number; name?: string; doc?: string }): Promise<PaginatedOrganizations> {
        const { data } = await api.get("/private/admin/organizations", { params });
        return data;
    },

    async getById(id: string): Promise<Organization> {
        const { data } = await api.get(`/private/admin/organizations/${id}`);
        return data;
    },

    async create(payload: any): Promise<Organization> {
        const { data } = await api.post("/private/admin/organizations", payload);
        return data;
    },

    async update(id: string, payload: any): Promise<Organization> {
        const { data } = await api.put(`/private/admin/organizations/${id}`, payload);
        return data;
    }
};
