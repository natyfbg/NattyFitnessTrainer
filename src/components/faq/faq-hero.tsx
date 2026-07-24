import { Container } from "@/components/container";
import { Eyebrow } from "@/components/eyebrow";
import { faqHeroContent } from "@/content/faq-page";

export function FaqHero() {
  return (
    <section className="border-b border-border bg-background pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
      <Container narrow>
        <Eyebrow>{faqHeroContent.eyebrow}</Eyebrow>
        <h1 className="mt-4 font-display text-4xl leading-[1.1] font-medium tracking-tight text-foreground sm:text-5xl">
          {faqHeroContent.headline}
        </h1>
        <p className="mt-4 max-w-[60ch] text-lg text-foreground-muted">
          {faqHeroContent.supportingStatement}
        </p>
      </Container>
    </section>
  );
}
