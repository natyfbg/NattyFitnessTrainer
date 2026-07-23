import { Section } from "@/components/section";
import { CtaLink } from "@/components/cta-link";
import { Eyebrow } from "@/components/eyebrow";
import { aboutFinalCtaContent } from "@/content/about";

export function AboutFinalCta() {
  return (
    <Section tone="elevated" aria-labelledby="about-final-cta-heading" narrow>
      <div className="flex flex-col items-center gap-4 text-center">
        <Eyebrow className="justify-center">
          {aboutFinalCtaContent.eyebrow}
        </Eyebrow>
        <h2
          id="about-final-cta-heading"
          className="font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl"
        >
          {aboutFinalCtaContent.heading}
        </h2>
        <p className="max-w-[55ch] text-lg text-foreground-muted">
          {aboutFinalCtaContent.supportingStatement}
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <CtaLink
            href={aboutFinalCtaContent.primaryCta.href}
            variant="primary"
          >
            {aboutFinalCtaContent.primaryCta.label}
          </CtaLink>
          <CtaLink
            href={aboutFinalCtaContent.secondaryCta.href}
            variant="secondary"
          >
            {aboutFinalCtaContent.secondaryCta.label}
          </CtaLink>
        </div>
      </div>
    </Section>
  );
}
