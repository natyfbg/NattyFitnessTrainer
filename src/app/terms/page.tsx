import type { Metadata } from "next";
import { Container } from "@/components/container";
import { TermsTable } from "@/components/terms/terms-table";
import { TermsText } from "@/components/terms/terms-text";
import {
  DEFAULT_SOCIAL_IMAGE,
  SITE_LOCALE,
  SITE_NAME,
  getCanonicalUrl,
} from "@/content/site";
import { termsLastUpdated, termsPage } from "@/content/terms";

const { title, description } = termsPage;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: getCanonicalUrl("/terms"),
  },
  openGraph: {
    title: `${title} | ${SITE_NAME}`,
    description,
    url: getCanonicalUrl("/terms"),
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    type: "website",
    images: [DEFAULT_SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | ${SITE_NAME}`,
    description,
  },
};

export default function TermsPage() {
  return (
    <main className="py-16 sm:py-20 lg:py-24">
      <Container narrow>
        <h1 className="font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-foreground-muted">
          Last updated: {termsLastUpdated}
        </p>
        <p className="mt-8 text-lg text-foreground-muted">{termsPage.intro}</p>

        <nav
          aria-labelledby="terms-contents-heading"
          className="mt-10 rounded-card border border-border bg-background-elevated p-5 sm:p-6"
        >
          <h2
            id="terms-contents-heading"
            className="text-sm font-medium tracking-wide text-gold"
          >
            On this page
          </h2>
          <ol className="mt-3 flex flex-col gap-2 text-sm">
            {termsPage.sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-foreground-muted hover:text-foreground"
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-12 flex flex-col gap-12 text-foreground-muted">
          {termsPage.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-heading`}
              className="scroll-mt-24"
            >
              <h2
                id={`${section.id}-heading`}
                className="font-display text-2xl font-medium text-foreground"
              >
                {section.heading}
              </h2>

              {section.intro ? (
                <p className="mt-3">
                  <TermsText value={section.intro} />
                </p>
              ) : null}

              {section.table ? <TermsTable table={section.table} /> : null}

              {section.callout ? (
                <p className="mt-4 border-l-2 border-gold pl-4 text-foreground">
                  <TermsText value={section.callout} />
                </p>
              ) : null}

              {section.items ? (
                <dl className="mt-4 flex flex-col gap-4">
                  {section.items.map((item) => (
                    <div key={item.term}>
                      <dt className="font-medium text-foreground">
                        {item.term}
                      </dt>
                      <dd className="mt-1">
                        <TermsText value={item.detail} />
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {section.notes?.map((note, index) => (
                <p key={index} className="mt-4">
                  <TermsText value={note} />
                </p>
              ))}
            </section>
          ))}
        </div>
      </Container>
    </main>
  );
}
