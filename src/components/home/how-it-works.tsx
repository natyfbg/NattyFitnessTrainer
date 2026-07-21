import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { howItWorksSteps } from "@/content/process";
import { howItWorksSectionIntro } from "@/content/home";

export function HowItWorks() {
  return (
    <Section
      id="how-it-works"
      tone="elevated"
      aria-labelledby="how-it-works-heading"
    >
      <SectionHeading
        id="how-it-works-heading"
        eyebrow={howItWorksSectionIntro.eyebrow}
        heading={howItWorksSectionIntro.heading}
      />
      <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {howItWorksSteps.map((step, index) => (
          <li key={step.title} className="flex flex-col gap-3">
            <span className="font-display text-3xl font-medium text-gold">
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className="text-base font-medium text-foreground">
              {step.title}
            </p>
            <p className="text-sm text-foreground-muted">{step.description}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
