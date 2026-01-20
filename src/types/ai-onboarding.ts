export type CompanyType = 'CONDOMINIUM' | 'HOSPITAL' | 'SCHOOL' | 'INDUSTRY' | 'OFFICE';

export const COMPANY_TYPE_MAP: Record<CompanyType, string> = {
    CONDOMINIUM: "CONDOMINIO",
    HOSPITAL: "HOSPITAL",
    SCHOOL: "ESCOLA",
    INDUSTRY: "INDUSTRIA",
    OFFICE: "ESCRITORIO"
};

export interface AiBootstrapPreviewRequest {
    companyType: CompanyType;
    description?: string;
}

export interface AiMaintenancePreview {
    norm: string;
    periodUnit: string;
    periodQty: number;
    toleranceDays: number;
    notes: string;
}

export interface AiItemPreview {
    itemType: string;
    category: string;
    criticality: string;
    maintenance: AiMaintenancePreview;
}

export interface AiBootstrapPreviewResponse {
    usedAi: boolean;
    companyType: string;
    items: AiItemPreview[];
}
