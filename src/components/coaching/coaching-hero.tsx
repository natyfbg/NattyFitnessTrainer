import { Container } from "@/components/container";
import { CtaLink } from "@/components/cta-link";
import { Eyebrow } from "@/components/eyebrow";
import { PhotoFrame } from "@/components/photo-frame";
import { coachingHeroContent } from "@/content/coaching-page";
import { trainer } from "@/content/trainer";
import { homeMedia } from "@/content/media";

export function CoachingHero() {
  return (
    <section className="border-b border-border bg-background pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="flex flex-col gap-6">
            <Eyebrow>{coachingHeroContent.eyebrow}</Eyebrow>
            <h1 className="font-display text-4xl leading-[1.1] font-medium tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {coachingHeroContent.headline}
            </h1>
            <p className="max-w-[52ch] text-lg text-foreground-muted">
              {coachingHeroContent.supportingStatement}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <CtaLink
                href={coachingHeroContent.primaryCta.href}
                variant="primary"
              >
                {coachingHeroContent.primaryCta.label}
              </CtaLink>
              <CtaLink
                href={coachingHeroContent.secondaryCta.href}
                variant="secondary"
              >
                {coachingHeroContent.secondaryCta.label}
              </CtaLink>
            </div>
            <p className="text-sm text-foreground-muted">
              {trainer.credentials.join(", ")} · {trainer.yearsOfExperience}{" "}
              Years of Experience
            </p>
          </div>

          <PhotoFrame
            image={homeMedia.coachingHeroImage}
            aspectClassName="aspect-4/5 lg:aspect-3/4"
            fallbackVariant="texture"
            priority
            className="mx-auto w-full max-w-md shadow-elevated lg:max-w-none"
            sizes="(min-width: 1024px) 480px, (min-width: 640px) 60vw, 100vw"
          />
        </div>
      </Container>
    </section>
  );
}
