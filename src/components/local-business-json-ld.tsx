import {
  DEFAULT_SOCIAL_IMAGE,
  HOME_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  getCanonicalUrl,
} from "@/content/site";
import { trainer } from "@/content/trainer";

/** Stable ids so the business and Person JSON-LD can point at each other. */
export const BUSINESS_JSON_LD_ID = `${SITE_URL}/#business`;
export const PERSON_JSON_LD_ID = `${SITE_URL}/#nathnael-gebre`;

interface CitySchema {
  readonly "@type": "City";
  readonly name: string;
}

interface LocalBusinessJsonLdSchema {
  readonly "@context": "https://schema.org";
  readonly "@type": "ProfessionalService";
  readonly "@id": string;
  readonly name: string;
  readonly description: string;
  readonly url: string;
  readonly image: string;
  readonly logo: string;
  readonly telephone?: string;
  readonly email?: string;
  readonly areaServed: readonly CitySchema[];
  readonly founder: { readonly "@id": string };
  readonly sameAs?: readonly string[];
}

/** "(707) 861-0580" → "+1-707-861-0580", the international form search engines prefer. */
function toInternationalPhone(phone: string | null): string | undefined {
  const digits = phone?.replace(/\D/g, "") ?? "";
  if (digits.length !== 10) {
    return undefined;
  }
  return `+1-${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/**
 * Local-business JSON-LD for the homepage: what the business is, the cities
 * it serves and how to reach it. Nathnael meets clients at their gym or home
 * (a service-area business), so there's deliberately no street address,
 * matching his Google Business Profile. Only confirmed facts from
 * src/content/trainer.ts and site.ts; no prices, ratings or hours.
 */
export function LocalBusinessJsonLd() {
  const sameAs = [
    trainer.social.instagram,
    trainer.social.tiktok,
    trainer.social.youtube,
  ].filter((url): url is string => url !== null);
  const telephone = toInternationalPhone(trainer.contact.phone);

  const json: LocalBusinessJsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": BUSINESS_JSON_LD_ID,
    name: SITE_NAME,
    description: HOME_DESCRIPTION,
    url: getCanonicalUrl("/"),
    image: getCanonicalUrl(DEFAULT_SOCIAL_IMAGE.url),
    logo: getCanonicalUrl("/icon.png"),
    ...(telephone ? { telephone } : {}),
    ...(trainer.contact.email ? { email: trainer.contact.email } : {}),
    areaServed: trainer.serviceAreas.map((city) => ({
      "@type": "City",
      name: `${city}, CA`,
    })),
    founder: { "@id": PERSON_JSON_LD_ID },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
  // Guard against "</script>" sequences breaking out of the script tag.
  const safeJson = JSON.stringify(json).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson }}
    />
  );
}
