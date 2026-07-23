import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { philosophyIntro, philosophyPrinciples } from "@/content/about";

export function PhilosophySection() {
  return (
    <Section
      id="philosophy"
      tone="elevated"
      aria-labelledby="about-philosophy-heading"
    >
      <SectionHeading
        id="about-philosophy-heading"
        eyebrow={philosophyIntro.eyebrow}
        heading={philosophyIntro.heading}
      />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {philosophyPrinciples.map((principle) => (
          <div
            key={principle.title}
            className="rounded-card border border-border bg-background p-6"
          >
            <h3 className="font-display text-lg font-medium text-foreground">
              {principle.title}
            </h3>
            <p className="mt-2 text-sm text-foreground-muted">
              {principle.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
