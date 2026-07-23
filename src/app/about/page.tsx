import type { Metadata } from "next";
import { AboutHero } from "@/components/about/about-hero";
import { TrustStrip } from "@/components/home/trust-strip";
import { PersonalIntroduction } from "@/components/about/personal-introduction";
import { PhilosophySection } from "@/components/about/philosophy-section";
import { TechnicalBackgroundSection } from "@/components/about/technical-background-section";
import { ClientExpectationsSection } from "@/components/about/client-expectations-section";
import { AboutFinalCta } from "@/components/about/about-final-cta";
import { SITE_NAME, SITE_LOCALE, getCanonicalUrl } from "@/content/site";

const title = "About";
const description =
  "Nathnael Gebre is an NFPT Certified Personal Trainer with seven years of training experience, coaching online, hybrid, and in person in the Bay Area with a structured, sustainable training philosophy.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: getCanonicalUrl("/about"),
  },
  openGraph: {
    title: `${title} | ${SITE_NAME}`,
    description,
    url: getCanonicalUrl("/about"),
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: `${title} | ${SITE_NAME}`,
    description,
  },
};

export default function AboutPage() {
  return (
    <main>
      <AboutHero />
      <TrustStrip />
      <PersonalIntroduction />
      <PhilosophySection />
      <TechnicalBackgroundSection />
      <ClientExpectationsSection />
      <AboutFinalCta />
    </main>
  );
}
