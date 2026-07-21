import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { PhotoFrame } from "@/components/photo-frame";
import { trainingStyles, coachingBenefits } from "@/content/coaching";
import { coachingSectionIntro } from "@/content/home";
import { homeMedia } from "@/content/media";

export function CoachingStyles() {
  return (
    <Section id="coaching" aria-labelledby="coaching-heading">
      <SectionHeading
        id="coaching-heading"
        eyebrow={coachingSectionIntro.eyebrow}
        heading={coachingSectionIntro.heading}
        supportingStatement={coachingSectionIntro.supportingStatement}
      />
      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {trainingStyles.map((style) => (
          <div
            key={style.id}
            className="rounded-card border border-border bg-background-elevated p-6"
          >
            <h3 className="font-display text-xl font-medium text-foreground">
              {style.label}
            </h3>
            <p className="mt-2 text-sm text-foreground-muted">
              {style.description}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-col gap-6 border-t border-border pt-8 sm:flex-row sm:gap-12">
        {coachingBenefits.map((benefit) => (
          <div key={benefit.title}>
            <p className="text-sm font-medium text-foreground">
              {benefit.title}
            </p>
            <p className="text-sm text-foreground-muted">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <PhotoFrame
          image={homeMedia.coachingAction}
          aspectClassName="aspect-2/1 sm:aspect-21/9"
          fallbackVariant="texture"
          sizes="(min-width: 1024px) 1024px, 100vw"
        />
      </div>
    </Section>
  );
}
