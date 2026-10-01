/**
 * Centralized media configuration for the homepage plus the dedicated
 * /coaching and /about pages. Every slot is `null` until a real,
 * repository-managed image (see public/images/README.md) is added — never
 * a fake or stock path. Components read these through PhotoFrame
 * (src/components/photo-frame.tsx), which only renders next/image when a
 * slot is non-null and otherwise shows a branded fallback.
 */

import type { StaticImageData } from "next/image";
import heroPortraitMedball from "../../public/images/home/hero-portrait-medball-1600x2000.webp";
import lifestyleStairClimber from "../../public/images/home/lifestyle-stair-climber-2560x1440.webp";
import aboutTeaserCurlFocus from "../../public/images/about/about-teaser-curl-focus-1600x2000.webp";
import aboutHeroCurlSmile from "../../public/images/about/about-hero-curl-smile-1600x2000.webp";
import coachingHeroPullup from "../../public/images/coaching/coaching-hero-pullup-1600x2000.webp";
import aboutTrainingLegExtension from "../../public/images/about/about-training-leg-extension-1600x2000.webp";

export interface HomeImage {
  /**
   * Prefer a static import of the file (e.g. `import x from
   * "../../public/images/home/x.webp"`): Next.js content-hashes it under
   * /_next/static/media, which lets the Cloudflare image optimizer serve it
   * with a long-lived immutable cache header and a blur placeholder. A plain
   * "/images/..." string still works but is re-optimized on every request.
   */
  readonly src: StaticImageData | string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
  /** CSS object-position value, e.g. "center top". */
  readonly objectPosition?: string;
  /** Only set when a caption is genuinely needed. */
  readonly caption?: string;
}

export interface HomeMedia {
  /** Primary hero portrait, ~4:5. */
  readonly heroPortrait: HomeImage | null;
  /** Optional smaller hero action/detail photograph. */
  readonly heroDetail: HomeImage | null;
  /** Wide supporting image after the coaching style cards. */
  readonly coachingAction: HomeImage | null;
  /** About section — trainer portrait variant (first priority). */
  readonly aboutTrainerPortrait: HomeImage | null;
  /** About section — coaching interaction variant (second priority). */
  readonly aboutCoachingInteraction: HomeImage | null;
  /** About section — training-action variant (third priority). */
  readonly aboutTrainingAction: HomeImage | null;
  /** Full-width lifestyle/training-environment band. */
  readonly lifestyleBand: HomeImage | null;
  /** Primary NFG app screenshot. */
  readonly nfgScreenshotPrimary: HomeImage | null;
  /** Optional secondary NFG app screenshot. */
  readonly nfgScreenshotSecondary: HomeImage | null;

  /** /coaching page hero visual. */
  readonly coachingHeroImage: HomeImage | null;
  /** /coaching page — training environment/equipment photograph. */
  readonly coachingEnvironmentImage: HomeImage | null;

  /** /about page hero portrait (separate from the homepage About teaser's slots). */
  readonly aboutPageHeroPortrait: HomeImage | null;
  /** /about page — training-action photograph. */
  readonly aboutPageTrainingAction: HomeImage | null;
  /** /about page — candid coaching-interaction photograph (requires client permission). */
  readonly aboutPageCoachingInteraction: HomeImage | null;
  /** /about page — technical/online-coaching-context photograph. */
  readonly aboutPageTechnicalScene: HomeImage | null;
}

export const homeMedia: HomeMedia = {
  heroPortrait: {
    src: heroPortraitMedball,
    alt: "Nathnael Gebre smiling in a gym, holding a black medicine ball in front of him under warm hanging lights.",
  },
  heroDetail: null,
  coachingAction: null,
  aboutTrainerPortrait: {
    src: aboutTeaserCurlFocus,
    alt: "Nathnael Gebre performing a dumbbell biceps curl in front of a black-and-white poster wall.",
  },
  aboutCoachingInteraction: null,
  aboutTrainingAction: null,
  lifestyleBand: {
    src: lifestyleStairClimber,
    alt: "Nathnael Gebre standing beside a row of stair-climber machines next to floor-to-ceiling gym windows.",
    // The band renders at 2:1 (mobile) and 21:9 (sm+), which trims the
    // top and bottom of this 16:9 photo — anchor near the top so the
    // subject's head is never cropped.
    objectPosition: "center 15%",
  },
  nfgScreenshotPrimary: null,
  nfgScreenshotSecondary: null,
  coachingHeroImage: {
    src: coachingHeroPullup,
    alt: "Nathnael Gebre gripping a pull-up bar in a bright, modern gym.",
  },
  coachingEnvironmentImage: null,
  aboutPageHeroPortrait: {
    src: aboutHeroCurlSmile,
    alt: "Nathnael Gebre smiling at the camera during a dumbbell curl in front of a poster-covered gym wall.",
  },
  aboutPageTrainingAction: {
    src: aboutTrainingLegExtension,
    alt: "Nathnael Gebre seated on a leg extension machine in a bright gym with floor-to-ceiling windows.",
  },
  aboutPageCoachingInteraction: null,
  aboutPageTechnicalScene: null,
};

/**
 * The About section renders exactly one image, picked in priority order
 * from the three configured variants, so a future editor can supply
 * whichever photo becomes available first without changing any layout.
 */
export function getAboutImage(): HomeImage | null {
  return (
    homeMedia.aboutTrainerPortrait ??
    homeMedia.aboutCoachingInteraction ??
    homeMedia.aboutTrainingAction ??
    null
  );
}
