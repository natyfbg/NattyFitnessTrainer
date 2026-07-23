import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { TrustStrip } from "@/components/home/trust-strip";
import { CoachingStyles } from "@/components/home/coaching-styles";
import { HowItWorks } from "@/components/home/how-it-works";
import { LifestyleBand } from "@/components/home/lifestyle-band";
import { AboutSection } from "@/components/home/about-section";
import { NfgAppPreview } from "@/components/home/nfg-app-preview";
import { InsightsPreview } from "@/components/home/insights-preview";
import { FaqPreview } from "@/components/home/faq-preview";
import { ConsultationCta } from "@/components/home/consultation-cta";
import {
  SITE_NAME,
  SITE_TAGLINE,
  SITE_LOCALE,
  getCanonicalUrl,
} from "@/content/site";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_TAGLINE,
  alternates: {
    canonical: getCanonicalUrl("/"),
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_TAGLINE,
    url: getCanonicalUrl("/"),
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: SITE_TAGLINE,
  },
};

export default function Home() {
  return (
    <main>
      <Hero />
      <TrustStrip />
      <CoachingStyles />
      <HowItWorks />
      <LifestyleBand />
      <AboutSection />
      <NfgAppPreview />
      <InsightsPreview />
      <FaqPreview />
      <ConsultationCta />
    </main>
  );
}
