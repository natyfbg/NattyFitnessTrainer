import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { coachingExpectationsContent } from "@/content/coaching-page";

export function CoachingExpectations() {
  return (
    <Section
      id="expectations"
      tone="elevated"
      aria-labelledby="expectations-heading"
      narrow
    >
      <SectionHeading
        id="expectations-heading"
        eyebrow={coachingExpectationsContent.eyebrow}
        heading={coachingExpectationsContent.heading}
      />
      <p className="mt-6 max-w-[65ch] text-foreground-muted">
        {coachingExpectationsContent.body}
      </p>
    </Section>
  );
}
