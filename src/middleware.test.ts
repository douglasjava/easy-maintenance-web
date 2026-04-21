/**
 * Tests for middleware.ts — Edge auth guard.
 *
 * Strategy: mock next/server so the module runs in the Jest (Node) environment.
 * We verify routing decisions (redirect vs next) for each path category.
 */

import { middleware } from "./middleware";

// ---------------------------------------------------------------------------
// Minimal next/server mock
// ---------------------------------------------------------------------------

const mockRedirect = jest.fn();
const mockNext = jest.fn();

jest.mock("next/server", () => ({
  NextResponse: {
    redirect: (url: URL) => {
      mockRedirect(url.pathname);
      return { type: "redirect", destination: url.pathname };
    },
    next: () => {
      mockNext();
      return { type: "next" };
    },
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(pathname: string, hasCookie: boolean) {
  return {
    nextUrl: { pathname },
    url: "http://localhost:3000" + pathname,
    cookies: {
      get: (name: string) => (name === "accessToken" && hasCookie ? { value: "tok" } : undefined),
    },
  } as any;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  mockRedirect.mockClear();
  mockNext.mockClear();
});

describe("middleware — public paths", () => {
  const publicPaths = [
    "/login",
    "/login/callback",
    "/landing",
    "/landing/features",
    "/forgot-password",
    "/reset-password",
    "/onboarding",
    "/onboarding/step2",
    "/ai-onboarding",
    "/select-organization",
  ];

  test.each(publicPaths)("allows %s without cookie", (path) => {
    const req = makeRequest(path, false);
    const result = middleware(req) as any;

    expect(result.type).toBe("next");
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});

describe("middleware — /private routes", () => {
  test("passes /private/* through regardless of cookie (adminToken guard is in Shell.tsx)", () => {
    const req = makeRequest("/private/dashboard", false);
    const result = middleware(req) as any;

    expect(result.type).toBe("next");
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  test("passes /private/login without cookie", () => {
    const req = makeRequest("/private/login", false);
    const result = middleware(req) as any;

    expect(result.type).toBe("next");
  });
});

describe("middleware — protected routes", () => {
  test("redirects to /login when accessToken cookie is absent", () => {
    const req = makeRequest("/dashboard", false);
    const result = middleware(req) as any;

    expect(result.type).toBe("redirect");
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  test("allows protected route when accessToken cookie is present", () => {
    const req = makeRequest("/dashboard", true);
    const result = middleware(req) as any;

    expect(result.type).toBe("next");
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  test("redirects /items when no cookie", () => {
    const req = makeRequest("/items", false);
    const result = middleware(req) as any;

    expect(result.type).toBe("redirect");
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  test("redirects /maintenances when no cookie", () => {
    const req = makeRequest("/maintenances", false);
    const result = middleware(req) as any;

    expect(result.type).toBe("redirect");
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  test("allows /items with valid cookie", () => {
    const req = makeRequest("/items", true);
    const result = middleware(req) as any;

    expect(result.type).toBe("next");
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
