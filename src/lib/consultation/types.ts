import type {
  CoachingInterestValue,
  PrimaryGoalValue,
} from "@/content/consultation";

/** Exactly what the client submits, before trimming/validation. */
export interface ConsultationRawInput {
  readonly fullName: string;
  readonly email: string;
  readonly phone: string;
  readonly cityOrArea: string;
  readonly coachingInterest: string;
  readonly primaryGoal: string;
  readonly goals: string;
  readonly privacyAcknowledged: boolean;
  /** Anti-spam honeypot — must stay empty for a genuine submission. */
  readonly honeypot: string;
  readonly turnstileToken: string;
}

/** Trimmed, validated input — safe to act on (email, etc.). */
export interface ConsultationNormalizedInput {
  readonly fullName: string;
  readonly email: string;
  readonly phone: string | null;
  readonly cityOrArea: string | null;
  readonly coachingInterest: CoachingInterestValue;
  readonly primaryGoal: PrimaryGoalValue;
  readonly goals: string;
  readonly turnstileToken: string;
}

/** The subset of normalized input that's safe to put in an email — never the Turnstile token. */
export type ConsultationEmailFields = Omit<
  ConsultationNormalizedInput,
  "turnstileToken"
>;

export type ConsultationFieldName =
  | "fullName"
  | "email"
  | "phone"
  | "cityOrArea"
  | "coachingInterest"
  | "primaryGoal"
  | "goals"
  | "privacyAcknowledged"
  | "turnstileToken";

export type ConsultationFieldErrors = Partial<
  Record<ConsultationFieldName, string>
>;

export interface ConsultationValidationResult {
  readonly valid: boolean;
  readonly errors: ConsultationFieldErrors;
  readonly normalized: ConsultationNormalizedInput | null;
}

export interface ConsultationApiSuccess {
  readonly ok: true;
  readonly requestId: string;
}

export interface ConsultationApiError {
  readonly ok: false;
  readonly requestId: string | null;
  readonly message: string;
  readonly fieldErrors?: ConsultationFieldErrors;
}

export type ConsultationApiResponse =
  ConsultationApiSuccess | ConsultationApiError;
