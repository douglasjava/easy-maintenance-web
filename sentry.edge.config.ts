import * as Sentry from "@sentry/nextjs";
import { scrubSentryEvent } from "@/lib/sentry-scrub";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

// Edge runtime config: only lightweight Sentry features are supported.
// No replays, no profiling — just error capture.
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
    sendDefaultPii: false,
    debug: false,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    beforeSend: (event: any) => scrubSentryEvent(event) as any,
  });
}
