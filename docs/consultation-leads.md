# Consultation Lead Flow

This documents the free consultation lead flow added in Sprint 1C: a `/consultation` page with a form that emails Nathnael directly. There is no database and no CRM in this sprint — see [Future roadmap](#future-roadmap) for what comes later.

## Architecture

```
Visitor → /consultation (form) → POST /api/consultation → Turnstile verify → Resend email → Nathnael's inbox
                                                                             ↓
                                                                 /consultation/thank-you
```

- **`/consultation`** (`src/app/consultation/page.tsx`) — a Server Component page. It renders the form only when the form is publicly enabled _and_ a Turnstile site key is configured; otherwise it shows an honest "temporarily unavailable" message. No pricing, no fake trainer photo.
- **`ConsultationForm`** (`src/components/consultation/consultation-form.tsx`) — the interactive Client Component. Validates client-side for UX, but the server is authoritative.
- **`TurnstileWidget`** (`src/components/consultation/turnstile-widget.tsx`) — loads Cloudflare Turnstile explicitly (not auto-rendered) so it can be reset after a failed submission.
- **`POST /api/consultation`** (`src/app/api/consultation/route.ts`) — the only way a submission actually gets validated and sent. Re-validates everything itself; never trusts the client.
- **`src/lib/consultation/`** — server-only helpers (`turnstile.ts`, `email.ts`) plus shared types/validation (`types.ts`, `validation.ts`) that are safe to import from the client form too (no secrets in them).
- **`/consultation/thank-you`** — a `noindex` confirmation page. It does not prove an email was delivered if visited directly.
- **`/privacy`** — plain-language notice covering what the form collects and why.

There is no database. Nothing submitted through the form is stored anywhere by this application — it's either emailed successfully or the request fails.

## Form fields

| Field                  | Required | Limits                                                                                             |
| ---------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| Full name              | Yes      | 2–100 characters                                                                                   |
| Email                  | Yes      | ≤254 characters, basic format check                                                                |
| Phone                  | No       | ≤40 characters                                                                                     |
| City or general area   | No       | ≤100 characters                                                                                    |
| Coaching interest      | Yes      | One of: Online, Hybrid, In-Person, Not sure yet                                                    |
| Primary goal           | Yes      | One of: Strength and muscle, Fat loss, Strength and fat loss, General fitness, Not sure yet, Other |
| Goals/message          | Yes      | 20–1,500 characters                                                                                |
| Privacy acknowledgment | Yes      | Must be checked                                                                                    |
| Turnstile token        | Yes      | ≤2,048 characters, verified server-side                                                            |
| Honeypot ("Website")   | —        | Must stay empty; hidden from real users                                                            |

The form intentionally does **not** ask for date of birth, home address, medical diagnoses, medications, medical records, payment information, a Social Security number, or detailed injury history. A more detailed fitness assessment is a separate, later flow.

## Validation

`src/lib/consultation/validation.ts` exports `validateConsultationInput()` and `CONSULTATION_FIELD_LIMITS` — the single source of truth for field limits, used by both the form (for `maxLength` attributes and immediate feedback) and the API route (as the authoritative check). Values that exceed a limit are **rejected**, never silently truncated. The server always re-runs this validation itself; it never trusts a client-side "this is valid" claim.

## Spam protection

- **Honeypot**: a "Website" field, hidden off-screen and out of the tab order (`aria-hidden`, `tabIndex={-1}`), that real users never see or fill. A non-empty value gets a generic rejection with no hint that it was detected.
- **Cloudflare Turnstile**: required on every submission except the local dev bypass (below). The server calls Turnstile's `siteverify` endpoint directly (no SDK) and checks `success`, the `action` (`consultation_submit`), and — in production — the response `hostname`.
- **Same-origin check**: the API route compares the request's `Origin` header against its own hostname and rejects (403) anything that doesn't match.
- **Size limits**: oversized request bodies are rejected (413) before parsing.

## Privacy behavior

- The API route never logs submitted form contents (name, email, phone, city/area, goals) or visitor IP addresses — only an opaque `requestId` (from `crypto.randomUUID()`) and, on unexpected failure, a generic error tag with no request data.
- The Turnstile token and the visitor's IP are never included in the email sent to Nathnael.
- No confirmation email is sent to the visitor in this sprint.
- See [`/privacy`](../src/app/privacy/page.tsx) for the visitor-facing notice.

## Local development bypass

Set `CONSULTATION_DEV_BYPASS=true` in your local `.dev.vars` to skip real Turnstile verification while developing:

- Only takes effect when `NODE_ENV !== "production"` — checked in the API route itself, so it can never activate in a production build/deployment regardless of this variable's value.
- Skips calling the real Turnstile `siteverify` API (no Turnstile credentials needed locally).
- If Resend isn't configured either, the route simulates a successful delivery (no real email is sent) so you can exercise the full success flow — including the redirect to `/consultation/thank-you` — without any external credentials.
- Never logs submitted PII, bypass or not.

## Cloudflare Turnstile setup

1. In the Cloudflare dashboard, create a Turnstile widget for your domain (and for `*.workers.dev` if you want it working on preview URLs).
2. Copy the **Site Key** into `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and the **Secret Key** into `TURNSTILE_SECRET_KEY`.
3. For local testing without real verification, use [Cloudflare's documented Turnstile test keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/) instead of the dev bypass, if you specifically want to exercise the real verification code path with a token that always passes (or always fails, using the "always blocks" test key) — the dev bypass skips this code path entirely, so use test keys instead when you need to test Turnstile's actual pass/fail behavior locally.

## Resend setup

1. Create a Resend account and verify the sending domain you intend to use for `CONSULTATION_FROM_EMAIL` (Resend requires domain verification before it will send from that domain in production — an unverified domain will fail to send).
2. Create an API key and set it as `RESEND_API_KEY`.
3. Set `CONSULTATION_TO_EMAIL` to the inbox that should receive consultation requests, and `CONSULTATION_FROM_EMAIL` to a verified sending address on your verified domain.
4. Until the domain is verified, leave the form disabled (`NEXT_PUBLIC_CONSULTATION_FORM_ENABLED=false`) or expect `sendConsultationEmail` to report `provider-error`, which the API surfaces as a generic 502 to the visitor.

## Public vs. server-only configuration

| Variable                                | Scope                  | Notes                                                                                                                                 |
| --------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_CONSULTATION_FORM_ENABLED` | Public, build-time     | Only the exact string `"true"` enables the form. This is a real kill switch — the API route checks it too, independently of the page. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`        | Public, build-time     | The Turnstile site key. Safe to expose — it identifies the widget, not a secret.                                                      |
| `TURNSTILE_SECRET_KEY`                  | **Server-only secret** | Never sent to the browser. Used only in `src/lib/consultation/turnstile.ts`.                                                          |
| `RESEND_API_KEY`                        | **Server-only secret** | Never sent to the browser. Used only in `src/lib/consultation/email.ts`.                                                              |
| `CONSULTATION_TO_EMAIL`                 | Server-only            | Not a secret, but not exposed to the client either.                                                                                   |
| `CONSULTATION_FROM_EMAIL`               | Server-only            | Must be on a Resend-verified sending domain.                                                                                          |
| `CONSULTATION_DEV_BYPASS`               | Server-only, local dev | Ignored entirely in production builds.                                                                                                |

## Configuring Cloudflare preview and production environments

Set these as Cloudflare Worker variables/secrets (Workers Builds / dashboard "Variables and Secrets" — see [`docs/deployment.md`](deployment.md) for the general environment-management model). Treat `TURNSTILE_SECRET_KEY` and `RESEND_API_KEY` as **secrets**, not plain variables, in the Cloudflare dashboard.

Recommended rollout order for a new environment:

1. Deploy with `NEXT_PUBLIC_CONSULTATION_FORM_ENABLED=false` (or unset) — safe by default.
2. Configure Turnstile and Resend variables/secrets for that environment.
3. Flip `NEXT_PUBLIC_CONSULTATION_FORM_ENABLED=true` only once both are confirmed working (see testing steps below), and only for the environment you intend to accept real leads on.

Preview environments should generally stay disabled unless you're specifically testing the lead flow, since preview URLs are public (see `docs/deployment.md`).

## How to test locally

1. Copy `.dev.vars.example` to `.dev.vars` (already git-ignored).
2. For UI/success-flow testing without any external credentials: set `NEXT_PUBLIC_CONSULTATION_FORM_ENABLED=true` and `CONSULTATION_DEV_BYPASS=true`, leave the Turnstile/Resend variables blank. `npm run dev`, submit the form, and confirm you land on `/consultation/thank-you`.
3. To test with real Turnstile verification, use Cloudflare's test site/secret key pair instead of the bypass (see above), and set `CONSULTATION_DEV_BYPASS=false`.
4. To test real email delivery, configure real `RESEND_API_KEY`/`CONSULTATION_TO_EMAIL`/`CONSULTATION_FROM_EMAIL` values (with a verified Resend domain) and submit a real test inquiry — check that it arrives with the expected subject (`New consultation request — {coaching interest}`) and fields, and that it does **not** contain the Turnstile token or any IP address.

## How to disable the form quickly

Set `NEXT_PUBLIC_CONSULTATION_FORM_ENABLED` to anything other than `"true"` (or remove it) and redeploy. `/consultation` will show the "temporarily unavailable" message, and `/api/consultation` will independently refuse to process submissions (503) even if someone bypasses the UI and posts to the endpoint directly.

## No database / storage behavior

This sprint stores nothing. A submission either results in an email being sent, or the request fails and nothing is retained anywhere in this application. There is no lead list, no submission history, and no way to look up a past inquiry from within the app.

## Manual lead workflow

There's no CRM or database in this sprint, but leads still need to be triaged and tracked once they land in the business inbox. See [`docs/lead-management.md`](lead-management.md) for the manual Gmail-labels-and-spreadsheet workflow, recommended labels/columns, and privacy guidance for handling delivered leads.

## Future roadmap

- **Lead storage**: a database or storage layer to keep a record of inquiries (currently, if the email isn't delivered, the inquiry is lost).
- **Scheduling**: real booking/calendar integration, replacing the current "expect a personal reply" framing.
- **Assessments**: the more detailed fitness assessment flow mentioned on the thank-you page.
- **CRM integration**: connecting leads to a CRM instead of a single inbox.

None of these are implemented yet, and this document should be updated when they are.
