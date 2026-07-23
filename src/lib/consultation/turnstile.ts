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
 * internal reason code for the caller to make a decision with.
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
      return { success: false, reason: `http-${response.status}` };
    }

    const data = (await response.json()) as TurnstileSiteverifyResponse;

    if (!data.success) {
      return { success: false, reason: "not-successful" };
    }

    if (data.action !== TURNSTILE_ACTION) {
      return { success: false, reason: "action-mismatch" };
    }

    if (
      process.env.NODE_ENV === "production" &&
      data.hostname !== params.expectedHostname
    ) {
      return { success: false, reason: "hostname-mismatch" };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      reason: error instanceof Error ? error.name : "unknown-error",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
