/**
 * Typed content for the dedicated /coaching page. Business facts
 * (trainer credentials, training styles, process steps, FAQ) are reused
 * directly from their own content files — this file only holds
 * page-specific editorial copy and the expanded per-format explanations
 * that don't belong anywhere else.
 *
 * No pricing, package inclusions, session counts, response times, or
 * service-radius claims are defined here — none of that is confirmed yet.
 */
import type { TrainingStyleId } from "./coaching";
import type { HomeCta, SectionIntro } from "./home";

export interface CoachingHeroContent {
  readonly eyebrow: string;
  readonly headline: string;
  readonly supportingStatement: string;
  readonly primaryCta: HomeCta;
  readonly secondaryCta: HomeCta;
}

export const coachingHeroContent: CoachingHeroContent = {
  eyebrow: "Coaching",
  headline: "Personal training built around how you actually train.",
  supportingStatement:
    "Personalized programming across online, hybrid, and in-person coaching — matched to your goals, schedule, and experience.",
  primaryCta: { label: "Book a Free Consultation", href: "/consultation" },
  secondaryCta: {
    label: "Compare Coaching Formats",
    href: "/coaching#format-comparison",
  },
};

export const coachingPhilosophyIntro: SectionIntro = {
  eyebrow: "Approach",
  heading: "Programs are built around you, not a template",
  supportingStatement:
    "Your goals, schedule, experience, equipment, and training environment all shape the plan — and it's adjusted as you go, not treated as fixed from day one.",
};

export const coachingPhilosophyPoints: readonly string[] = [
  "Sustainable progress is the goal — not extreme, short-term promises.",
  "Plans reflect your actual schedule, equipment, and experience level.",
  "Coaching includes ongoing review and adjustment, not a static handout.",
];

export interface CoachingFormatDetail {
  readonly id: TrainingStyleId;
  readonly suitedFor: string;
  readonly howItWorks: string;
  readonly advantages: readonly string[];
  readonly limitations: readonly string[];
}

export const coachingFormatsIntro: SectionIntro = {
  eyebrow: "Coaching Formats",
  heading: "Choose the format that fits your life",
  supportingStatement:
    "Every format includes personalized programming and monthly progress assessments — the difference is how coaching is delivered.",
};

export const coachingFormatDetails: readonly CoachingFormatDetail[] = [
  {
    id: "online",
    suitedFor:
      "People who want expert programming and accountability while training on their own schedule, wherever they are.",
    howItWorks:
      "You train independently from a plan built around your goals, equipment, and schedule, with monthly check-ins to review progress and adjust the plan.",
    advantages: [
      "Train anywhere, on your own schedule",
      "No commute or location requirement",
      "Programming adapts to your equipment and experience",
    ],
    limitations: [
      "No in-person supervision during workouts",
      "Relies on your own follow-through between check-ins",
      "Best suited to people comfortable training independently",
    ],
  },
  {
    id: "hybrid",
    suitedFor:
      "People who want some hands-on coaching plus the flexibility of independent training.",
    howItWorks:
      "Combines in-person sessions in the Bay Area with online programming and check-ins for the training you do on your own.",
    advantages: [
      "Direct in-person coaching for form and technique",
      "Flexibility to train independently between sessions",
      "Programming adjusts as you progress",
    ],
    limitations: [
      "In-person portion is limited to the Bay Area",
      "Requires coordinating in-person and independent training",
      "Not fully remote",
    ],
  },
  {
    id: "in-person",
    suitedFor:
      "People in the Bay Area who want direct, hands-on coaching during every session.",
    howItWorks:
      "Train together in person, with hands-on coaching, technique correction, and a plan that's reviewed monthly and adjusted as you go.",
    advantages: [
      "Direct, hands-on coaching and technique correction",
      "Consistent accountability during scheduled sessions",
      "Immediate feedback and in-session adjustments",
    ],
    limitations: [
      "Only available in the Bay Area",
      "Requires availability for in-person sessions",
      "Less flexible than remote options",
    ],
  },
];

export interface ComparisonRow {
  readonly label: string;
  readonly online: string;
  readonly hybrid: string;
  readonly inPerson: string;
}

export const formatComparisonIntro: SectionIntro = {
  eyebrow: "Compare",
  heading: "At a glance",
};

/** Only confirmed distinctions — no session counts, check-in frequency, or pricing. */
export const formatComparisonRows: readonly ComparisonRow[] = [
  {
    label: "Primary training location",
    online: "Anywhere (remote)",
    hybrid: "Bay Area + remote",
    inPerson: "Bay Area, in person",
  },
  {
    label: "Live interaction level",
    online: "Asynchronous check-ins",
    hybrid: "Mix of in-person and asynchronous",
    inPerson: "Live, in person every session",
  },
  {
    label: "Geographic flexibility",
    online: "Full — train from anywhere",
    hybrid: "Partial — Bay Area needed for in-person sessions",
    inPerson: "None — Bay Area required",
  },
  {
    label: "Suited to independent training",
    online: "Yes — self-directed between check-ins",
    hybrid: "Partly — mix of guided and independent",
    inPerson: "Not required — fully guided",
  },
  {
    label: "Bay Area requirement",
    online: "Not required",
    hybrid: "Required for in-person sessions",
    inPerson: "Required",
  },
];

export const programmingConsiderationsIntro: SectionIntro = {
  eyebrow: "Personalization",
  heading: "What your program takes into account",
};

export const programmingConsiderations: readonly string[] = [
  "Primary goals",
  "Experience level",
  "Weekly schedule",
  "Training environment",
  "Available equipment",
  "Exercise preferences",
  "Current ability",
];

export const coachingExpectationsContent = {
  eyebrow: "Expectations",
  heading: "Realistic, honest expectations",
  body: "Results vary from person to person, and consistency matters more than any single workout. Coaching is not a substitute for medical care — if you have a medical concern, please consult an appropriate healthcare professional.",
} as const;

export const coachingFaqIntro: SectionIntro = {
  eyebrow: "FAQ",
  heading: "Coaching Questions",
};

export const coachingFinalCta: HomeCta = {
  label: "Book a Free Consultation",
  href: "/consultation",
};
