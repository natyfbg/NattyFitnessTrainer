/**
 * Typed content for the dedicated /about page. Confirmed trainer facts
 * (name, credentials, years of experience, philosophy, technical
 * background) are reused from src/content/trainer.ts — this file only
 * holds page-specific editorial copy that expands on those facts.
 *
 * No invented childhood stories, competitions, injuries, transformations,
 * dates, awards, or personal events. No guaranteed results or fixed
 * response times.
 */
import type { HomeCta, SectionIntro } from "./home";

export interface AboutHeroContent {
  readonly eyebrow: string;
  readonly headline: string;
  readonly supportingStatement: string;
  readonly primaryCta: HomeCta;
  readonly secondaryCta: HomeCta;
}

export const aboutHeroContent: AboutHeroContent = {
  eyebrow: "About",
  headline: "Meet Nathnael Gebre",
  supportingStatement:
    "NFPT Certified Personal Trainer with seven years of hands-on training experience, coaching online, hybrid, and in person in the Bay Area.",
  primaryCta: { label: "Book a Free Consultation", href: "/consultation" },
  secondaryCta: { label: "Explore Coaching", href: "/coaching" },
};

export const personalIntroductionIntro: SectionIntro = {
  eyebrow: "Background",
  heading: "A structured, sustainable approach to training",
};

export const personalIntroductionParagraphs: readonly string[] = [
  "Nathnael Gebre has spent seven years building hands-on training experience, working with clients across strength, fat loss, and general fitness goals.",
  "His approach favors structure and realistic progression — programs are built around the individual rather than a generic template, and adjusted along the way rather than treated as fixed from day one.",
];

export const philosophyIntro: SectionIntro = {
  eyebrow: "Philosophy",
  heading: "How coaching decisions get made",
};

export interface PhilosophyPrinciple {
  readonly title: string;
  readonly description: string;
}

export const philosophyPrinciples: readonly PhilosophyPrinciple[] = [
  {
    title: "Sustainable Habits",
    description: "Training built to fit into your life, not disrupt it.",
  },
  {
    title: "Disciplined Consistency",
    description:
      "Steady, repeatable effort over time, rather than short bursts of intensity.",
  },
  {
    title: "Realistic Progression",
    description:
      "Programs built for lasting progress — not extreme, short-term promises.",
  },
  {
    title: "Individualized Programming",
    description:
      "Plans shaped around your goals, schedule, experience, and equipment.",
  },
  {
    title: "Accountability Without Intimidation",
    description:
      "Consistent follow-through, delivered without pressure or judgment.",
  },
  {
    title: "Ongoing Adjustment",
    description:
      "Plans are reviewed and adjusted based on how you're actually progressing.",
  },
];

export const technicalBackgroundIntro: SectionIntro = {
  eyebrow: "Technical Background",
  heading: "A software background shapes how programs are built",
};

export const technicalBackgroundPoints: readonly string[] = [
  "Structured planning, applied to how programs are built and organized",
  "Attention to detail in tracking progress over time",
  "Evidence-informed decisions rather than guesswork",
  "Iterative adjustment — refining the plan based on what the data shows",
];

/** The NFG app is in development — never overstate its current capabilities here. */
export const technicalBackgroundNote =
  "This same background is shaping the NFG app, currently in development — see the homepage for an honest look at where it stands today." as const;

export const clientExpectationsIntro: SectionIntro = {
  eyebrow: "What to Expect",
  heading: "What clients can expect",
};

export const clientExpectations: readonly string[] = [
  "Clear communication about your plan and progress",
  "Structured programming built around your goals",
  "Practical, actionable guidance",
  "Regular progress reviews",
  "Adjustments to your plan when needed",
  "Respect for your individual circumstances and schedule",
];

export interface AboutFinalCtaContent {
  readonly eyebrow: string;
  readonly heading: string;
  readonly supportingStatement: string;
  readonly primaryCta: HomeCta;
  readonly secondaryCta: HomeCta;
}

export const aboutFinalCtaContent: AboutFinalCtaContent = {
  eyebrow: "Get Started",
  heading: "Ready to work together?",
  supportingStatement:
    "Explore the coaching formats or book a free consultation to talk through your goals.",
  primaryCta: { label: "Book a Free Consultation", href: "/consultation" },
  secondaryCta: { label: "Explore Coaching", href: "/coaching" },
};
