import { Section } from "@/components/section";
import { consultationSection } from "@/content/home";
import { Eyebrow } from "@/components/eyebrow";

export function ConsultationCta() {
  return (
    <Section
      id="consultation"
      tone="elevated"
      aria-labelledby="consultation-heading"
      narrow
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <Eyebrow className="justify-center">
          {consultationSection.eyebrow}
        </Eyebrow>
        <h2
          id="consultation-heading"
          className="font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl"
        >
          {consultationSection.heading}
        </h2>
        <p className="max-w-[55ch] text-lg text-foreground-muted">
          {consultationSection.statusNote}
        </p>
        <span className="mt-2 inline-flex items-center rounded-pill border border-border px-4 py-2 text-sm font-medium text-foreground-muted">
          Booking details coming soon
        </span>
      </div>
    </Section>
  );
}
