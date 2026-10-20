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
import { PersonJsonLd } from "@/components/person-json-ld";
import { LocalBusinessJsonLd } from "@/components/local-business-json-ld";
import {
  DEFAULT_SOCIAL_IMAGE,
  HOME_DESCRIPTION,
  HOME_TITLE,
  SITE_NAME,
  SITE_LOCALE,
  getCanonicalUrl,
} from "@/content/site";

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: getCanonicalUrl("/"),
  },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: getCanonicalUrl("/"),
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    type: "website",
    images: [DEFAULT_SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
};

export default function Home() {
  return (
    <main>
      <LocalBusinessJsonLd />
      <PersonJsonLd />
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
