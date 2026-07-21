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
  /** No biography copy has been provided yet; see docs/content-management.md. */
  readonly bio: string | null;
  readonly social: TrainerSocialLinks;
  readonly contact: TrainerContact;
}

export const trainer: Trainer = {
  name: "Nathnael Gebre",
  credentials: ["NFPT Certified Personal Trainer"],
  yearsOfExperience: 7,
  serviceAreaLabel: "Bay Area",
  bio: null,
  social: {
    instagram: null,
    tiktok: null,
  },
  contact: {
    email: null,
    phone: null,
  },
};
