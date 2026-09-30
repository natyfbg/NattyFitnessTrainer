import { Section } from "@/components/section";
import { CtaLink } from "@/components/cta-link";
import { faqExploreContent } from "@/content/faq-page";

export function FaqExploreLinks() {
  return (
    <Section aria-labelledby="faq-explore-heading" narrow>
      <div className="flex flex-col items-center gap-4 text-center">
        <h2
          id="faq-explore-heading"
          className="font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl"
        >
          {faqExploreContent.heading}
        </h2>
        <p className="max-w-[55ch] text-foreground-muted">
          {faqExploreContent.supportingStatement}
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <CtaLink
            href={faqExploreContent.coachingCta.href}
            variant="secondary"
          >
            {faqExploreContent.coachingCta.label}
          </CtaLink>
          <CtaLink href={faqExploreContent.aboutCta.href} variant="secondary">
            {faqExploreContent.aboutCta.label}
          </CtaLink>
        </div>
      </div>
    </Section>
  );
}
