import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { Eyebrow } from "@/components/eyebrow";
import { ConsultationForm } from "@/components/consultation/consultation-form";
import {
  consultationPageContent,
  consultationUnavailableMessage,
} from "@/content/consultation";
import { getCanonicalUrl } from "@/content/site";
import {
  isConsultationDevBypassActive,
  isConsultationFormEnabled,
} from "@/lib/consultation/config";

export const metadata: Metadata = {
  title: "Free Consultation",
  description: consultationPageContent.intro,
  alternates: {
    canonical: getCanonicalUrl("/consultation"),
  },
};

export default function ConsultationPage() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const hasSiteKey = Boolean(siteKey);
  // Outside production, the dev bypass can stand in for a real Turnstile
  // site key so the form UI can be exercised without any credentials. In
  // production this is always false, so a valid site key is still required.
  const devBypassActive = isConsultationDevBypassActive();
  const available =
    isConsultationFormEnabled() && (hasSiteKey || devBypassActive);
  const turnstileBypassActive = devBypassActive && !hasSiteKey;

  return (
    <main className="py-16 sm:py-20 lg:py-24">
      <Container narrow>
        <Eyebrow>{consultationPageContent.eyebrow}</Eyebrow>
        <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
          {consultationPageContent.heading}
        </h1>
        <p className="mt-4 max-w-[60ch] text-lg text-foreground-muted">
          {consultationPageContent.intro}
        </p>
        <p className="mt-4 max-w-[60ch] text-sm text-foreground-muted">
          {consultationPageContent.afterSubmitNote}
        </p>
        <p className="mt-4 max-w-[60ch] text-sm font-medium text-gold">
          {consultationPageContent.safetyNote}
        </p>

        <div className="mt-10 border-t border-border pt-10">
          {available ? (
            <ConsultationForm
              turnstileSiteKey={siteKey ?? null}
              turnstileBypassActive={turnstileBypassActive}
            />
          ) : (
            <p className="rounded-card border border-border bg-background-elevated p-6 text-foreground-muted">
              {consultationUnavailableMessage}
            </p>
          )}
        </div>

        <p className="mt-8 text-sm text-foreground-muted">
          Read the{" "}
          <Link href="/privacy" className="underline hover:no-underline">
            privacy notice
          </Link>{" "}
          for how this information is used.
        </p>
      </Container>
    </main>
  );
}
