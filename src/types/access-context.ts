export type AccessMode = "READ_ONLY" | "READ_WRITE";

export interface PlanSummary {
  code: string;
  name: string;
}

export interface BillingPlanFeatures {
  maxItems: number;
  maxUsers: number;
  aiEnabled: boolean;
  supportLevel: string;
  reportsEnabled: boolean;
  aiMonthlyCredits: number;
  maxOrganizations: number;
  emailMonthlyLimit: number;
}

export interface AccountPermissions {
  canViewOrganizations: boolean;
  canCreateOrganization: boolean;
  canManageOwnBilling: boolean;
}

export interface OrganizationPermissions {
  canReadDashboard: boolean;
  canCreateItem: boolean;
  canEditItem: boolean;
  canDeleteItem: boolean;
  canRegisterMaintenance: boolean;
  canManageOrganizationUsers: boolean;
  canUpdateOrganization: boolean;
  canManageOrganizationBilling: boolean;
}

export interface AccountAccess {
  subscriptionStatus: string;
  accessMode: AccessMode;
  message: string;
  plan: PlanSummary;
  permissions: AccountPermissions;
  features: BillingPlanFeatures;
}

export interface OrganizationAccess {
  organizationCode: string;
  organizationName: string;
  subscriptionStatus: string;
  accessMode: AccessMode;
  message: string;
  plan: PlanSummary;
  permissions: OrganizationPermissions;
  features: BillingPlanFeatures;
}

export interface AccessContextResponse {
  user: {
    id: number;
    name: string;
  };
  accountAccess: AccountAccess;
  organizationsAccess: OrganizationAccess[];
}
