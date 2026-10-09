// Server-only: reads RESEND_API_KEY. Never import this file from a
// "use client" component — only from the API route handler.
import {
  consultationConfirmationEmailContent as confirmationCopy,
  consultationFollowUpLinks,
  getCoachingInterestLabel,
  getPrimaryGoalLabel,
} from "@/content/consultation";
import { trainer } from "@/content/trainer";
import { buildBookingLink, buildQuestionnaireLink } from "./links";
import type { ConsultationEmailFields } from "./types";

const RESEND_API_URL = "https://api.resend.com/emails";
const SEND_TIMEOUT_MS = 10_000;

export interface SendConsultationEmailParams {
  readonly requestId: string;
  /** ISO 8601 UTC timestamp. */
  readonly submittedAt: string;
  readonly input: ConsultationEmailFields;
}

export type SendConsultationEmailResult =
  | { readonly delivered: true }
  | {
      readonly delivered: false;
      readonly reason: "not-configured" | "provider-error";
    };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Strips CR/LF so a visitor-controlled value can't inject extra headers or subject lines. */
function sanitizeHeaderValue(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function buildTextBody(
  params: SendConsultationEmailParams,
  coachingInterestLabel: string,
  primaryGoalLabel: string,
): string {
  const { requestId, submittedAt, input } = params;

  const lines: (string | null)[] = [
    `Request ID: ${requestId}`,
    `Submitted (UTC): ${submittedAt}`,
    `Full name: ${input.fullName}`,
    `Email: ${input.email}`,
    input.phone ? `Phone: ${input.phone}` : null,
    input.cityOrArea ? `City/area: ${input.cityOrArea}` : null,
    `Coaching interest: ${coachingInterestLabel}`,
    `Primary goal: ${primaryGoalLabel}`,
    "",
    "Goals:",
    input.goals,
  ];

  return lines.filter((line): line is string => line !== null).join("\n");
}

function buildHtmlBody(
  params: SendConsultationEmailParams,
  coachingInterestLabel: string,
  primaryGoalLabel: string,
): string {
  const { requestId, submittedAt, input } = params;

  const rows: (string | null)[] = [
    `<p><strong>Request ID:</strong> ${escapeHtml(requestId)}</p>`,
    `<p><strong>Submitted (UTC):</strong> ${escapeHtml(submittedAt)}</p>`,
    `<p><strong>Full name:</strong> ${escapeHtml(input.fullName)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(input.email)}</p>`,
    input.phone
      ? `<p><strong>Phone:</strong> ${escapeHtml(input.phone)}</p>`
      : null,
    input.cityOrArea
      ? `<p><strong>City/area:</strong> ${escapeHtml(input.cityOrArea)}</p>`
      : null,
    `<p><strong>Coaching interest:</strong> ${escapeHtml(coachingInterestLabel)}</p>`,
    `<p><strong>Primary goal:</strong> ${escapeHtml(primaryGoalLabel)}</p>`,
    `<p><strong>Goals:</strong><br />${escapeHtml(input.goals).replace(/\n/g, "<br />")}</p>`,
  ];

  return rows.filter((row): row is string => row !== null).join("\n");
}

/**
 * Sends the consultation inquiry to Nathnael via the Resend HTTP API
 * (direct fetch, no SDK). Never includes the Turnstile token, the
 * visitor's IP, or any secret in the message content.
 */
export async function sendConsultationEmail(
  params: SendConsultationEmailParams,
): Promise<SendConsultationEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONSULTATION_TO_EMAIL;
  const fromEmail = process.env.CONSULTATION_FROM_EMAIL;

  if (!apiKey || !toEmail || !fromEmail) {
    return { delivered: false, reason: "not-configured" };
  }

  const coachingInterestLabel = getCoachingInterestLabel(
    params.input.coachingInterest,
  );
  const primaryGoalLabel = getPrimaryGoalLabel(params.input.primaryGoal);

  const subject = sanitizeHeaderValue(
    `New consultation request — ${coachingInterestLabel}`,
  );
  const text = buildTextBody(params, coachingInterestLabel, primaryGoalLabel);
  const html = buildHtmlBody(params, coachingInterestLabel, primaryGoalLabel);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `consultation-${params.requestId}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: params.input.email,
        subject,
        text,
        html,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return { delivered: false, reason: "provider-error" };
    }

    return { delivered: true };
  } catch {
    return { delivered: false, reason: "provider-error" };
  } finally {
    clearTimeout(timeoutId);
  }
}

export interface SendConsultationConfirmationParams {
  readonly requestId: string;
  readonly fullName: string;
  readonly email: string;
}

/** Letters (including common accented ones), apostrophes and hyphens only. */
const FIRST_NAME_PATTERN =
  /^[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u024F][A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u024F'\u2019-]{0,29}$/;

/**
 * The only visitor-typed text the confirmation repeats: a first name that
 * passes a strict letters-only check. Anything else gets "there", so the
 * form can't be used to put someone's own message in an email to a
 * stranger.
 */
function getGreetingName(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0] ?? "";
  return FIRST_NAME_PATTERN.test(first)
    ? first
    : confirmationCopy.greetingFallbackName;
}

interface ConfirmationSection {
  readonly text: string;
  readonly linkLabel: string;
  readonly href: string;
}

function buildConfirmationSections(
  params: SendConsultationConfirmationParams,
): ConfirmationSection[] {
  const { bookingUrl, questionnaire } = consultationFollowUpLinks;
  const sections: ConfirmationSection[] = [];

  if (bookingUrl !== null) {
    sections.push({
      text: confirmationCopy.booking.text,
      linkLabel: confirmationCopy.booking.linkLabel,
      href: buildBookingLink(bookingUrl, {
        fullName: params.fullName,
        email: params.email,
      }),
    });
  }

  if (questionnaire !== null) {
    sections.push({
      text: confirmationCopy.questionnaire.text,
      linkLabel: confirmationCopy.questionnaire.linkLabel,
      href: buildQuestionnaireLink(questionnaire, params.email),
    });
  }

  return sections;
}

function buildConfirmationText(
  greetingName: string,
  sections: readonly ConfirmationSection[],
): string {
  const contactLine = trainer.contact.phone
    ? confirmationCopy.questionsWithPhone(trainer.contact.phone)
    : confirmationCopy.questionsWithoutPhone;

  const lines: string[] = [`Hi ${greetingName},`, ""];

  if (sections.length === 0) {
    lines.push(confirmationCopy.noLinksBody);
  } else {
    lines.push(
      sections.length === 1
        ? confirmationCopy.introOneStep
        : confirmationCopy.introTwoSteps,
    );
    sections.forEach((section, index) => {
      lines.push(
        "",
        `${sections.length > 1 ? `${index + 1}. ` : ""}${section.text}`,
        `${section.linkLabel}: ${section.href}`,
      );
    });
  }

  lines.push("", contactLine, "", confirmationCopy.signOff);
  return lines.join("\n");
}

function buildConfirmationHtml(
  greetingName: string,
  sections: readonly ConfirmationSection[],
): string {
  const contactLine = trainer.contact.phone
    ? confirmationCopy.questionsWithPhone(trainer.contact.phone)
    : confirmationCopy.questionsWithoutPhone;

  const parts: string[] = [`<p>Hi ${escapeHtml(greetingName)},</p>`];

  if (sections.length === 0) {
    parts.push(`<p>${escapeHtml(confirmationCopy.noLinksBody)}</p>`);
  } else {
    const intro =
      sections.length === 1
        ? confirmationCopy.introOneStep
        : confirmationCopy.introTwoSteps;
    parts.push(`<p>${escapeHtml(intro)}</p>`);
    for (const section of sections) {
      parts.push(
        `<p>${escapeHtml(section.text)}<br /><a href="${escapeHtml(section.href)}">${escapeHtml(section.linkLabel)}</a></p>`,
      );
    }
  }

  parts.push(
    `<p>${escapeHtml(contactLine)}</p>`,
    `<p>${escapeHtml(confirmationCopy.signOff)}</p>`,
  );
  return parts.join("\n");
}

/**
 * The visitor's confirmation, from CONSULTATION_FROM_EMAIL (hello@). Sent
 * only after Nathnael's copy was delivered, and best effort: a failure here
 * never changes what the visitor is told, and nothing is logged. Replies
 * go to the From address, which forwards to Nathnael.
 */
export async function sendConsultationConfirmationEmail(
  params: SendConsultationConfirmationParams,
): Promise<SendConsultationEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.CONSULTATION_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    return { delivered: false, reason: "not-configured" };
  }

  const greetingName = getGreetingName(params.fullName);
  const sections = buildConfirmationSections(params);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `consultation-confirmation-${params.requestId}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [params.email],
        subject: confirmationCopy.subject,
        text: buildConfirmationText(greetingName, sections),
        html: buildConfirmationHtml(greetingName, sections),
      }),
      signal: controller.signal,
    });

    return response.ok
      ? { delivered: true }
      : { delivered: false, reason: "provider-error" };
  } catch {
    return { delivered: false, reason: "provider-error" };
  } finally {
    clearTimeout(timeoutId);
  }
}
