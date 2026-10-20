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
import {
  DEFAULT_SOCIAL_IMAGE,
  SITE_NAME,
  SITE_LOCALE,
  getCanonicalUrl,
} from "@/content/site";
import { serviceAreaList } from "@/content/trainer";

const title = "Personal Training in Oakland, SF & the East Bay";
const description = `In-person personal training at your gym or home in ${serviceAreaList}, plus online and hybrid coaching.`;

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
    images: [DEFAULT_SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
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
