export interface ProcessStep {
  readonly title: string;
  readonly description: string;
}

export const howItWorksSteps: readonly ProcessStep[] = [
  {
    title: "Free Consultation",
    description:
      "Start with a free consultation to discuss your goals and find the right coaching style.",
  },
  {
    title: "Personalized Plan",
    description:
      "Get a workout plan personalized to your goals, experience, and schedule.",
  },
  {
    title: "Ongoing Coaching",
    description:
      "Train online, hybrid, or in-person in the Bay Area, with support along the way.",
  },
  {
    title: "Monthly Progress Assessment",
    description:
      "Review progress together each month and adjust the plan as needed.",
  },
] as const;
