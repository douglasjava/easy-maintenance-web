import { scrubSentryEvent, SENSITIVE_HEADERS } from "./sentry-scrub";

describe("scrubSentryEvent — header scrubbing", () => {
  test("replaces Authorization header with [Filtered]", () => {
    const event = buildEvent({ Authorization: "Bearer eyJhbGciOiJSUzI1NiJ9" });
    const result = scrubSentryEvent(event);
    expect(result.request!.headers!["Authorization"]).toBe("[Filtered]");
  });

  test("replaces cookie header with [Filtered]", () => {
    const event = buildEvent({ cookie: "accessToken=tok123; other=abc" });
    const result = scrubSentryEvent(event);
    expect(result.request!.headers!["cookie"]).toBe("[Filtered]");
  });

  test("filters all headers in SENSITIVE_HEADERS set", () => {
    const headers: Record<string, string> = {};
    for (const h of SENSITIVE_HEADERS) headers[h] = "sensitive";
    headers["content-type"] = "application/json";

    const result = scrubSentryEvent(buildEvent(headers));

    for (const h of SENSITIVE_HEADERS) {
      expect(result.request!.headers![h]).toBe("[Filtered]");
    }
    expect(result.request!.headers!["content-type"]).toBe("application/json");
  });

  test("is case-insensitive for header names", () => {
    const event = buildEvent({ AUTHORIZATION: "Bearer tok", Cookie: "x=y" });
    const result = scrubSentryEvent(event);
    expect(result.request!.headers!["AUTHORIZATION"]).toBe("[Filtered]");
    expect(result.request!.headers!["Cookie"]).toBe("[Filtered]");
  });

  test("preserves non-sensitive headers unchanged", () => {
    const event = buildEvent({
      "x-request-id": "abc-123",
      "content-type": "application/json",
      "accept": "application/json",
    });
    const result = scrubSentryEvent(event);
    expect(result.request!.headers!["x-request-id"]).toBe("abc-123");
    expect(result.request!.headers!["content-type"]).toBe("application/json");
  });
});

describe("scrubSentryEvent — cookie scrubbing", () => {
  test("replaces cookie string with [Filtered]", () => {
    const event: any = { request: { cookies: "accessToken=tok123; sessionId=xyz" } };
    const result = scrubSentryEvent(event);
    expect(result.request!.cookies).toBe("[Filtered]");
  });

  test("sets cookies to [Filtered] even when originally undefined", () => {
    const event: any = { request: {} };
    const result = scrubSentryEvent(event);
    expect(result.request!.cookies).toBe("[Filtered]");
  });
});

describe("scrubSentryEvent — edge cases", () => {
  test("returns event unchanged when request is absent", () => {
    const event: any = { exception: { values: [{ type: "Error", value: "oops" }] } };
    const result = scrubSentryEvent(event);
    expect(result).toBe(event);
    expect(result.request).toBeUndefined();
  });

  test("handles event with request but no headers", () => {
    const event: any = { request: { url: "https://example.com" } };
    const result = scrubSentryEvent(event);
    expect(result.request!.cookies).toBe("[Filtered]");
  });

  test("never drops the event (always returns non-null)", () => {
    const event = buildEvent({ Authorization: "secret" });
    expect(scrubSentryEvent(event)).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function buildEvent(headers: Record<string, string>) {
  return {
    request: {
      headers: { ...headers },
      cookies: undefined as string | undefined,
    },
  };
}
