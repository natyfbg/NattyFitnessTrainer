import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { faqItems } from "@/content/faq";
import { faqSectionIntro } from "@/content/home";

export function FaqPreview() {
  return (
    <Section id="faq" tone="elevated" aria-labelledby="faq-heading" narrow>
      <SectionHeading
        id="faq-heading"
        eyebrow={faqSectionIntro.eyebrow}
        heading={faqSectionIntro.heading}
      />
      <div className="mt-8 flex flex-col divide-y divide-border border-t border-b border-border">
        {faqItems.map((item) => (
          <details key={item.question} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-foreground [&::-webkit-details-marker]:hidden">
              {item.question}
              <span
                aria-hidden="true"
                className="text-gold transition-transform duration-150 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-foreground-muted">{item.answer}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
