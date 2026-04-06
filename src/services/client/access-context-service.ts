import { api } from "@/lib/apiClient";
import { AccessContextResponse } from "@/types/access-context";

export const accessContextService = {
  async getAccessContext(organizationId?: string): Promise<AccessContextResponse> {
    const headers: Record<string, string> = {};
    if (organizationId) {
      headers["X-Org-Id"] = organizationId;
    }
    const { data } = await api.get<AccessContextResponse>("/me/access-context", { headers });
    return data;
  },
};
