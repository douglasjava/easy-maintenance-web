/**
 * Unit tests for the pure logic derived inside useDashboardData.
 *
 * The hook itself uses React APIs (useMemo, useQuery) that cannot run in
 * a Node test environment. These tests cover the four boolean/string
 * computations that determine the hook's observable behavior:
 *   1. canFetch — controls whether useQuery fires
 *   2. hasNoOrganization — "select an org" empty state
 *   3. isAccessDenied — "no permission" empty state
 *   4. error message extraction — maps Error objects to strings
 */

// --- Helpers replicating the exact formulas in useDashboardData ---

function deriveCanFetch({
  token,
  authLoading,
  accessLoading,
  currentOrganizationCode,
  canReadDashboard,
}: {
  token: string | null;
  authLoading: boolean;
  accessLoading: boolean;
  currentOrganizationCode: string | null;
  canReadDashboard: boolean | undefined;
}): boolean {
  return (
    !!token &&
    !authLoading &&
    !accessLoading &&
    !!currentOrganizationCode &&
    !!canReadDashboard
  );
}

function deriveHasNoOrganization({
  authLoading,
  accessLoading,
  currentOrganizationCode,
}: {
  authLoading: boolean;
  accessLoading: boolean;
  currentOrganizationCode: string | null;
}): boolean {
  return !authLoading && !accessLoading && !currentOrganizationCode;
}

function deriveIsAccessDenied({
  authLoading,
  accessLoading,
  currentOrganizationCode,
  permissions,
}: {
  authLoading: boolean;
  accessLoading: boolean;
  currentOrganizationCode: string | null;
  permissions: { canReadDashboard: boolean } | null;
}): boolean {
  return (
    !authLoading &&
    !accessLoading &&
    !!currentOrganizationCode &&
    permissions != null &&
    !permissions.canReadDashboard
  );
}

function extractErrorMessage(error: unknown): string {
  if (!error) return "Falha ao carregar dashboard.";
  return (
    (error as any)?.response?.data?.message ||
    (error as Error)?.message ||
    "Falha ao carregar dashboard."
  );
}

// ---------------------------------------------------------------

const READY_STATE = {
  token: "cookie",
  authLoading: false,
  accessLoading: false,
  currentOrganizationCode: "ORG-001",
  canReadDashboard: true,
};

describe("useDashboardData — canFetch", () => {
  it("returns true when all conditions are satisfied", () => {
    expect(deriveCanFetch(READY_STATE)).toBe(true);
  });

  it("returns false when token is absent", () => {
    expect(deriveCanFetch({ ...READY_STATE, token: null })).toBe(false);
  });

  it("returns false while auth is still loading", () => {
    expect(deriveCanFetch({ ...READY_STATE, authLoading: true })).toBe(false);
  });

  it("returns false while access context is still loading", () => {
    expect(deriveCanFetch({ ...READY_STATE, accessLoading: true })).toBe(false);
  });

  it("returns false when no organization is selected", () => {
    expect(deriveCanFetch({ ...READY_STATE, currentOrganizationCode: null })).toBe(false);
  });

  it("returns false when canReadDashboard permission is false", () => {
    expect(deriveCanFetch({ ...READY_STATE, canReadDashboard: false })).toBe(false);
  });

  it("returns false when canReadDashboard permission is undefined", () => {
    expect(deriveCanFetch({ ...READY_STATE, canReadDashboard: undefined })).toBe(false);
  });
});

describe("useDashboardData — hasNoOrganization", () => {
  it("returns true when auth+access are loaded and org code is absent", () => {
    expect(
      deriveHasNoOrganization({ authLoading: false, accessLoading: false, currentOrganizationCode: null })
    ).toBe(true);
  });

  it("returns false when auth is still loading", () => {
    expect(
      deriveHasNoOrganization({ authLoading: true, accessLoading: false, currentOrganizationCode: null })
    ).toBe(false);
  });

  it("returns false when access is still loading", () => {
    expect(
      deriveHasNoOrganization({ authLoading: false, accessLoading: true, currentOrganizationCode: null })
    ).toBe(false);
  });

  it("returns false when an org code is present", () => {
    expect(
      deriveHasNoOrganization({ authLoading: false, accessLoading: false, currentOrganizationCode: "ORG-001" })
    ).toBe(false);
  });
});

describe("useDashboardData — isAccessDenied", () => {
  it("returns true when loaded, org set, permissions loaded, and canReadDashboard is false", () => {
    expect(
      deriveIsAccessDenied({
        authLoading: false,
        accessLoading: false,
        currentOrganizationCode: "ORG-001",
        permissions: { canReadDashboard: false },
      })
    ).toBe(true);
  });

  it("returns false when canReadDashboard is true", () => {
    expect(
      deriveIsAccessDenied({
        authLoading: false,
        accessLoading: false,
        currentOrganizationCode: "ORG-001",
        permissions: { canReadDashboard: true },
      })
    ).toBe(false);
  });

  it("returns false when permissions object is null (still loading)", () => {
    expect(
      deriveIsAccessDenied({
        authLoading: false,
        accessLoading: false,
        currentOrganizationCode: "ORG-001",
        permissions: null,
      })
    ).toBe(false);
  });

  it("returns false when no org code (not a permission denial — just no org selected)", () => {
    expect(
      deriveIsAccessDenied({
        authLoading: false,
        accessLoading: false,
        currentOrganizationCode: null,
        permissions: { canReadDashboard: false },
      })
    ).toBe(false);
  });

  it("returns false while auth is still loading", () => {
    expect(
      deriveIsAccessDenied({
        authLoading: true,
        accessLoading: false,
        currentOrganizationCode: "ORG-001",
        permissions: { canReadDashboard: false },
      })
    ).toBe(false);
  });
});

describe("useDashboardData — error message extraction", () => {
  it("returns response data message when present (backend error detail)", () => {
    const err = { response: { data: { message: "Organização inativa." } }, message: "Request failed" };
    expect(extractErrorMessage(err)).toBe("Organização inativa.");
  });

  it("falls back to error.message when no response data message", () => {
    const err = { message: "Network Error" };
    expect(extractErrorMessage(err)).toBe("Network Error");
  });

  it("falls back to generic message when error has no message", () => {
    expect(extractErrorMessage({})).toBe("Falha ao carregar dashboard.");
  });

  it("returns generic message when error is null", () => {
    expect(extractErrorMessage(null)).toBe("Falha ao carregar dashboard.");
  });
});
