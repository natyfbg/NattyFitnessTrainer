import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { CtaLink } from "@/components/cta-link";
import { PhotoFrame } from "@/components/photo-frame";
import { trainer } from "@/content/trainer";
import { aboutSectionIntro, aboutCta } from "@/content/home";
import { getAboutImage } from "@/content/media";

export function AboutSection() {
  const aboutImage = getAboutImage();

  return (
    <Section id="about" aria-labelledby="about-heading">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none">
          <PhotoFrame
            image={aboutImage}
            aspectClassName="aspect-4/5"
            fallbackLabel={trainer.name}
            className="shadow-elevated"
            sizes="(min-width: 1024px) 480px, 100vw"
          />
        </div>

        <div className="max-w-[60ch]">
          <SectionHeading
            id="about-heading"
            eyebrow={aboutSectionIntro.eyebrow}
            heading={aboutSectionIntro.heading}
          />
          <div className="mt-8 flex flex-col gap-4 text-lg text-foreground-muted">
            <p>
              {trainer.name} is an {trainer.credentials.join(", ")} with{" "}
              {trainer.yearsOfExperience} years of hands-on training experience,
              coaching online, hybrid, and in person in the{" "}
              {trainer.serviceAreaLabel}.
            </p>
            <p>{trainer.philosophy}</p>
            <p>{trainer.technicalBackground}</p>
          </div>
          <CtaLink href={aboutCta.href} variant="secondary" className="mt-8">
            {aboutCta.label}
          </CtaLink>
        </div>
      </div>
    </Section>
  );
}
