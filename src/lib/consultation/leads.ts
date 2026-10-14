// Server-only: reads LEADS_SCRIPT_URL and LEADS_SCRIPT_SECRET. Never import
// this file from a "use client" component — only from the API route.
import {
  questionnaireFormatAnswers,
  type CoachingInterestValue,
} from "@/content/consultation";

const LOG_TIMEOUT_MS = 8000;

export interface LogConsultationLeadParams {
  readonly requestId: string;
  /** ISO 8601 UTC timestamp. */
  readonly submittedAt: string;
  readonly fullName: string;
  readonly email: string;
  readonly coachingInterest: CoachingInterestValue;
}

export type LogConsultationLeadResult =
  | { readonly logged: true }
  | {
      readonly logged: false;
      /** Internal-only code for the failure log, e.g. "not-configured". */
      readonly reason: string;
      readonly status?: number;
    };

/**
 * Adds one row to the Leads tab through Nathnael's Google Apps Script web
 * app (docs/apps-script/consultation-leads.gs). Sends only the name,
 * email, coaching format, date and request ID: never the goals text,
 * phone, area or anything health-related. Best effort: returns a short
 * failure code (never the reply body), and never affects the visitor's
 * response.
 */
export async function logConsultationLead(
  params: LogConsultationLeadParams,
): Promise<LogConsultationLeadResult> {
  const url = process.env.LEADS_SCRIPT_URL;
  const secret = process.env.LEADS_SCRIPT_SECRET;

  if (!url || !secret) {
    return { logged: false, reason: "not-configured" };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), LOG_TIMEOUT_MS);

  try {
    // Apps Script answers a POST with a redirect to its result; fetch
    // follows it.
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret,
        requestId: params.requestId,
        submittedAt: params.submittedAt,
        name: params.fullName,
        email: params.email,
        // The questionnaire's wording (In-person, Online, Hybrid, Not sure),
        // so the reminder script can pre-fill the format question with it.
        coachingInterest: questionnaireFormatAnswers[params.coachingInterest],
      }),
      redirect: "follow",
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        logged: false,
        reason: `http-${response.status}`,
        status: response.status,
      };
    }

    let result: unknown;
    try {
      result = await response.json();
    } catch {
      // Usually a Google sign-in or error page: the web app isn't deployed
      // with access "Anyone", or LEADS_SCRIPT_URL isn't the /exec URL.
      return { logged: false, reason: "reply-not-json" };
    }

    const ok =
      typeof result === "object" &&
      result !== null &&
      (result as Record<string, unknown>).ok === true;
    // The script answers { ok: false } for a wrong secret or bad data.
    return ok ? { logged: true } : { logged: false, reason: "script-refused" };
  } catch (error) {
    return {
      logged: false,
      reason: error instanceof Error ? error.name : "unknown-error",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
