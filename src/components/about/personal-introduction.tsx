import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { PhotoFrame } from "@/components/photo-frame";
import {
  personalIntroductionIntro,
  personalIntroductionParagraphs,
} from "@/content/about";
import { homeMedia } from "@/content/media";

export function PersonalIntroduction() {
  return (
    <Section id="background" aria-labelledby="background-heading">
      <SectionHeading
        id="background-heading"
        eyebrow={personalIntroductionIntro.eyebrow}
        heading={personalIntroductionIntro.heading}
      />
      <div className="mt-6 flex max-w-[65ch] flex-col gap-4 text-lg text-foreground-muted">
        {personalIntroductionParagraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <PhotoFrame
          image={homeMedia.aboutPageTrainingAction}
          aspectClassName="aspect-4/5"
          fallbackVariant="texture"
          className="shadow-elevated"
          sizes="(min-width: 1024px) 400px, 50vw"
        />
        <PhotoFrame
          image={homeMedia.aboutPageCoachingInteraction}
          aspectClassName="aspect-4/5"
          fallbackVariant="texture"
          className="shadow-elevated"
          sizes="(min-width: 1024px) 400px, 50vw"
        />
      </div>
    </Section>
  );
}
