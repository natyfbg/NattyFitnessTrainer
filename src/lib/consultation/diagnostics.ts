// Server-only. Writes one JSON line to the Worker's logs when a step of a
// consultation request fails, so the failure can be found by its request ID
// (Cloudflare dashboard → Workers → natty-fitness-trainer → Logs).
//
// Only short, non-personal codes are logged: never a name, email, phone,
// area, goals text, Turnstile token, secret, IP address or response body.
// The fields are picked one by one below, so nothing else can slip in.

export type ConsultationStep =
  | "turnstile"
  | "notification-email"
  | "confirmation-email"
  | "leads-sheet"
  | "unexpected";

export interface ConsultationFailureDetails {
  readonly requestId: string;
  /** A short internal code, e.g. "not-successful", "http-401", "AbortError". */
  readonly reason: string;
  /** HTTP status of the provider's reply, when there was one. */
  readonly status?: number;
  /** Turnstile's error codes, e.g. "invalid-input-secret". */
  readonly errorCodes?: readonly string[];
  /** The hostname and action Turnstile reported, to spot a mismatch. */
  readonly hostname?: string;
  readonly action?: string;
  /** The hostname the request arrived on. */
  readonly expectedHostname?: string;
}

const MAX_FIELD_LENGTH = 100;

function clip(value: string | undefined): string | undefined {
  return value === undefined ? undefined : value.slice(0, MAX_FIELD_LENGTH);
}

export function logConsultationFailure(
  step: ConsultationStep,
  details: ConsultationFailureDetails,
): void {
  console.warn(
    JSON.stringify({
      event: "consultation_failure",
      step,
      requestId: details.requestId,
      reason: clip(details.reason),
      status: details.status,
      errorCodes: details.errorCodes?.slice(0, 5).map((code) => clip(code)),
      hostname: clip(details.hostname),
      action: clip(details.action),
      expectedHostname: clip(details.expectedHostname),
    }),
  );
}
