import type { Metadata } from "next";
import { Container } from "@/components/container";
import { CtaLink } from "@/components/cta-link";

export const metadata: Metadata = {
  title: "Thank You",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ConsultationThankYouPage() {
  return (
    <main className="flex flex-1 items-center py-16 sm:py-20 lg:py-24">
      <Container narrow>
        <p className="text-sm font-medium tracking-wide text-gold">
          Consultation Request
        </p>
        <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
          Thanks — your request is on its way.
        </h1>
        <p className="mt-4 max-w-[60ch] text-lg text-foreground-muted">
          If you just submitted the consultation form successfully, your request
          has been received. Submitting this form does not confirm a coaching
          booking — expect a personal reply rather than an automatic
          confirmation.
        </p>
        <p className="mt-4 max-w-[60ch] text-foreground-muted">
          A more detailed fitness assessment may follow as part of getting
          started, once we connect.
        </p>
        <CtaLink href="/" variant="secondary" className="mt-8">
          Back to Home
        </CtaLink>
      </Container>
    </main>
  );
}
