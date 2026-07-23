import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import {
  coachingPhilosophyIntro,
  coachingPhilosophyPoints,
} from "@/content/coaching-page";

export function CoachingPhilosophy() {
  return (
    <Section
      id="philosophy"
      tone="elevated"
      aria-labelledby="coaching-philosophy-heading"
      narrow
    >
      <SectionHeading
        id="coaching-philosophy-heading"
        eyebrow={coachingPhilosophyIntro.eyebrow}
        heading={coachingPhilosophyIntro.heading}
        supportingStatement={coachingPhilosophyIntro.supportingStatement}
      />
      <ul className="mt-8 flex flex-col gap-4">
        {coachingPhilosophyPoints.map((point) => (
          <li
            key={point}
            className="flex items-start gap-3 text-foreground-muted"
          >
            <span
              aria-hidden="true"
              className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
            />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
