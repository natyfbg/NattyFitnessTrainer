/**
 * Shared consultation feature-flag checks. Used by both the page (to
 * decide what to render) and the API route (as the authoritative gate),
 * so the two can never drift out of sync.
 */

/** The exact string "true" enables the public form — anything else (or missing) does not. */
export function isConsultationFormEnabled(): boolean {
  return process.env.NEXT_PUBLIC_CONSULTATION_FORM_ENABLED === "true";
}

/**
 * True only outside production when the local development bypass is
 * explicitly enabled. Never true in a production build/deployment,
 * regardless of CONSULTATION_DEV_BYPASS's value.
 */
export function isConsultationDevBypassActive(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.CONSULTATION_DEV_BYPASS === "true"
  );
}
