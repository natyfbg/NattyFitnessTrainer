import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { PhotoFrame } from "@/components/photo-frame";
import {
  technicalBackgroundIntro,
  technicalBackgroundPoints,
  technicalBackgroundNote,
} from "@/content/about";
import { homeMedia } from "@/content/media";

export function TechnicalBackgroundSection() {
  return (
    <Section
      id="technical-background"
      aria-labelledby="technical-background-heading"
    >
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <SectionHeading
            id="technical-background-heading"
            eyebrow={technicalBackgroundIntro.eyebrow}
            heading={technicalBackgroundIntro.heading}
          />
          <ul className="mt-6 flex flex-col gap-2 text-foreground-muted">
            {technicalBackgroundPoints.map((point) => (
              <li key={point} className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-foreground-muted">
            {technicalBackgroundNote}
          </p>
        </div>

        <PhotoFrame
          image={homeMedia.aboutPageTechnicalScene}
          aspectClassName="aspect-4/3"
          fallbackVariant="texture"
          sizes="(min-width: 1024px) 480px, 100vw"
          className="shadow-elevated"
        />
      </div>
    </Section>
  );
}
