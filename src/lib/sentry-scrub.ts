/**
 * Sentry PII scrubbing utility.
 *
 * Exported as a standalone function so it can be:
 *  - imported by all three Sentry config files (client / server / edge)
 *  - unit-tested independently of the Sentry SDK
 *
 * Strategy:
 *  - Sensitive HTTP headers (Authorization, Cookie, etc.) → "[Filtered]"
 *  - Cookie string (may carry accessToken) → "[Filtered]"
 *  - Event is always returned (never dropped)
 */

export const SENSITIVE_HEADERS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "x-auth-token",
  "x-admin-token",
]);

/** Shape that matches io.sentry SentryEvent for the fields we touch */
interface SentryEventLike {
  request?: {
    headers?: Record<string, string>;
    cookies?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export function scrubSentryEvent(event: SentryEventLike): SentryEventLike {
  if (!event.request) return event;

  // Scrub sensitive request headers
  if (event.request.headers) {
    for (const key of Object.keys(event.request.headers)) {
      if (SENSITIVE_HEADERS.has(key.toLowerCase())) {
        event.request.headers[key] = "[Filtered]";
      }
    }
  }

  // Remove cookie string entirely — may contain HttpOnly accessToken
  event.request.cookies = "[Filtered]";

  return event;
}
