/**
 * Typed content for the dedicated /faq page. The questions themselves live
 * in src/content/faq.ts (the single centralized FAQ source) — this file
 * only holds the page's own hero/section copy.
 */
import type { HomeCta } from "./home";

export const faqHeroContent = {
  eyebrow: "FAQ",
  headline: "Frequently Asked Questions",
  supportingStatement:
    "Practical answers about coaching formats, programming, and nutrition guidance — before you book your free consultation.",
} as const;

export const faqExploreContent = {
  heading: "Want more detail?",
  supportingStatement:
    "Explore coaching formats in depth or learn more about Nathnael's background and philosophy.",
  coachingCta: { label: "Explore Coaching", href: "/coaching" } as HomeCta,
  aboutCta: { label: "About Nathnael", href: "/about" } as HomeCta,
} as const;
