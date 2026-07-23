/**
 * Centralized copy and option lists for the free consultation lead flow
 * (/consultation, the consultation form, and its API route). No pricing,
 * package, or support-tier options are defined here — those don't exist
 * yet and must not be invented.
 */

export interface ConsultationOption<T extends string> {
  readonly value: T;
  readonly label: string;
}

export const coachingInterestOptions = [
  { value: "online", label: "Online Coaching" },
  { value: "hybrid", label: "Hybrid Coaching" },
  { value: "in-person", label: "In-Person Training" },
  { value: "not-sure", label: "Not sure yet" },
] as const satisfies readonly ConsultationOption<string>[];

export type CoachingInterestValue =
  (typeof coachingInterestOptions)[number]["value"];

export const primaryGoalOptions = [
  { value: "strength-and-muscle", label: "Strength and muscle" },
  { value: "fat-loss", label: "Fat loss" },
  { value: "strength-and-fat-loss", label: "Strength and fat loss" },
  { value: "general-fitness", label: "General fitness" },
  { value: "not-sure", label: "Not sure yet" },
  { value: "other", label: "Other" },
] as const satisfies readonly ConsultationOption<string>[];

export type PrimaryGoalValue = (typeof primaryGoalOptions)[number]["value"];

export function getCoachingInterestLabel(value: CoachingInterestValue): string {
  return (
    coachingInterestOptions.find((option) => option.value === value)?.label ??
    value
  );
}

export function getPrimaryGoalLabel(value: PrimaryGoalValue): string {
  return (
    primaryGoalOptions.find((option) => option.value === value)?.label ?? value
  );
}

export const consultationPageContent = {
  eyebrow: "Free Consultation",
  heading: "Book Your Free Consultation",
  intro:
    "Share a bit about your goals and how you'd like to train. The consultation itself is free, with no obligation — this form doesn't collect any payment information.",
  afterSubmitNote:
    "Your request goes directly to Nathnael by email. There's no automated booking yet, so expect a personal reply rather than an instant confirmation.",
  safetyNote:
    "Please don't include medical records, diagnoses, medications, or other highly sensitive health information in this form.",
} as const;

export const consultationFormLabels = {
  fullName: "Full name",
  email: "Email",
  phone: "Phone (optional)",
  cityOrArea: "City or general area (optional)",
  coachingInterest: "Coaching interest",
  primaryGoal: "Primary goal",
  goals: "Briefly describe your goals",
  privacyAcknowledged:
    "I understand this form isn't for medical records or highly sensitive health information, and that submitting it sends my information to Nathnael to respond to my inquiry.",
  submit: "Request Free Consultation",
  submitting: "Sending…",
} as const;

export const consultationSuccessMessage =
  "Thanks — your consultation request has been sent.";

/** Shown whenever the form can't safely accept submissions right now, regardless of the underlying reason. */
export const consultationUnavailableMessage =
  "Online consultation requests aren't available right now. Please check back soon.";

export const consultationGenericErrorMessage =
  "Something went wrong sending your request. Please try again in a moment.";

export const consultationVerificationErrorMessage =
  "We couldn't verify your submission. Please complete the verification and try again.";
