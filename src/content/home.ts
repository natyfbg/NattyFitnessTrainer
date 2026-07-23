/**
 * Homepage-specific editorial copy (headlines, section intros, CTA
 * wording). Business facts (credentials, coaching styles, process, FAQ)
 * live in their own dedicated content files and are read directly by
 * homepage components rather than duplicated here.
 */

export interface HomeCta {
  readonly label: string;
  readonly href: string;
}

export interface HeroContent {
  readonly eyebrow: string;
  readonly headline: string;
  readonly supportingStatement: string;
  readonly primaryCta: HomeCta;
  readonly secondaryCta: HomeCta;
}

export const heroContent: HeroContent = {
  eyebrow: "Personal Training — Bay Area & Online",
  headline: "Disciplined coaching for lasting strength and progress.",
  supportingStatement:
    "Personalized programming and monthly progress assessments, built around your goals — online, hybrid, or in person in the Bay Area.",
  primaryCta: { label: "Book a Free Consultation", href: "/consultation" },
  secondaryCta: { label: "Explore Coaching", href: "/#coaching" },
};

export interface SectionIntro {
  readonly eyebrow: string;
  readonly heading: string;
  readonly supportingStatement?: string;
}

export const coachingSectionIntro: SectionIntro = {
  eyebrow: "Coaching",
  heading: "Choose the coaching style that fits your life",
  supportingStatement:
    "Every plan is personalized — the difference is how closely we work together day to day.",
};

export const howItWorksSectionIntro: SectionIntro = {
  eyebrow: "How It Works",
  heading: "A simple, structured path",
};

export const aboutSectionIntro: SectionIntro = {
  eyebrow: "About",
  heading: "Meet Nathnael Gebre",
};

export const aboutCta: HomeCta = {
  label: "Book a Free Consultation",
  href: "/consultation",
};

export const nfgAppSectionIntro: SectionIntro = {
  eyebrow: "Coming Soon",
  heading: "The NFG App",
};

export const insightsSectionIntro: SectionIntro = {
  eyebrow: "Insights",
  heading: "Fitness Research, Guides & Practical Advice",
};

export const insightsEmptyStateMessage =
  "Articles are in progress and will be published here soon. Check back for evidence-informed fitness research, guides, and practical advice.";

export const faqSectionIntro: SectionIntro = {
  eyebrow: "FAQ",
  heading: "Common Questions",
};

export interface ConsultationSectionContent {
  readonly eyebrow: string;
  readonly heading: string;
  readonly supportingStatement: string;
  readonly cta: HomeCta;
}

export const consultationSection: ConsultationSectionContent = {
  eyebrow: "Get Started",
  heading: "Ready to start your free consultation?",
  supportingStatement: "Free, no obligation, and takes just a few minutes.",
  cta: { label: "Book a Free Consultation", href: "/consultation" },
};
