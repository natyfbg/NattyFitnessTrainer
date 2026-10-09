// Shared by the thank-you page (browser) and the confirmation email
// (server). Builds the booking and questionnaire links, optionally
// pre-filled with the visitor's own name and email. Contains no secrets.
import type { ConsultationQuestionnaireLink } from "@/content/consultation";

export interface ConsultationContact {
  readonly fullName: string;
  readonly email: string;
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

/** The Google Form link with the visitor's email pre-filled, when known. */
export function buildQuestionnaireLink(
  questionnaire: ConsultationQuestionnaireLink,
  email: string | null,
): string {
  const url = new URL(questionnaire.formUrl);
  if (email) {
    url.searchParams.set("usp", "pp_url");
    url.searchParams.set(questionnaire.emailEntryId, email);
  }
  return url.toString();
}
