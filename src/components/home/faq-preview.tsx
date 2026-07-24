import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { FaqAccordion } from "@/components/faq-accordion";
import { CtaLink } from "@/components/cta-link";
import { getHomeFaqItems } from "@/content/faq";
import { faqSectionIntro } from "@/content/home";

export function FaqPreview() {
  return (
    <Section id="faq" tone="elevated" aria-labelledby="faq-heading" narrow>
      <SectionHeading
        id="faq-heading"
        eyebrow={faqSectionIntro.eyebrow}
        heading={faqSectionIntro.heading}
      />
      <FaqAccordion items={getHomeFaqItems()} />
      <CtaLink href="/faq" variant="secondary" className="mt-8">
        View All FAQs
      </CtaLink>
    </Section>
  );
}
