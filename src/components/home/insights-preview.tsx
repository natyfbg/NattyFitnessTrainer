import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { CtaLink } from "@/components/cta-link";
import { getPublishedArticles } from "@/content/insights/registry";
import {
  insightsSectionIntro,
  insightsEmptyStateMessage,
} from "@/content/home";

export function InsightsPreview() {
  const articles = getPublishedArticles();

  return (
    <Section id="insights" aria-labelledby="insights-heading">
      <SectionHeading
        id="insights-heading"
        eyebrow={insightsSectionIntro.eyebrow}
        heading={insightsSectionIntro.heading}
      />
      {articles.length === 0 ? (
        <p className="mt-8 max-w-[60ch] text-foreground-muted">
          {insightsEmptyStateMessage}
        </p>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-3">
          {articles.slice(0, 3).map((article) => (
            <li
              key={article.slug}
              className="rounded-card border border-border bg-background-elevated p-6"
            >
              <p className="font-display text-lg font-medium text-foreground">
                {article.title}
              </p>
              <p className="mt-2 text-sm text-foreground-muted">
                {article.description}
              </p>
            </li>
          ))}
        </ul>
      )}
      <CtaLink href="/insights" variant="secondary" className="mt-8">
        Visit Insights
      </CtaLink>
    </Section>
  );
}
