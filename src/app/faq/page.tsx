import type { Metadata } from "next";
import { FaqHero } from "@/components/faq/faq-hero";
import { FaqGroupSection } from "@/components/faq/faq-group-section";
import { FaqExploreLinks } from "@/components/faq/faq-explore-links";
import { ConsultationCta } from "@/components/home/consultation-cta";
import { SITE_NAME, SITE_LOCALE, getCanonicalUrl } from "@/content/site";

const title = "FAQ";
const description =
  "Answers to common questions about online coaching, hybrid coaching, in-person personal training in the Bay Area, personalized programming, and general nutrition guidance.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: getCanonicalUrl("/faq"),
  },
  openGraph: {
    title: `${title} | ${SITE_NAME}`,
    description,
    url: getCanonicalUrl("/faq"),
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

export default function FaqPage() {
  return (
    <main>
      <FaqHero />
      <FaqGroupSection categoryId="getting-started" tone="default" />
      <FaqGroupSection categoryId="coaching-formats" tone="elevated" />
      <FaqGroupSection categoryId="programming-and-progress" tone="default" />
      <FaqGroupSection categoryId="nutrition" tone="elevated" />
      <FaqExploreLinks />
      <ConsultationCta />
    </main>
  );
}
