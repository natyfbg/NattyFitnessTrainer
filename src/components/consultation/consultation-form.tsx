"use client";

import { useRef, useState } from "react";
import type { FormEvent, RefObject } from "react";
import { useRouter } from "next/navigation";
import {
  coachingInterestOptions,
  primaryGoalOptions,
  consultationFormLabels,
  consultationGenericErrorMessage,
} from "@/content/consultation";
import {
  CONSULTATION_FIELD_LIMITS,
  validateConsultationInput,
} from "@/lib/consultation/validation";
import type {
  ConsultationApiResponse,
  ConsultationFieldErrors,
  ConsultationFieldName,
  ConsultationRawInput,
} from "@/lib/consultation/types";
import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from "./turnstile-widget";

interface ConsultationFormProps {
  /** Null when relying on the local development bypass instead of a real Turnstile site key. */
  readonly turnstileSiteKey: string | null;
  /** True only outside production, when CONSULTATION_DEV_BYPASS lets the form render without Turnstile/Resend credentials. */
  readonly turnstileBypassActive: boolean;
}

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  cityOrArea: string;
  coachingInterest: string;
  primaryGoal: string;
  goals: string;
  privacyAcknowledged: boolean;
}

const initialFormState: FormState = {
  fullName: "",
  email: "",
  phone: "",
  cityOrArea: "",
  coachingInterest: "",
  primaryGoal: "",
  goals: "",
  privacyAcknowledged: false,
};

const FIELD_ORDER: readonly ConsultationFieldName[] = [
  "fullName",
  "email",
  "phone",
  "cityOrArea",
  "coachingInterest",
  "primaryGoal",
  "goals",
  "privacyAcknowledged",
  "turnstileToken",
];

const inputClassName =
  "min-h-11 w-full rounded-card border bg-background-elevated px-4 py-2.5 text-foreground placeholder:text-foreground-muted/70 focus-visible:outline-2 focus-visible:outline-offset-2";

function borderClassName(hasError: boolean): string {
  return hasError ? "border-danger" : "border-border";
}

function ErrorText({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <p id={id} className="mt-1.5 text-sm text-danger">
      {message}
    </p>
  );
}

export function ConsultationForm({
  turnstileSiteKey,
  turnstileBypassActive,
}: ConsultationFormProps) {
  const router = useRouter();

  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [fieldErrors, setFieldErrors] = useState<ConsultationFieldErrors>({});
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  // In the local dev bypass, there's no real widget to produce a token —
  // the form is considered ready to submit without one. This is never
  // true in production, since turnstileBypassActive itself never is.
  const hasUsableToken = turnstileBypassActive || Boolean(turnstileToken);

  const honeypotRef = useRef<HTMLInputElement>(null);
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);

  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const cityOrAreaRef = useRef<HTMLInputElement>(null);
  const coachingInterestRef = useRef<HTMLSelectElement>(null);
  const primaryGoalRef = useRef<HTMLSelectElement>(null);
  const goalsRef = useRef<HTMLTextAreaElement>(null);
  const privacyRef = useRef<HTMLInputElement>(null);

  const fieldRefs: Record<
    ConsultationFieldName,
    RefObject<HTMLElement | null>
  > = {
    fullName: fullNameRef,
    email: emailRef,
    phone: phoneRef,
    cityOrArea: cityOrAreaRef,
    coachingInterest: coachingInterestRef,
    primaryGoal: primaryGoalRef,
    goals: goalsRef,
    privacyAcknowledged: privacyRef,
    turnstileToken: turnstileContainerRef,
  };

  function focusFirstError(errors: ConsultationFieldErrors): void {
    for (const field of FIELD_ORDER) {
      if (!errors[field]) {
        continue;
      }
      if (field === "turnstileToken") {
        turnstileContainerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      } else {
        fieldRefs[field].current?.focus();
      }
      return;
    }
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setFormState((previous) => ({ ...previous, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) {
      return;
    }

    setSubmitError(null);

    const raw: ConsultationRawInput = {
      fullName: formState.fullName,
      email: formState.email,
      phone: formState.phone,
      cityOrArea: formState.cityOrArea,
      coachingInterest: formState.coachingInterest,
      primaryGoal: formState.primaryGoal,
      goals: formState.goals,
      privacyAcknowledged: formState.privacyAcknowledged,
      honeypot: honeypotRef.current?.value ?? "",
      turnstileToken: turnstileBypassActive
        ? "dev-bypass"
        : (turnstileToken ?? ""),
    };

    const validation = validateConsultationInput(raw);

    if (!validation.valid) {
      setFieldErrors(validation.errors);
      setStatusMessage("Please correct the highlighted fields.");
      focusFirstError(validation.errors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    setStatusMessage("Sending your request…");

    try {
      const response = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(raw),
      });

      let data: ConsultationApiResponse | null = null;
      try {
        data = (await response.json()) as ConsultationApiResponse;
      } catch {
        data = null;
      }

      if (response.status === 201 && data?.ok) {
        setStatusMessage("Request sent — redirecting…");
        router.push("/consultation/thank-you");
        return;
      }

      // Any non-success response: the token has likely been consumed or
      // is no longer valid, so always request a fresh one before retrying.
      setTurnstileToken(null);
      turnstileRef.current?.reset();

      if (data && !data.ok && data.fieldErrors) {
        setFieldErrors(data.fieldErrors);
        focusFirstError(data.fieldErrors);
      }

      const message =
        (data && !data.ok && data.message) || consultationGenericErrorMessage;
      setSubmitError(message);
      setStatusMessage(message);
    } catch {
      setTurnstileToken(null);
      turnstileRef.current?.reset();
      setSubmitError(consultationGenericErrorMessage);
      setStatusMessage(consultationGenericErrorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="relative flex flex-col gap-6"
    >
      <div>
        <label
          htmlFor="fullName"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          {consultationFormLabels.fullName}
        </label>
        <input
          ref={fullNameRef}
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          maxLength={CONSULTATION_FIELD_LIMITS.fullName.max}
          value={formState.fullName}
          onChange={(event) => updateField("fullName", event.target.value)}
          aria-invalid={Boolean(fieldErrors.fullName)}
          aria-describedby={fieldErrors.fullName ? "fullName-error" : undefined}
          className={`${inputClassName} ${borderClassName(Boolean(fieldErrors.fullName))}`}
        />
        <ErrorText id="fullName-error" message={fieldErrors.fullName} />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          {consultationFormLabels.email}
        </label>
        <input
          ref={emailRef}
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          maxLength={CONSULTATION_FIELD_LIMITS.email.max}
          value={formState.email}
          onChange={(event) => updateField("email", event.target.value)}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          className={`${inputClassName} ${borderClassName(Boolean(fieldErrors.email))}`}
        />
        <ErrorText id="email-error" message={fieldErrors.email} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="phone"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            {consultationFormLabels.phone}
          </label>
          <input
            ref={phoneRef}
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={CONSULTATION_FIELD_LIMITS.phone.max}
            value={formState.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
            className={`${inputClassName} ${borderClassName(Boolean(fieldErrors.phone))}`}
          />
          <ErrorText id="phone-error" message={fieldErrors.phone} />
        </div>

        <div>
          <label
            htmlFor="cityOrArea"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            {consultationFormLabels.cityOrArea}
          </label>
          <input
            ref={cityOrAreaRef}
            id="cityOrArea"
            name="cityOrArea"
            type="text"
            autoComplete="address-level2"
            maxLength={CONSULTATION_FIELD_LIMITS.cityOrArea.max}
            value={formState.cityOrArea}
            onChange={(event) => updateField("cityOrArea", event.target.value)}
            aria-invalid={Boolean(fieldErrors.cityOrArea)}
            aria-describedby={
              fieldErrors.cityOrArea ? "cityOrArea-error" : undefined
            }
            className={`${inputClassName} ${borderClassName(Boolean(fieldErrors.cityOrArea))}`}
          />
          <ErrorText id="cityOrArea-error" message={fieldErrors.cityOrArea} />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="coachingInterest"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            {consultationFormLabels.coachingInterest}
          </label>
          <select
            ref={coachingInterestRef}
            id="coachingInterest"
            name="coachingInterest"
            required
            value={formState.coachingInterest}
            onChange={(event) =>
              updateField("coachingInterest", event.target.value)
            }
            aria-invalid={Boolean(fieldErrors.coachingInterest)}
            aria-describedby={
              fieldErrors.coachingInterest
                ? "coachingInterest-error"
                : undefined
            }
            className={`${inputClassName} ${borderClassName(Boolean(fieldErrors.coachingInterest))}`}
          >
            <option value="" disabled>
              Select one
            </option>
            {coachingInterestOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ErrorText
            id="coachingInterest-error"
            message={fieldErrors.coachingInterest}
          />
        </div>

        <div>
          <label
            htmlFor="primaryGoal"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            {consultationFormLabels.primaryGoal}
          </label>
          <select
            ref={primaryGoalRef}
            id="primaryGoal"
            name="primaryGoal"
            required
            value={formState.primaryGoal}
            onChange={(event) => updateField("primaryGoal", event.target.value)}
            aria-invalid={Boolean(fieldErrors.primaryGoal)}
            aria-describedby={
              fieldErrors.primaryGoal ? "primaryGoal-error" : undefined
            }
            className={`${inputClassName} ${borderClassName(Boolean(fieldErrors.primaryGoal))}`}
          >
            <option value="" disabled>
              Select one
            </option>
            {primaryGoalOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ErrorText id="primaryGoal-error" message={fieldErrors.primaryGoal} />
        </div>
      </div>

      <div>
        <label
          htmlFor="goals"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          {consultationFormLabels.goals}
        </label>
        <textarea
          ref={goalsRef}
          id="goals"
          name="goals"
          required
          rows={5}
          maxLength={CONSULTATION_FIELD_LIMITS.goals.max}
          value={formState.goals}
          onChange={(event) => updateField("goals", event.target.value)}
          aria-invalid={Boolean(fieldErrors.goals)}
          aria-describedby={fieldErrors.goals ? "goals-error" : undefined}
          className={`${inputClassName} ${borderClassName(Boolean(fieldErrors.goals))}`}
        />
        <ErrorText id="goals-error" message={fieldErrors.goals} />
      </div>

      {/* Honeypot: hidden from sighted and assistive-tech users; a filled value marks the submission as spam. */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label htmlFor="website">Website</label>
        <input
          ref={honeypotRef}
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm text-foreground-muted">
          <input
            ref={privacyRef}
            type="checkbox"
            required
            checked={formState.privacyAcknowledged}
            onChange={(event) =>
              updateField("privacyAcknowledged", event.target.checked)
            }
            aria-invalid={Boolean(fieldErrors.privacyAcknowledged)}
            aria-describedby={
              fieldErrors.privacyAcknowledged
                ? "privacyAcknowledged-error"
                : undefined
            }
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-border bg-background-elevated"
          />
          <span>{consultationFormLabels.privacyAcknowledged}</span>
        </label>
        <ErrorText
          id="privacyAcknowledged-error"
          message={fieldErrors.privacyAcknowledged}
        />
      </div>

      <div ref={turnstileContainerRef}>
        {turnstileBypassActive ? (
          <p className="text-sm text-foreground-muted">
            Local development bypass active — verification is skipped.
          </p>
        ) : turnstileSiteKey ? (
          <TurnstileWidget
            ref={turnstileRef}
            siteKey={turnstileSiteKey}
            onVerify={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken(null)}
            onError={() => setTurnstileToken(null)}
          />
        ) : null}
        <ErrorText
          id="turnstileToken-error"
          message={fieldErrors.turnstileToken}
        />
      </div>

      {submitError ? (
        <p className="text-sm text-danger">{submitError}</p>
      ) : null}

      <button
        type="submit"
        disabled={submitting || !hasUsableToken}
        className="min-h-11 w-full rounded-card bg-gold px-6 py-3 text-base font-medium text-background transition-colors duration-150 hover:bg-gold-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {submitting
          ? consultationFormLabels.submitting
          : consultationFormLabels.submit}
      </button>

      <p role="status" aria-live="polite" className="sr-only">
        {statusMessage}
      </p>
    </form>
  );
}
