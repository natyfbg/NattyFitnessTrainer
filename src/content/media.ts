/**
 * Centralized media configuration for the homepage plus the dedicated
 * /coaching and /about pages. Every slot is `null` until a real,
 * repository-managed image (see public/images/README.md) is added — never
 * a fake or stock path. Components read these through PhotoFrame
 * (src/components/photo-frame.tsx), which only renders next/image when a
 * slot is non-null and otherwise shows a branded fallback.
 */

export interface HomeImage {
  readonly src: string;
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
  heroPortrait: null,
  heroDetail: null,
  coachingAction: null,
  aboutTrainerPortrait: null,
  aboutCoachingInteraction: null,
  aboutTrainingAction: null,
  lifestyleBand: null,
  nfgScreenshotPrimary: null,
  nfgScreenshotSecondary: null,
  coachingHeroImage: null,
  coachingEnvironmentImage: null,
  aboutPageHeroPortrait: null,
  aboutPageTrainingAction: null,
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
