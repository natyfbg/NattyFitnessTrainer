import {
  consultationGenericErrorMessage,
  consultationUnavailableMessage,
  consultationVerificationErrorMessage,
} from "@/content/consultation";
import { validateConsultationInput } from "@/lib/consultation/validation";
import { verifyTurnstileToken } from "@/lib/consultation/turnstile";
import { sendConsultationEmail } from "@/lib/consultation/email";
import {
  isConsultationDevBypassActive,
  isConsultationFormEnabled,
} from "@/lib/consultation/config";
import type {
  ConsultationApiResponse,
  ConsultationRawInput,
} from "@/lib/consultation/types";

// This route never logs submitted form contents (name, email, phone,
// city/area, goals) or visitor IP addresses — only opaque request IDs and
// coarse, non-identifying error tags, when logging at all.

const MAX_BODY_BYTES = 20_000;

function jsonResponse(body: ConsultationApiResponse, status: number): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

/**
 * Reads the request body up to `limitBytes`, aborting the read as soon as
 * that many bytes have arrived — unlike `request.text()`, this never
 * buffers more than the limit in memory, so a request with no (or an
 * inaccurate) Content-Length can't force a full oversized read before
 * being rejected. Returns `null` if the body exceeds the limit.
 */
async function readBodyWithLimit(
  request: Request,
  limitBytes: number,
): Promise<string | null> {
  const body = request.body;
  if (!body) {
    return "";
  }

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let text = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    received += value.byteLength;
    if (received > limitBytes) {
      await reader.cancel();
      return null;
    }
    text += decoder.decode(value, { stream: true });
  }

  text += decoder.decode();
  return text;
}

function isConsultationRawInput(value: unknown): value is ConsultationRawInput {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.fullName === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.phone === "string" &&
    typeof candidate.cityOrArea === "string" &&
    typeof candidate.coachingInterest === "string" &&
    typeof candidate.primaryGoal === "string" &&
    typeof candidate.goals === "string" &&
    typeof candidate.privacyAcknowledged === "boolean" &&
    typeof candidate.honeypot === "string" &&
    typeof candidate.turnstileToken === "string"
  );
}

export async function GET(): Promise<Response> {
  return jsonResponse(
    { ok: false, requestId: null, message: "Method not allowed." },
    405,
  );
}

export async function POST(request: Request): Promise<Response> {
  const requestId = crypto.randomUUID();

  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return jsonResponse(
        { ok: false, requestId, message: "Unsupported content type." },
        415,
      );
    }

    const requestUrl = new URL(request.url);
    const originHeader = request.headers.get("origin");
    if (!originHeader) {
      return jsonResponse(
        { ok: false, requestId, message: "Request could not be verified." },
        403,
      );
    }
    try {
      const originUrl = new URL(originHeader);
      // Compare the full origin (scheme + host + port), not just hostname —
      // hostname-only comparison would let a request from a different
      // localhost port (or scheme) through during local development.
      if (originUrl.origin !== requestUrl.origin) {
        return jsonResponse(
          {
            ok: false,
            requestId,
            message: "Request could not be verified.",
          },
          403,
        );
      }
    } catch {
      return jsonResponse(
        { ok: false, requestId, message: "Request could not be verified." },
        403,
      );
    }

    if (!isConsultationFormEnabled()) {
      return jsonResponse(
        { ok: false, requestId, message: consultationUnavailableMessage },
        503,
      );
    }

    const devBypassActive = isConsultationDevBypassActive();

    if (!devBypassActive && !process.env.TURNSTILE_SECRET_KEY) {
      return jsonResponse(
        { ok: false, requestId, message: consultationUnavailableMessage },
        503,
      );
    }

    const contentLengthHeader = request.headers.get("content-length");
    if (contentLengthHeader && Number(contentLengthHeader) > MAX_BODY_BYTES) {
      return jsonResponse(
        { ok: false, requestId, message: "Request is too large." },
        413,
      );
    }

    let rawText: string | null;
    try {
      rawText = await readBodyWithLimit(request, MAX_BODY_BYTES);
    } catch {
      return jsonResponse(
        { ok: false, requestId, message: "Malformed request body." },
        400,
      );
    }

    if (rawText === null) {
      return jsonResponse(
        { ok: false, requestId, message: "Request is too large." },
        413,
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      return jsonResponse(
        { ok: false, requestId, message: "Malformed request body." },
        400,
      );
    }

    if (!isConsultationRawInput(parsed)) {
      return jsonResponse(
        { ok: false, requestId, message: "Malformed request body." },
        400,
      );
    }

    // Honeypot: a generic response, with no hint that it was detected.
    if (parsed.honeypot.trim().length > 0) {
      return jsonResponse(
        { ok: false, requestId, message: "Unable to process this request." },
        400,
      );
    }

    const validation = validateConsultationInput(parsed);
    if (!validation.valid || !validation.normalized) {
      return jsonResponse(
        {
          ok: false,
          requestId,
          message: "Please correct the highlighted fields.",
          fieldErrors: validation.errors,
        },
        400,
      );
    }

    if (!devBypassActive) {
      const remoteIp = request.headers.get("cf-connecting-ip");
      const turnstileResult = await verifyTurnstileToken({
        token: validation.normalized.turnstileToken,
        remoteIp,
        idempotencyKey: requestId,
        expectedHostname: requestUrl.hostname,
      });

      if (!turnstileResult.success) {
        return jsonResponse(
          {
            ok: false,
            requestId,
            message: consultationVerificationErrorMessage,
          },
          403,
        );
      }
    }

    const hasEmailConfig = Boolean(
      process.env.RESEND_API_KEY &&
      process.env.CONSULTATION_TO_EMAIL &&
      process.env.CONSULTATION_FROM_EMAIL,
    );

    if (devBypassActive && !hasEmailConfig) {
      // Local-only: simulate delivery so the success flow (redirect to the
      // thank-you page) can be tested without real Resend credentials.
      return jsonResponse({ ok: true, requestId }, 201);
    }

    const emailResult = await sendConsultationEmail({
      requestId,
      submittedAt: new Date().toISOString(),
      // Explicit field list — never forwards the Turnstile token to email.
      input: {
        fullName: validation.normalized.fullName,
        email: validation.normalized.email,
        phone: validation.normalized.phone,
        cityOrArea: validation.normalized.cityOrArea,
        coachingInterest: validation.normalized.coachingInterest,
        primaryGoal: validation.normalized.primaryGoal,
        goals: validation.normalized.goals,
      },
    });

    if (!emailResult.delivered) {
      const status = emailResult.reason === "not-configured" ? 503 : 502;
      return jsonResponse(
        {
          ok: false,
          requestId,
          message:
            status === 503
              ? consultationUnavailableMessage
              : consultationGenericErrorMessage,
        },
        status,
      );
    }

    return jsonResponse({ ok: true, requestId }, 201);
  } catch {
    // Unexpected failure — no request data or error detail is logged.
    return jsonResponse(
      { ok: false, requestId, message: consultationGenericErrorMessage },
      503,
    );
  }
}
