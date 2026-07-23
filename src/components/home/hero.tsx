import { Container } from "@/components/container";
import { CtaLink } from "@/components/cta-link";
import { Eyebrow } from "@/components/eyebrow";
import { PhotoFrame } from "@/components/photo-frame";
import { heroContent } from "@/content/home";
import { trainer } from "@/content/trainer";
import { homeMedia } from "@/content/media";

export function Hero() {
  return (
    <section className="border-b border-border bg-background pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="flex flex-col gap-6">
            <Eyebrow>{heroContent.eyebrow}</Eyebrow>
            <h1 className="font-display text-4xl leading-[1.1] font-medium tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {heroContent.headline}
            </h1>
            <p className="max-w-[52ch] text-lg text-foreground-muted">
              {heroContent.supportingStatement}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <CtaLink href={heroContent.primaryCta.href} variant="primary">
                {heroContent.primaryCta.label}
              </CtaLink>
              <CtaLink href={heroContent.secondaryCta.href} variant="secondary">
                {heroContent.secondaryCta.label}
              </CtaLink>
            </div>
            <p className="text-sm text-foreground-muted">
              {trainer.credentials.join(", ")} · {trainer.yearsOfExperience}{" "}
              Years of Experience
            </p>
          </div>

          {/*
            Photo-ready composition. Populate homeMedia.heroPortrait (and
            optionally heroDetail) in src/content/media.ts once real
            photography exists — this structure does not need to change.
            The secondary frame only appears at the lg+ two-column layout;
            tablet and mobile show the primary portrait alone.
          */}
          <div className="relative mx-auto w-full max-w-md justify-self-center lg:max-w-none lg:justify-self-end lg:pr-10 lg:pb-10">
            <PhotoFrame
              image={homeMedia.heroPortrait}
              aspectClassName="aspect-4/5"
              fallbackLabel={`${trainer.name} · ${trainer.serviceAreaLabel}`}
              priority
              className="shadow-elevated"
              sizes="(min-width: 1024px) 480px, (min-width: 640px) 60vw, 100vw"
            />
            <div className="absolute right-0 bottom-0 hidden w-2/5 lg:block">
              <PhotoFrame
                image={homeMedia.heroDetail}
                aspectClassName="aspect-square"
                fallbackVariant="texture"
                className="shadow-elevated ring-4 ring-background"
                sizes="200px"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
