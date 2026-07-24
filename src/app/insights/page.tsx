import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedArticles } from "@/content/insights/registry";
import { getCategoryLabel } from "@/content/insights/categories";
import { formatDate } from "@/lib/format-date";
import { SITE_NAME, SITE_LOCALE, getCanonicalUrl } from "@/content/site";

const title = "Insights";
const description =
  "Fitness research, guides, and practical advice from Natty Fitness Trainer.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: getCanonicalUrl("/insights"),
  },
  openGraph: {
    title: `${title} | ${SITE_NAME}`,
    description,
    url: getCanonicalUrl("/insights"),
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: `${title} | ${SITE_NAME}`,
    description,
  },
};

export default function InsightsPage() {
  const articles = getPublishedArticles();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Insights
        </h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          Fitness research, guides, and practical advice.
        </p>
      </header>

      {articles.length === 0 ? (
        <section className="rounded-lg border border-zinc-200 p-6 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          <p>
            Articles are in progress and will be published here soon. Check back
            for evidence-informed fitness research, guides, and practical
            advice.
          </p>
        </section>
      ) : (
        <ul className="flex flex-col gap-8">
          {articles.map((article) => (
            <li key={article.slug}>
              <article>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  <Link
                    href={`/insights/${article.slug}`}
                    className="hover:underline"
                  >
                    {article.title}
                  </Link>
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {getCategoryLabel(article.category)} ·{" "}
                  <time dateTime={article.publishedAt}>
                    {formatDate(article.publishedAt)}
                  </time>
                </p>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300">
                  {article.description}
                </p>
              </article>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-10 text-sm text-zinc-500 dark:text-zinc-400">
        Looking for personalized guidance?{" "}
        <Link href="/coaching" className="underline hover:no-underline">
          Explore coaching
        </Link>
        .
      </p>
    </main>
  );
}
