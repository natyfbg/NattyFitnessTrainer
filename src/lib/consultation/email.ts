// Server-only: reads RESEND_API_KEY. Never import this file from a
// "use client" component — only from the API route handler.
import {
  getCoachingInterestLabel,
  getPrimaryGoalLabel,
} from "@/content/consultation";
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
