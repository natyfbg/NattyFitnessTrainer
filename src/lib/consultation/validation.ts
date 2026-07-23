import {
  coachingInterestOptions,
  primaryGoalOptions,
  type CoachingInterestValue,
  type PrimaryGoalValue,
} from "@/content/consultation";
import type {
  ConsultationFieldErrors,
  ConsultationRawInput,
  ConsultationValidationResult,
} from "./types";

/**
 * Shared, environment-agnostic field limits — used by the form (for
 * `maxLength` attributes and client-side feedback) and by the API route
 * (as the authoritative check). Values that exceed these are rejected,
 * never silently truncated.
 */
export const CONSULTATION_FIELD_LIMITS = {
  fullName: { min: 2, max: 100 },
  email: { max: 254 },
  phone: { max: 40 },
  cityOrArea: { max: 100 },
  goals: { min: 20, max: 1500 },
  turnstileToken: { max: 2048 },
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALID_COACHING_INTEREST = new Set<string>(
  coachingInterestOptions.map((option) => option.value),
);
const VALID_PRIMARY_GOAL = new Set<string>(
  primaryGoalOptions.map((option) => option.value),
);

function isCoachingInterestValue(
  value: string,
): value is CoachingInterestValue {
  return VALID_COACHING_INTEREST.has(value);
}

function isPrimaryGoalValue(value: string): value is PrimaryGoalValue {
  return VALID_PRIMARY_GOAL.has(value);
}

/**
 * Trims and validates raw consultation form input. Used both client-side
 * (for immediate feedback) and server-side (as the authoritative check) —
 * the server must always call this itself rather than trusting a client
 * claim of validity. Does not inspect the honeypot field; callers that
 * need honeypot handling (the API route) check it separately, before or
 * instead of calling this function, so a filled honeypot never surfaces
 * as a normal field error.
 */
export function validateConsultationInput(
  raw: ConsultationRawInput,
): ConsultationValidationResult {
  const errors: ConsultationFieldErrors = {};

  const fullName = raw.fullName.trim();
  const email = raw.email.trim();
  const phone = raw.phone.trim();
  const cityOrArea = raw.cityOrArea.trim();
  const goals = raw.goals.trim();
  const turnstileToken = raw.turnstileToken.trim();

  if (
    fullName.length < CONSULTATION_FIELD_LIMITS.fullName.min ||
    fullName.length > CONSULTATION_FIELD_LIMITS.fullName.max
  ) {
    errors.fullName = `Enter your full name (${CONSULTATION_FIELD_LIMITS.fullName.min}-${CONSULTATION_FIELD_LIMITS.fullName.max} characters).`;
  }

  if (
    email.length === 0 ||
    email.length > CONSULTATION_FIELD_LIMITS.email.max ||
    !EMAIL_PATTERN.test(email)
  ) {
    errors.email = "Enter a valid email address.";
  }

  if (phone.length > CONSULTATION_FIELD_LIMITS.phone.max) {
    errors.phone = "Phone number is too long.";
  }

  if (cityOrArea.length > CONSULTATION_FIELD_LIMITS.cityOrArea.max) {
    errors.cityOrArea = "City or area is too long.";
  }

  if (!isCoachingInterestValue(raw.coachingInterest)) {
    errors.coachingInterest = "Select a coaching interest.";
  }

  if (!isPrimaryGoalValue(raw.primaryGoal)) {
    errors.primaryGoal = "Select a primary goal.";
  }

  if (
    goals.length < CONSULTATION_FIELD_LIMITS.goals.min ||
    goals.length > CONSULTATION_FIELD_LIMITS.goals.max
  ) {
    errors.goals = `Briefly describe your goals (${CONSULTATION_FIELD_LIMITS.goals.min}-${CONSULTATION_FIELD_LIMITS.goals.max} characters).`;
  }

  if (!raw.privacyAcknowledged) {
    errors.privacyAcknowledged = "Please acknowledge this before submitting.";
  }

  if (
    turnstileToken.length === 0 ||
    turnstileToken.length > CONSULTATION_FIELD_LIMITS.turnstileToken.max
  ) {
    errors.turnstileToken = "Verification failed. Please try again.";
  }

  const valid = Object.keys(errors).length === 0;

  return {
    valid,
    errors,
    normalized:
      valid &&
      isCoachingInterestValue(raw.coachingInterest) &&
      isPrimaryGoalValue(raw.primaryGoal)
        ? {
            fullName,
            email,
            phone: phone.length > 0 ? phone : null,
            cityOrArea: cityOrArea.length > 0 ? cityOrArea : null,
            coachingInterest: raw.coachingInterest,
            primaryGoal: raw.primaryGoal,
            goals,
            turnstileToken,
          }
        : null,
  };
}
