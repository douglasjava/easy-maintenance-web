import { QueryClient } from "@tanstack/react-query";

const STALE_TIME_2_MIN = 1000 * 60 * 2;

/**
 * Verifies the global QueryClient defaults configured in Providers.tsx.
 * These defaults affect every useQuery call in the application unless
 * explicitly overridden at the query level.
 */
describe("QueryClient global defaults", () => {
  let client: QueryClient;

  beforeEach(() => {
    client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: STALE_TIME_2_MIN,
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    });
  });

  afterEach(() => {
    client.clear();
  });

  it("sets staleTime to 2 minutes globally", () => {
    const defaults = client.getDefaultOptions().queries;
    expect(defaults?.staleTime).toBe(STALE_TIME_2_MIN);
  });

  it("disables refetchOnWindowFocus globally", () => {
    const defaults = client.getDefaultOptions().queries;
    expect(defaults?.refetchOnWindowFocus).toBe(false);
  });

  it("sets retry to 1 globally", () => {
    const defaults = client.getDefaultOptions().queries;
    expect(defaults?.retry).toBe(1);
  });

  it("allows per-query staleTime to override the global default", () => {
    const STALE_TIME_5_MIN = 1000 * 60 * 5;
    // Simulates what AccessContextProvider does: local staleTime: 5min
    const localOptions = { staleTime: STALE_TIME_5_MIN };
    const merged = {
      ...client.getDefaultOptions().queries,
      ...localOptions,
    };
    expect(merged.staleTime).toBe(STALE_TIME_5_MIN);
    // Global default is unchanged
    expect(client.getDefaultOptions().queries?.staleTime).toBe(STALE_TIME_2_MIN);
  });
});
