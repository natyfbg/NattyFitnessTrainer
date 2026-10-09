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

/**
 * Public links offered after a consultation request: the Cal.com booking
 * page and the Google Form questionnaire. Both are public URLs, not
 * secrets. Leave a value null until it exists; every page section and
 * email line that depends on it stays hidden until then.
 */
export interface ConsultationQuestionnaireLink {
  /** The form's ".../viewform" link. */
  readonly formUrl: string;
  /** The Email question's pre-fill key, e.g. "entry.123456789". */
  readonly emailEntryId: string;
}

export interface ConsultationFollowUpLinks {
  /** Public Cal.com event link, e.g. "https://cal.com/<username>/free-consultation". */
  readonly bookingUrl: string | null;
  readonly questionnaire: ConsultationQuestionnaireLink | null;
}

/**
 * Placeholder until the questionnaire's Google Form exists, so the page and
 * the confirmation email can be tested with both links. It is NOT a working
 * link: replace it with the real form link and its Email question's
 * pre-fill key before the form goes live (docs/consultation-leads.md,
 * "Go-live checklist").
 */
export const QUESTIONNAIRE_PLACEHOLDER: ConsultationQuestionnaireLink = {
  formUrl: "https://docs.google.com/forms/d/e/REPLACE-WITH-FORM-ID/viewform",
  emailEntryId: "entry.0",
};

export const consultationFollowUpLinks: ConsultationFollowUpLinks = {
  bookingUrl: "https://cal.com/nattyfitnesstrainer/free-consultation",
  questionnaire: QUESTIONNAIRE_PLACEHOLDER,
};

/** Length and format of the free consultation call, as Nathnael set them. */
export const consultationCallDescription =
  "The call takes 20 minutes, on Google Meet or by phone.";

export const consultationPageContent = {
  eyebrow: "Free Consultation",
  heading: "Book Your Free Consultation",
  intro:
    "Share a bit about your goals and how you'd like to train. The consultation itself is free, with no obligation — this form doesn't collect any payment information.",
  afterSubmitNote:
    consultationFollowUpLinks.bookingUrl === null
      ? "Your request goes directly to Nathnael by email. There's no automated booking yet, so expect a personal reply rather than an instant confirmation."
      : "Your request goes directly to Nathnael by email. Right after you send it, you can pick a time for your free call, and you'll get a confirmation email with the same link.",
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

/** Copy for /consultation/thank-you. Sections without a link stay hidden. */
export const consultationThankYouContent = {
  eyebrow: "Consultation Request",
  heading: "Thanks — your request is on its way.",
  intro:
    "If you just sent the consultation form, Nathnael has your request and will read it before you talk.",
  noBookingNote:
    "Expect a personal reply by email to set up your free consultation. Submitting the form doesn't confirm a coaching booking.",
  booking: {
    heading: "Pick a time for your free call",
    notReady:
      "Not ready to pick a time? The link is in your confirmation email.",
    fallbackLinkLabel: "Calendar not loading? Open the booking page",
  },
  questionnaire: {
    heading: "Before your call: the questionnaire",
    intro:
      "A short set of questions about your training, goals and readiness to exercise, so the call can focus on you. You can book your call first.",
    cta: "Start the questionnaire",
  },
} as const;

/**
 * The visitor's confirmation email (sent from hello@). It reads right
 * whether or not they've already booked on the thank-you page.
 */
export const consultationConfirmationEmailContent = {
  subject: "Got your request, here's what's next",
  greetingFallbackName: "there",
  noLinksBody:
    "Thanks for reaching out. I've got your consultation request and will reply personally to set up your free call.",
  introOneStep: "Thanks for reaching out. One thing before we talk:",
  introTwoSteps: "Thanks for reaching out. Two things before we talk:",
  booking: {
    text: `Pick a time for your free call. ${consultationCallDescription} If you already booked on the website, you're all set; Cal.com sent your confirmation separately.`,
    linkLabel: "Pick a time",
  },
  questionnaire: {
    text: "Fill out the questionnaire so our call can focus on you. You can book your call first.",
    linkLabel: "Start the questionnaire",
  },
  questionsWithPhone: (phone: string) =>
    `Questions? Reply to this email or text ${phone}.`,
  questionsWithoutPhone: "Questions? Reply to this email.",
  signOff: "Nathnael",
} as const;
