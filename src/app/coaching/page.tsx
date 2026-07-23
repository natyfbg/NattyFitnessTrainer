import type { Metadata } from "next";
import { CoachingHero } from "@/components/coaching/coaching-hero";
import { CoachingPhilosophy } from "@/components/coaching/coaching-philosophy";
import { CoachingFormats } from "@/components/coaching/coaching-formats";
import { FormatComparison } from "@/components/coaching/format-comparison";
import { HowItWorks } from "@/components/home/how-it-works";
import { ProgrammingConsiderations } from "@/components/coaching/programming-considerations";
import { CoachingExpectations } from "@/components/coaching/coaching-expectations";
import { CoachingFaq } from "@/components/coaching/coaching-faq";
import { ConsultationCta } from "@/components/home/consultation-cta";
import { SITE_NAME, SITE_LOCALE, getCanonicalUrl } from "@/content/site";

const title = "Coaching";
const description =
  "Online coaching, hybrid coaching, and in-person personal training in the Bay Area — personalized programming for strength, fat loss, and general fitness, matched to your goals and schedule.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: getCanonicalUrl("/coaching"),
  },
  openGraph: {
    title: `${title} | ${SITE_NAME}`,
    description,
    url: getCanonicalUrl("/coaching"),
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

export default function CoachingPage() {
  return (
    <main>
      <CoachingHero />
      <CoachingPhilosophy />
      <CoachingFormats />
      <FormatComparison />
      <HowItWorks />
      <ProgrammingConsiderations />
      <CoachingExpectations />
      <CoachingFaq />
      <ConsultationCta />
    </main>
  );
}
