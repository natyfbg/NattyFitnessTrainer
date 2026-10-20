export interface TrainerSocialLinks {
  /** Full profile URL, or null until provided. */
  readonly instagram: string | null;
  /** Full profile URL, or null until provided. */
  readonly tiktok: string | null;
  /** Full channel URL, or null until provided. */
  readonly youtube: string | null;
}

export interface TrainerContact {
  readonly email: string | null;
  readonly phone: string | null;
}

export interface Trainer {
  readonly name: string;
  readonly credentials: readonly string[];
  readonly yearsOfExperience: number;
  /** Short, general label for compact copy ("Bay Area"). */
  readonly serviceAreaLabel: string;
  /**
   * Cities Nathnael confirmed for in-person and hybrid sessions (2026-10-20).
   * They match his Google Business Profile service areas, so keep the two in
   * step. Never name a city on the site that isn't in this list.
   */
  readonly serviceAreas: readonly string[];
  /** Where in-person sessions happen, as confirmed by Nathnael. */
  readonly inPersonLocations: string;
  /** No full-length biography copy has been provided yet; see docs/content-management.md. */
  readonly bio: string | null;
  /** Coaching philosophy/approach — safe as authored brand voice, not a factual claim. */
  readonly philosophy: string;
  /** Software/technical background, framed as a differentiator, with no invented specifics (no employer, years, or technology named). */
  readonly technicalBackground: string;
  readonly social: TrainerSocialLinks;
  readonly contact: TrainerContact;
}

export const trainer: Trainer = {
  name: "Nathnael Gebre",
  credentials: ["NFPT Certified Personal Trainer"],
  yearsOfExperience: 7,
  serviceAreaLabel: "Bay Area",
  serviceAreas: [
    "Oakland",
    "Emeryville",
    "Berkeley",
    "Piedmont",
    "San Francisco",
    "Walnut Creek",
    "Orinda",
  ],
  inPersonLocations:
    "at your gym if it allows guests, at your home, or in your apartment building's gym",
  bio: null,
  philosophy:
    "Training built around sustainable habits and realistic progress — not quick fixes or extreme promises.",
  technicalBackground:
    "A background in software and technology shapes a structured, detail-oriented approach to programming and tracking progress.",
  social: {
    instagram: "https://www.instagram.com/nattyfitnessgk/",
    tiktok: "https://www.tiktok.com/@hanetayyy",
    youtube: "https://www.youtube.com/@NattyFitnessGeek",
  },
  contact: {
    /**
     * Public contact address (forwarded by Cloudflare Email Routing). The
     * private business inbox used by the consultation flow stays
     * environment-configured and is never published.
     */
    email: "hello@nattyfitnesstrainer.com",
    /** Provided by Nathnael for client billing and support contact. */
    phone: "(707) 861-0580",
  },
};

/** The confirmed cities as one phrase: "Oakland, Emeryville, …, and Orinda". */
export const serviceAreaList: string = new Intl.ListFormat("en-US", {
  style: "long",
  type: "conjunction",
}).format(trainer.serviceAreas);
