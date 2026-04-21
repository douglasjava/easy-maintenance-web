import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Suppress non-error SDK output during build
  silent: !process.env.CI,

  // Do not upload source maps (requires SENTRY_AUTH_TOKEN — configure when needed)
  // org: process.env.SENTRY_ORG,
  // project: process.env.SENTRY_PROJECT,

  // Reduce client bundle size by removing Sentry SDK logger statements
  disableLogger: true,

  // Opt out of Sentry telemetry
  telemetry: false,

  // Do not auto-instrument Vercel Cron Monitors
  automaticVercelMonitors: false,
});
