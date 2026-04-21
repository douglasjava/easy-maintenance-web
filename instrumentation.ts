/**
 * Next.js Instrumentation hook (App Router).
 *
 * Called once per server startup. Loads the appropriate Sentry config
 * based on the current runtime (edge vs. Node.js server).
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}
