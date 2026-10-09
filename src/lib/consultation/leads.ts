// Server-only: reads LEADS_SCRIPT_URL and LEADS_SCRIPT_SECRET. Never import
// this file from a "use client" component — only from the API route.
import { getCoachingInterestLabel } from "@/content/consultation";
import type { CoachingInterestValue } from "@/content/consultation";

const LOG_TIMEOUT_MS = 8000;

export interface LogConsultationLeadParams {
  readonly requestId: string;
  /** ISO 8601 UTC timestamp. */
  readonly submittedAt: string;
  readonly fullName: string;
  readonly email: string;
  readonly coachingInterest: CoachingInterestValue;
}

/**
 * Adds one row to the Leads tab through Nathnael's Google Apps Script web
 * app (docs/apps-script/consultation-leads.gs). Sends only the name,
 * email, coaching interest, date and request ID: never the goals text,
 * phone, area or anything health-related. Best effort: returns false on
 * any failure, logs nothing, and never affects the visitor's response.
 */
export async function logConsultationLead(
  params: LogConsultationLeadParams,
): Promise<boolean> {
  const url = process.env.LEADS_SCRIPT_URL;
  const secret = process.env.LEADS_SCRIPT_SECRET;

  if (!url || !secret) {
    return false;
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
        coachingInterest: getCoachingInterestLabel(params.coachingInterest),
      }),
      redirect: "follow",
      signal: controller.signal,
    });

    if (!response.ok) {
      return false;
    }
    const result: unknown = await response.json();
    return (
      typeof result === "object" &&
      result !== null &&
      (result as Record<string, unknown>).ok === true
    );
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}
