export const SITE_NAME = "Natty Fitness Trainer" as const;

export const SITE_TAGLINE =
  "Personal training and coaching with Nathnael Gebre." as const;

const DEFAULT_SITE_URL = "https://www.nattyfitnesstrainer.com" as const;

/**
 * Canonical site URL used for absolute links, metadata, and JSON-LD.
 * Defaults to the production custom domain (the www host is canonical; the
 * bare domain redirects to it). Overridable via the public
 * NEXT_PUBLIC_SITE_URL env var — see docs/deployment.md. This is a public
 * value, not a secret.
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

/**
 * Default social-sharing (Open Graph / Twitter) image. Next.js replaces a
 * parent's `openGraph` object entirely when a page defines its own, so every
 * page that sets `openGraph` must include this in `openGraph.images`
 * explicitly (Twitter falls back to the Open Graph image automatically).
 */
export const DEFAULT_SOCIAL_IMAGE = {
  url: "/images/brand/social-share-1200x630.jpg",
  width: 1200,
  height: 630,
  alt: "Nathnael Gebre, NFPT Certified Personal Trainer, smiling in a gym.",
} as const;
