import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { CoachingFormatCard } from "./coaching-format-card";
import {
  coachingFormatsIntro,
  coachingFormatDetails,
} from "@/content/coaching-page";

export function CoachingFormats() {
  return (
    <Section id="coaching-formats" aria-labelledby="coaching-formats-heading">
      <SectionHeading
        id="coaching-formats-heading"
        eyebrow={coachingFormatsIntro.eyebrow}
        heading={coachingFormatsIntro.heading}
        supportingStatement={coachingFormatsIntro.supportingStatement}
      />
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {coachingFormatDetails.map((detail) => (
          <CoachingFormatCard key={detail.id} detail={detail} />
        ))}
      </div>
    </Section>
  );
}
