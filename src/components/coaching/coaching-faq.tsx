import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { FaqAccordion } from "@/components/faq-accordion";
import { faqItems } from "@/content/faq";
import { coachingFaqIntro } from "@/content/coaching-page";

export function CoachingFaq() {
  return (
    <Section id="coaching-faq" aria-labelledby="coaching-faq-heading" narrow>
      <SectionHeading
        id="coaching-faq-heading"
        eyebrow={coachingFaqIntro.eyebrow}
        heading={coachingFaqIntro.heading}
      />
      <FaqAccordion items={faqItems} />
    </Section>
  );
}
