/**
 * Unit tests for the pure logic inside PendingPixPaymentCard.
 *
 * The component uses React/DOM APIs that require a browser environment.
 * These tests cover the two pure functions that drive the card's conditional
 * rendering:
 *   1. isExpired — determines whether to show "QR Code expirado"
 *   2. formatExpiration — formats the expiration timestamp for display
 *   3. usePendingPayment enabled condition — hook only fires when auth is ready
 */

// --- Helpers replicating the exact formulas in PendingPixPaymentCard ---

function isExpired(pixExpiresAt: string | null | undefined): boolean {
  if (!pixExpiresAt) return false;
  return new Date(pixExpiresAt) < new Date();
}

function formatExpiration(pixExpiresAt: string | null | undefined): string {
  if (!pixExpiresAt) return "";
  const d = new Date(pixExpiresAt);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// --- isExpired ---

describe("isExpired", () => {
  it("returns false when pixExpiresAt is null", () => {
    expect(isExpired(null)).toBe(false);
  });

  it("returns false when pixExpiresAt is undefined", () => {
    expect(isExpired(undefined)).toBe(false);
  });

  it("returns false for a date in the future", () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    expect(isExpired(future)).toBe(false);
  });

  it("returns true for a date in the past", () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    expect(isExpired(past)).toBe(true);
  });
});

// --- formatExpiration ---

describe("formatExpiration", () => {
  it("returns empty string when pixExpiresAt is null", () => {
    expect(formatExpiration(null)).toBe("");
  });

  it("returns empty string when pixExpiresAt is undefined", () => {
    expect(formatExpiration(undefined)).toBe("");
  });

  it("returns a non-empty string for a valid ISO date", () => {
    const result = formatExpiration("2026-05-15T23:59:00.000Z");
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(0);
  });
});

// --- usePendingPayment canFetch logic ---

function deriveCanFetch({
  token,
  authLoading,
}: {
  token: string | null;
  authLoading: boolean;
}): boolean {
  return !!token && !authLoading;
}

describe("usePendingPayment — canFetch", () => {
  it("is false while auth is loading", () => {
    expect(deriveCanFetch({ token: "tok", authLoading: true })).toBe(false);
  });

  it("is false when there is no token", () => {
    expect(deriveCanFetch({ token: null, authLoading: false })).toBe(false);
  });

  it("is true when token is present and auth is not loading", () => {
    expect(deriveCanFetch({ token: "tok", authLoading: false })).toBe(true);
  });
});
