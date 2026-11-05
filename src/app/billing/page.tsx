import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { getCtaClassName } from "@/components/cta-link";
import { TermsTable } from "@/components/terms/terms-table";
import { TermsText } from "@/components/terms/terms-text";
import {
  billingPage as content,
  billingPortalUrl,
  isTestPortalLink,
} from "@/content/billing";

// For existing clients only: kept out of search results and the sitemap,
// but crawlable (not blocked in robots.txt) so search engines can see the
// noindex.
export const metadata: Metadata = {
  title: content.title,
  description: content.description,
  robots: {
    index: false,
    follow: true,
  },
};

const sectionHeadingClassName =
  "font-display text-2xl font-medium text-foreground";

export default function BillingPage() {
  return (
    <main className="py-16 sm:py-20 lg:py-24">
      <Container narrow>
        <p className="text-sm font-medium tracking-wide text-gold">
          {content.eyebrow}
        </p>
        <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
          {content.heading}
        </h1>
        <p className="mt-6 max-w-[60ch] text-lg text-foreground-muted">
          {content.intro}
        </p>

        {billingPortalUrl !== null ? (
          <div className="mt-8 flex flex-col gap-3">
            <a
              href={billingPortalUrl}
              rel="noopener noreferrer"
              className={`${getCtaClassName("primary")} self-start`}
            >
              {content.portalButtonLabel}
            </a>
            <p className="text-sm text-foreground-muted">
              {content.signInNote}
            </p>
            {isTestPortalLink ? (
              <p className="border-l-2 border-gold pl-4 text-sm text-foreground">
                {content.testModeNote}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-8 border-l-2 border-gold pl-4 text-foreground">
            <TermsText value={content.noPortalNote} />
          </p>
        )}

        <div className="mt-14 flex flex-col gap-12 text-foreground-muted">
          {billingPortalUrl !== null ? (
            <section aria-labelledby="portal-features-heading">
              <h2
                id="portal-features-heading"
                className={sectionHeadingClassName}
              >
                {content.portalFeaturesHeading}
              </h2>
              <ul className="mt-4 flex list-disc flex-col gap-2 pl-5">
                {content.portalFeatures.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby="when-you-pay-heading">
            <h2 id="when-you-pay-heading" className={sectionHeadingClassName}>
              {content.whenYouPayHeading}
            </h2>
            <TermsTable table={content.whenYouPay} />
            <p className="mt-4">{content.cardNote}</p>
          </section>

          <section aria-labelledby="billing-help-heading">
            <h2 id="billing-help-heading" className={sectionHeadingClassName}>
              {content.helpHeading}
            </h2>
            <p className="mt-3">
              <TermsText value={content.help} />
            </p>
            <p className="mt-4">
              <Link
                href="/terms"
                className="text-foreground underline underline-offset-2 hover:no-underline"
              >
                {content.termsLinkLabel}
              </Link>
            </p>
          </section>
        </div>
      </Container>
    </main>
  );
}
