import type { Metadata } from "next";
import { Container } from "@/components/container";
import { CtaLink } from "@/components/cta-link";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center py-16 sm:py-20 lg:py-24">
      <Container narrow>
        <p className="text-sm font-medium tracking-wide text-gold">404</p>
        <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-4 max-w-[60ch] text-lg text-foreground-muted">
          The page you&rsquo;re looking for doesn&rsquo;t exist or may have
          moved. Here are a few places to go instead:
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <CtaLink href="/" variant="secondary">
            Home
          </CtaLink>
          <CtaLink href="/coaching" variant="secondary">
            Coaching
          </CtaLink>
          <CtaLink href="/insights" variant="secondary">
            Insights
          </CtaLink>
          <CtaLink href="/consultation" variant="primary">
            Free Consultation
          </CtaLink>
        </div>
      </Container>
    </main>
  );
}
