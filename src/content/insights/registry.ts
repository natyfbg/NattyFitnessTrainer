import type { ArticleEntry, ArticleFrontmatter, ArticleSummary } from "./types";
import { articleCategories } from "./categories";

import EvidenceInformedCoachingTemplate, {
  frontmatter as evidenceInformedCoachingTemplateFrontmatter,
} from "./articles/evidence-informed-coaching-template.mdx";

/**
 * Static, build-time article registry. Every article is a static import —
 * there is no filesystem scanning, so this stays safe to run in the
 * Cloudflare Workers runtime.
 */
const allArticleEntries: readonly ArticleEntry[] = [
  {
    slug: "evidence-informed-coaching-template",
    frontmatter: evidenceInformedCoachingTemplateFrontmatter,
    Component: EvidenceInformedCoachingTemplate,
  },
];

// --- Validation -------------------------------------------------------
//
// Article `.mdx` files are not type-checked (see tsconfig.json), and the
// sibling `.mdx.d.ts` files only assert a shape to consumers — they don't
// verify the actual object literal in the `.mdx` file matches it. These
// checks catch mistakes (typos, bad dates, missing alt text) at module
// load time instead of letting them silently produce wrong output.

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const VALID_CATEGORY_IDS = new Set(
  articleCategories.map((category) => category.id),
);

function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function describeArticle(
  slug: string,
  frontmatter: ArticleFrontmatter,
): string {
  return slug.trim().length > 0
    ? `slug "${slug}"`
    : `title "${frontmatter.title}" (missing slug)`;
}

function assertValidArticle(entry: ArticleEntry): void {
  const { slug, frontmatter } = entry;
  const article = describeArticle(slug, frontmatter);
  const fail = (message: string): never => {
    throw new Error(
      `Insights article registry: article with ${article} — ${message}`,
    );
  };

  if (slug.trim().length === 0) {
    fail("slug must not be empty.");
  }
  if (!SLUG_PATTERN.test(slug)) {
    fail(
      `slug "${slug}" must be lowercase kebab-case (e.g. "my-article-title").`,
    );
  }

  if (!isValidIsoDate(frontmatter.publishedAt)) {
    fail(
      `publishedAt must be a valid "YYYY-MM-DD" calendar date, got "${frontmatter.publishedAt}".`,
    );
  }

  if (frontmatter.updatedAt !== undefined) {
    if (!isValidIsoDate(frontmatter.updatedAt)) {
      fail(
        `updatedAt must be a valid "YYYY-MM-DD" calendar date, got "${frontmatter.updatedAt}".`,
      );
    }
    if (frontmatter.updatedAt < frontmatter.publishedAt) {
      fail(
        `updatedAt ("${frontmatter.updatedAt}") cannot be earlier than publishedAt ("${frontmatter.publishedAt}").`,
      );
    }
  }

  if (!VALID_CATEGORY_IDS.has(frontmatter.category)) {
    fail(
      `category "${frontmatter.category}" is not a recognized Insights category.`,
    );
  }

  if (frontmatter.featuredImage) {
    if (frontmatter.featuredImage.src.trim().length === 0) {
      fail("featuredImage.src must not be empty.");
    }
    if (frontmatter.featuredImage.alt.trim().length === 0) {
      fail(
        "featuredImage is set but featuredImage.alt is empty — every featured image needs real alt text.",
      );
    }
  }

  frontmatter.references?.forEach((reference, index) => {
    if (reference.label.trim().length === 0) {
      fail(`references[${index}] has a blank label.`);
    }
    if (reference.url !== undefined && reference.url.trim().length === 0) {
      fail(`references[${index}] has a blank url.`);
    }
  });
}

function assertUniqueSlugs(entries: readonly ArticleEntry[]): void {
  const seen = new Set<string>();
  for (const entry of entries) {
    if (seen.has(entry.slug)) {
      throw new Error(
        `Insights article registry: duplicate slug "${entry.slug}" is used by more than one article.`,
      );
    }
    seen.add(entry.slug);
  }
}

// Runs when this module is loaded (including during `next build`), so
// invalid article metadata fails the build instead of silently rendering
// incorrectly.
allArticleEntries.forEach(assertValidArticle);
assertUniqueSlugs(allArticleEntries);

// --- Public API ---------------------------------------------------------

const isProduction = process.env.NODE_ENV === "production";

function toSummary(entry: ArticleEntry): ArticleSummary {
  return { slug: entry.slug, ...entry.frontmatter };
}

function byNewestFirst(a: ArticleSummary, b: ArticleSummary): number {
  return b.publishedAt.localeCompare(a.publishedAt);
}

/** Published articles only, sorted newest first. */
export function getPublishedArticles(): readonly ArticleSummary[] {
  return allArticleEntries
    .filter((entry) => !entry.frontmatter.draft)
    .map(toSummary)
    .sort(byNewestFirst);
}

/** Published article slugs, for generateStaticParams. */
export function getPublishedArticleSlugs(): readonly string[] {
  return getPublishedArticles().map((article) => article.slug);
}

/**
 * Looks up a single article by slug. Draft articles are only returned
 * outside production, so a draft can never be reached in a production build
 * or deployment — it will resolve as not found instead.
 */
export function getArticleBySlug(slug: string): ArticleEntry | undefined {
  const entry = allArticleEntries.find((candidate) => candidate.slug === slug);
  if (!entry) {
    return undefined;
  }
  if (entry.frontmatter.draft && isProduction) {
    return undefined;
  }
  return entry;
}
