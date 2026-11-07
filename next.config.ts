import type { NextConfig } from "next";
import createMDX from "@next/mdx";

// Security headers sent with every page and API response. See
// docs/deployment.md ("Security headers"). public/_headers repeats them for
// the static files Cloudflare serves without running the Worker; keep the
// two lists the same.
//
// The Content-Security-Policy only sets directives that can't block a script,
// frame or request: the Turnstile widget, the Cal.com embed and Cloudflare Web
// Analytics keep working without an allowlist. A stricter policy that limits
// scripts is described in docs/consultation-leads.md.
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Content-Security-Policy",
    value:
      "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'; upgrade-insecure-requests",
  },
];

const nextConfig: NextConfig = {
  // Allow MDX/Markdown files to act as pages/routes.
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  // Don't advertise the framework in an X-Powered-By header.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);

import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());
