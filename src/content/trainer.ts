export interface TrainerSocialLinks {
  /** Full profile URL, or null until provided. */
  readonly instagram: string | null;
  /** Full profile URL, or null until provided. */
  readonly tiktok: string | null;
}

export interface TrainerContact {
  readonly email: string | null;
  readonly phone: string | null;
}

export interface Trainer {
  readonly name: string;
  readonly credentials: readonly string[];
  readonly yearsOfExperience: number;
  /** Intentionally general — no specific city is confirmed. */
  readonly serviceAreaLabel: string;
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
  bio: null,
  philosophy:
    "Training built around sustainable habits and realistic progress — not quick fixes or extreme promises.",
  technicalBackground:
    "A background in software and technology shapes a structured, detail-oriented approach to programming and tracking progress.",
  social: {
    instagram: null,
    tiktok: null,
  },
  contact: {
    email: null,
    phone: null,
  },
};
