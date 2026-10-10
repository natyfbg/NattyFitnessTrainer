// Shared by the thank-you page (browser) and the confirmation email
// (server). Builds the booking and questionnaire links, optionally
// pre-filled with the visitor's own name and email. Contains no secrets.
import {
  questionnaireFormatAnswers,
  type CoachingInterestValue,
  type ConsultationQuestionnaireLink,
} from "@/content/consultation";

export interface ConsultationContact {
  readonly fullName: string;
  readonly email: string;
  /** Missing on hand-offs saved before this field existed. */
  readonly coachingInterest?: CoachingInterestValue;
}

/** The Cal.com link with the visitor's name and email pre-filled, when known. */
export function buildBookingLink(
  bookingUrl: string,
  contact: ConsultationContact | null,
): string {
  const url = new URL(bookingUrl);
  if (contact) {
    url.searchParams.set("name", contact.fullName);
    url.searchParams.set("email", contact.email);
  }
  return url.toString();
}

/**
 * The path Cal.com's embed expects ("username/event-slug"), taken from the
 * public booking link.
 */
export function getCalLink(bookingUrl: string): string {
  return new URL(bookingUrl).pathname.replace(/^\/+|\/+$/g, "");
}

/**
 * The Google Form link with the visitor's email, name and coaching format
 * pre-filled, as far as they're known.
 */
export function buildQuestionnaireLink(
  questionnaire: ConsultationQuestionnaireLink,
  contact: ConsultationContact | null,
): string {
  const url = new URL(questionnaire.formUrl);
  if (!contact) {
    return url.toString();
  }

  const { entryIds } = questionnaire;
  url.searchParams.set("usp", "pp_url");
  url.searchParams.set(entryIds.email, contact.email);
  url.searchParams.set(entryIds.name, contact.fullName);
  if (contact.coachingInterest) {
    url.searchParams.set(
      entryIds.format,
      questionnaireFormatAnswers[contact.coachingInterest],
    );
  }
  return url.toString();
}
