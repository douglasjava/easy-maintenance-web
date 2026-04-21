import * as Sentry from "@sentry/nextjs";
import { scrubSentryEvent } from "@/lib/sentry-scrub";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

// Sentry is a no-op when DSN is absent — safe to leave unconfigured in local dev.
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Capture 10% of transactions for performance tracing in production.
    // Increase to 1.0 temporarily when diagnosing performance issues.
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,

    // Session replays are disabled — privacy-first approach.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,

    // Never send PII automatically (user IPs, request bodies, etc.)
    sendDefaultPii: false,

    // Strip tokens, cookies, and auth headers before sending to Sentry
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    beforeSend: (event: any) => scrubSentryEvent(event) as any,

    // Suppress verbose Sentry SDK logs
    debug: false,
  });
}
