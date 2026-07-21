/**
 * Training styles describe *how* coaching is delivered. Support/membership
 * tiers (pricing, session counts, etc.) are a separate concern that has not
 * been designed yet and must not be invented here.
 */
export type TrainingStyleId = "online" | "hybrid" | "in-person";

export interface TrainingStyle {
  readonly id: TrainingStyleId;
  readonly label: string;
  readonly description: string;
}

export const trainingStyles: readonly TrainingStyle[] = [
  {
    id: "online",
    label: "Online Coaching",
    description:
      "Remote programming and coaching, with regular check-ins, for clients anywhere.",
  },
  {
    id: "hybrid",
    label: "Hybrid Coaching",
    description:
      "A mix of in-person sessions with online programming and check-ins.",
  },
  {
    id: "in-person",
    label: "In-Person Training",
    description: "Face-to-face personal training in the Bay Area.",
  },
] as const;

export interface CoachingBenefit {
  readonly title: string;
  readonly description: string;
}

export const coachingBenefits: readonly CoachingBenefit[] = [
  {
    title: "Personalized Workout Plans",
    description:
      "Programming built around your goals, experience, and schedule.",
  },
  {
    title: "Monthly Progress Assessments",
    description: "Regular check-ins to track progress and adjust your plan.",
  },
] as const;
