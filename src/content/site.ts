export const SITE_NAME = "Natty Fitness Trainer" as const;

export const SITE_TAGLINE =
  "Personal training and coaching with Nathnael Gebre." as const;

const DEFAULT_SITE_URL =
  "https://natty-fitness-trainer.natyfbg.workers.dev" as const;

/**
 * Canonical site URL used for absolute links, metadata, and JSON-LD.
 * Overridable via the public NEXT_PUBLIC_SITE_URL env var once a custom
 * domain is confirmed — see docs/deployment.md. This is a public value,
 * not a secret.
 */
export const SITE_URL: string = (
  process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL
).replace(/\/$/, "");

export const SITE_LOCALE = "en-US" as const;

/**
 * Builds an absolute, canonical URL for a site-relative path (e.g.
 * "/insights" or `/insights/${slug}`). Uses the URL constructor rather than
 * manual string concatenation, so it safely handles any trailing-slash
 * differences between SITE_URL and the given path.
 */
export function getCanonicalUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

export interface CallToAction {
  readonly label: string;
  /** null until the consultation booking flow is built. */
  readonly href: string | null;
}

/** Free consultation is the site's primary conversion action. */
export const primaryCallToAction: CallToAction = {
  label: "Book a Free Consultation",
  href: null,
};
