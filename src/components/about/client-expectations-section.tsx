import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { TrustItem } from "@/components/trust-item";
import { clientExpectationsIntro, clientExpectations } from "@/content/about";

export function ClientExpectationsSection() {
  return (
    <Section
      id="what-to-expect"
      tone="elevated"
      aria-labelledby="what-to-expect-heading"
      narrow
    >
      <SectionHeading
        id="what-to-expect-heading"
        eyebrow={clientExpectationsIntro.eyebrow}
        heading={clientExpectationsIntro.heading}
      />
      <ul className="mt-8 flex flex-col gap-3">
        {clientExpectations.map((item) => (
          <TrustItem key={item}>{item}</TrustItem>
        ))}
      </ul>
    </Section>
  );
}
