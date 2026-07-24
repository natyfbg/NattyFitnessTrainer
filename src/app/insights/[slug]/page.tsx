import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getArticleBySlug,
  getPublishedArticleSlugs,
} from "@/content/insights/registry";
import { getCategoryLabel } from "@/content/insights/categories";
import { formatDate } from "@/lib/format-date";
import { ArticleJsonLd } from "@/components/article-json-ld";
import { SITE_NAME, SITE_LOCALE, getCanonicalUrl } from "@/content/site";

interface ArticlePageParams {
  readonly slug: string;
}

interface ArticlePageProps {
  readonly params: Promise<ArticlePageParams>;
}

export function generateStaticParams(): ArticlePageParams[] {
  return getPublishedArticleSlugs().map((slug) => ({ slug }));
}

// dynamicParams intentionally stays at its default (true): a slug outside
// generateStaticParams (e.g. a draft, in local development) is still
// resolved on demand through getArticleBySlug below, which is what actually
// decides draft visibility per environment. Unknown or production-draft
// slugs fall through to notFound() either way.

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getArticleBySlug(slug);

  if (!entry) {
    return {};
  }

  const { frontmatter } = entry;
  const title = `${frontmatter.title} | Natty Fitness Trainer Insights`;
  const url = getCanonicalUrl(`/insights/${slug}`);

  return {
    title,
    description: frontmatter.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description: frontmatter.description,
      url,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      type: "article",
      publishedTime: frontmatter.publishedAt,
      modifiedTime: frontmatter.updatedAt ?? frontmatter.publishedAt,
      authors: [frontmatter.author.name],
    },
    twitter: {
      card: "summary",
      title,
      description: frontmatter.description,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const entry = getArticleBySlug(slug);

  if (!entry) {
    notFound();
  }

  const { frontmatter, Component } = entry;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <ArticleJsonLd slug={slug} article={frontmatter} />
      <article>
        <header className="mb-8">
          {frontmatter.draft ? (
            <p className="mb-4 inline-block rounded bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              Draft — visible only in local development
            </p>
          ) : null}
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {getCategoryLabel(frontmatter.category)}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {frontmatter.title}
          </h1>
          <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
            {frontmatter.description}
          </p>
          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
            <div className="flex gap-1">
              <dt className="font-medium">By</dt>
              <dd>{frontmatter.author.name}</dd>
            </div>
            <div className="flex gap-1">
              <dt className="font-medium">
                {frontmatter.draft ? "Draft date" : "Published"}
              </dt>
              <dd>
                <time dateTime={frontmatter.publishedAt}>
                  {formatDate(frontmatter.publishedAt)}
                </time>
              </dd>
            </div>
            {frontmatter.updatedAt ? (
              <div className="flex gap-1">
                <dt className="font-medium">Updated</dt>
                <dd>
                  <time dateTime={frontmatter.updatedAt}>
                    {formatDate(frontmatter.updatedAt)}
                  </time>
                </dd>
              </div>
            ) : null}
            {frontmatter.reviewer ? (
              <div className="flex gap-1">
                <dt className="font-medium">Reviewed by</dt>
                <dd>{frontmatter.reviewer.name}</dd>
              </div>
            ) : null}
          </dl>
          {frontmatter.tags.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {frontmatter.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </header>

        <div className="border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <Component />
        </div>

        <p className="mt-10 border-t border-zinc-200 pt-6 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          This article is for general educational purposes and is not a
          substitute for individualized medical or professional advice. Consult
          a qualified professional before making changes to your health,
          training, or nutrition.
        </p>

        {frontmatter.references && frontmatter.references.length > 0 ? (
          <section aria-labelledby="references-heading" className="mt-8">
            <h2
              id="references-heading"
              className="text-xl font-semibold text-zinc-900 dark:text-zinc-50"
            >
              References
            </h2>
            <ol className="mt-3 list-decimal space-y-1 pl-6 text-sm text-zinc-600 dark:text-zinc-400">
              {frontmatter.references.map((reference) => (
                <li key={reference.label}>
                  {reference.url ? (
                    <a
                      href={reference.url}
                      className="underline hover:no-underline"
                    >
                      {reference.label}
                    </a>
                  ) : (
                    reference.label
                  )}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
          Looking to put this into practice?{" "}
          <Link href="/coaching" className="underline hover:no-underline">
            Explore coaching
          </Link>
          .
        </p>
      </article>
    </main>
  );
}
