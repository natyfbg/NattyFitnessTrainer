// Server-only: reads TURNSTILE_SECRET_KEY. Never import this file from a
// "use client" component — only from the API route handler.
const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TURNSTILE_ACTION = "consultation_submit";
const VERIFY_TIMEOUT_MS = 8000;

export interface TurnstileVerificationParams {
  readonly token: string;
  /** From the CF-Connecting-IP header, if present. Never logged or persisted. */
  readonly remoteIp: string | null;
  readonly idempotencyKey: string;
  readonly expectedHostname: string;
}

export interface TurnstileVerificationResult {
  readonly success: boolean;
  /** Internal-only diagnostic tag — never forward this to the browser. */
  readonly reason?: string;
  /** Internal-only, for the failure log: siteverify's HTTP status. */
  readonly status?: number;
  /** Internal-only, for the failure log: Turnstile's error codes. */
  readonly errorCodes?: readonly string[];
  /** Internal-only, for the failure log: what Turnstile reported. */
  readonly hostname?: string;
  readonly action?: string;
}

interface TurnstileSiteverifyResponse {
  readonly success?: boolean;
  readonly action?: string;
  readonly hostname?: string;
  readonly ["error-codes"]?: readonly string[];
}

/**
 * Calls Cloudflare's Turnstile siteverify endpoint directly. Never logs
 * the token, the secret, or the visitor's IP — only returns a coarse
 * internal reason code (plus Turnstile's own error codes, hostname and
 * action) for the caller to decide with and log.
 */
export async function verifyTurnstileToken(
  params: TurnstileVerificationParams,
): Promise<TurnstileVerificationResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return { success: false, reason: "missing-secret" };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", params.token);
  body.set("idempotency_key", params.idempotencyKey);
  if (params.remoteIp) {
    body.set("remoteip", params.remoteIp);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body,
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        success: false,
        reason: `http-${response.status}`,
        status: response.status,
      };
    }

    const data = (await response.json()) as TurnstileSiteverifyResponse;

    if (!data.success) {
      return {
        success: false,
        reason: "not-successful",
        errorCodes: data["error-codes"],
        hostname: data.hostname,
        action: data.action,
      };
    }

    if (data.action !== TURNSTILE_ACTION) {
      return {
        success: false,
        reason: "action-mismatch",
        hostname: data.hostname,
        action: data.action,
      };
    }

    if (
      process.env.NODE_ENV === "production" &&
      data.hostname !== params.expectedHostname
    ) {
      return {
        success: false,
        reason: "hostname-mismatch",
        hostname: data.hostname,
        action: data.action,
      };
    }

    return { success: true };
  } catch (error) {
    // e.g. "AbortError: …" on the 8-second timeout, or a network error.
    // The message never contains the token or secret (they're in the body).
    return {
      success: false,
      reason:
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : "unknown-error",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
