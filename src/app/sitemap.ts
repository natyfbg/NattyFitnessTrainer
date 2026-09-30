import type { MetadataRoute } from "next";
import { getCanonicalUrl } from "@/content/site";
import { getPublishedArticles } from "@/content/insights/registry";

/**
 * Public, indexable routes only. `/consultation/thank-you` and API routes
 * are intentionally excluded. No `lastModified` is set for these static
 * pages — there's no reliable content-change timestamp to report, and an
 * invented one would be worse than omitting it.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: getCanonicalUrl("/"), changeFrequency: "monthly", priority: 1 },
    {
      url: getCanonicalUrl("/coaching"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: getCanonicalUrl("/about"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: getCanonicalUrl("/faq"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: getCanonicalUrl("/insights"),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: getCanonicalUrl("/consultation"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: getCanonicalUrl("/privacy"),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  // getPublishedArticles() already excludes drafts — the same
  // production-safe registry function the /insights routes use.
  const articleRoutes: MetadataRoute.Sitemap = getPublishedArticles().map(
    (article) => ({
      url: getCanonicalUrl(`/insights/${article.slug}`),
      lastModified: article.updatedAt ?? article.publishedAt,
      changeFrequency: "monthly",
      priority: 0.5,
    }),
  );

  return [...staticRoutes, ...articleRoutes];
}
