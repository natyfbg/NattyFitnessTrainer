import { SITE_NAME, SITE_URL, getCanonicalUrl } from "@/content/site";
import { trainer } from "@/content/trainer";

interface PersonJsonLdSchema {
  readonly "@context": "https://schema.org";
  readonly "@type": "Person";
  readonly name: string;
  readonly jobTitle: string;
  readonly description: string;
  readonly url: string;
  readonly areaServed: string;
  readonly worksFor: {
    readonly "@type": "Organization";
    readonly name: string;
    readonly url: string;
  };
  readonly sameAs?: readonly string[];
}

/**
 * Person JSON-LD for Nathnael, linking the site to his verified social
 * profiles (`sameAs`) so search engines can connect them. Only confirmed
 * facts from src/content/trainer.ts — no address or invented details.
 */
export function PersonJsonLd() {
  const sameAs = [
    trainer.social.instagram,
    trainer.social.tiktok,
    trainer.social.youtube,
  ].filter((url): url is string => url !== null);

  const json: PersonJsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: trainer.name,
    jobTitle: "Personal Trainer",
    description: `${trainer.credentials.join(", ")} with ${trainer.yearsOfExperience} years of training experience.`,
    url: getCanonicalUrl("/about"),
    areaServed: trainer.serviceAreaLabel,
    worksFor: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
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
