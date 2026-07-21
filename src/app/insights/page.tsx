import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedArticles } from "@/content/insights/registry";
import { getCategoryLabel } from "@/content/insights/categories";
import { formatDate } from "@/lib/format-date";
import { getCanonicalUrl } from "@/content/site";

export const metadata: Metadata = {
  title: "Insights | Natty Fitness Trainer",
  description:
    "Fitness research, guides, and practical advice from Natty Fitness Trainer.",
  alternates: {
    canonical: getCanonicalUrl("/insights"),
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
    </main>
  );
}
