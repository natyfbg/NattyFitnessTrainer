import type { MetadataRoute } from "next";
import { SITE_URL, getCanonicalUrl } from "@/content/site";

/**
 * This is a crawling hint, not a security boundary — nothing here is
 * relied on to keep anything private. The consultation API is disallowed
 * purely so crawlers don't waste time on a non-page endpoint, and the
 * thank-you page is disallowed as a courtesy on top of its own
 * `noindex, nofollow` meta tag (the actual authoritative signal).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/consultation/thank-you"],
    },
    sitemap: getCanonicalUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
