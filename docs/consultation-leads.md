# Consultation Lead Flow

This documents the free consultation lead flow added in Sprint 1C: a `/consultation` page with a form that emails Nathnael directly. There is no database and no CRM in this sprint — see [Future roadmap](#future-roadmap) for what comes later.

## Architecture

```
Visitor → /consultation (form) → POST /api/consultation → Turnstile verify → Resend email → Nathnael's inbox
                                                                             ↓
                                       after the response: confirmation email to the visitor (Resend, from hello@)
                                                           + one row in the Leads tab (Google Apps Script)
                                                                             ↓
                    /consultation/thank-you → Cal.com booking calendar + questionnaire link (Google Form)
```

The full plan, including the daily reminder script, is in the Claude Doc "Natty Fitness Trainer: Booking Plan".

- **`/consultation`** (`src/app/consultation/page.tsx`) — a Server Component page. It renders the form only when the form is publicly enabled _and_ a Turnstile site key is configured; otherwise it shows an honest "temporarily unavailable" message. No pricing, no fake trainer photo.
- **`ConsultationForm`** (`src/components/consultation/consultation-form.tsx`) — the interactive Client Component. Validates client-side for UX, but the server is authoritative.
- **`TurnstileWidget`** (`src/components/consultation/turnstile-widget.tsx`) — loads Cloudflare Turnstile explicitly (not auto-rendered) so it can be reset after a failed submission.
- **`POST /api/consultation`** (`src/app/api/consultation/route.ts`) — the only way a submission actually gets validated and sent. Re-validates everything itself; never trusts the client.
- **`src/lib/consultation/`** — server-only helpers (`turnstile.ts`, `email.ts`) plus shared types/validation (`types.ts`, `validation.ts`) that are safe to import from the client form too (no secrets in them).
- **`/consultation/thank-you`** — a `noindex` confirmation page. It does not prove an email was delivered if visited directly. When `consultationFollowUpLinks` in `src/content/consultation.ts` has a booking link, it shows the Cal.com calendar (`BookingCalendar`); when it has a questionnaire, it shows the questionnaire button (`QuestionnaireLink`). Both are pre-filled with the name and email just sent, handed over in this tab's `sessionStorage` (`src/lib/consultation/contact-handoff.ts`), never in a URL on this site.
- **Confirmation email** (`sendConsultationConfirmationEmail` in `src/lib/consultation/email.ts`) — sent from `CONSULTATION_FROM_EMAIL` only after Nathnael's copy was delivered, via `after()` so it never delays the response. It repeats nothing the visitor typed except a first name that passes a strict letters-only check, and it includes whichever of the booking and questionnaire links exist. A failure is silent and never changes what the visitor is told.
- **Leads tab** (`src/lib/consultation/leads.ts`) — also after the response, posts the request ID, date, name, email and coaching format in the questionnaire's wording (never goals, phone, area or anything health-related) to the Google Apps Script in [`docs/apps-script/consultation-leads.gs`](apps-script/consultation-leads.gs), which adds one row to the Leads sheet. Skipped when `LEADS_SCRIPT_URL` isn't set; a failure is silent.
- **`/privacy`** — plain-language notice covering what the form collects and why.

There is no database. This application stores nothing itself: a submission is emailed, and a minimal copy (name, email, coaching interest, date) goes to the private Leads sheet in Nathnael's Google account.

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

1. In the Cloudflare dashboard, create a Turnstile widget for your domain. The production widget lists only `nattyfitnesstrainer.com` and `www.nattyfitnesstrainer.com`; `workers.dev` is deliberately left out, so preview URLs can never send a real request. Use the test keys (step 3) locally and on previews.
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
| `LEADS_SCRIPT_URL`                      | **Server-only secret** | The Apps Script web app address. Optional: without it, no Leads row is written.                                                       |
| `LEADS_SCRIPT_SECRET`                   | **Server-only secret** | Shared secret checked by the script (its `LEADS_SECRET` script property). Never sent to the browser.                                  |

## Configuring Cloudflare preview and production environments

Set the server-only values as Cloudflare Worker **secrets** (dashboard → Workers & Pages → natty-fitness-trainer → Settings → Variables and Secrets, type "Secret") — all of them, including `CONSULTATION_TO_EMAIL` and `CONSULTATION_FROM_EMAIL`. Plain-text variables added in the dashboard are removed by the next `wrangler deploy` because `wrangler.jsonc` doesn't list them (no `keep_vars`); secrets survive deploys. The two `NEXT_PUBLIC_*` values are read when the site is built, so they go under Settings → Build → Variables instead. See [`docs/deployment.md`](deployment.md) for the general environment-management model.

Recommended rollout order for a new environment:

1. Deploy with `NEXT_PUBLIC_CONSULTATION_FORM_ENABLED=false` (or unset) — safe by default.
2. Configure Turnstile and Resend variables/secrets for that environment.
3. Flip `NEXT_PUBLIC_CONSULTATION_FORM_ENABLED=true` only once both are confirmed working (see testing steps below), and only for the environment you intend to accept real leads on.

Preview environments should generally stay disabled unless you're specifically testing the lead flow, since preview URLs are public (see `docs/deployment.md`). In this project the secrets exist on Production only, so even if a preview build shows the form, its API answers "temporarily unavailable".

## Production setup (configured 2026-10-08)

Recorded here so nobody has to rediscover it. No secret values belong in this file.

- **Resend** (sending only): `nattyfitnesstrainer.com` is verified. Cloudflare DNS records, all DNS only (not proxied): TXT `resend._domainkey` (DKIM), CNAME `send`, CNAME `rsend`, TXT `_dmarc` = `v=DMARC1; p=none;`. The root SPF record is still Cloudflare Email Routing's, and there is no second SPF record on the root. Receiving is off in Resend; inbound mail to hello@ goes through Cloudflare Email Routing to Nathnael's Gmail. The API key has sending access only, restricted to the domain.
- **Turnstile**: one widget in Managed mode, hostnames `nattyfitnesstrainer.com` and `www.nattyfitnesstrainer.com` only.
- **Worker secrets** (Production only; nothing on Previews), all type Secret: `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `CONSULTATION_TO_EMAIL`, `CONSULTATION_FROM_EMAIL` (`Natty Fitness Trainer <hello@nattyfitnesstrainer.com>`). There are no plain-text runtime variables (`"vars": {}`). Never add these to `wrangler.jsonc` `vars`: a deploy would wipe the dashboard values, and it would put the private inbox address in the repo. The code reads them from the environment at runtime.
- **Build variables**: `NODE_VERSION=24`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`. `NEXT_PUBLIC_CONSULTATION_FORM_ENABLED` is deliberately not set until the end-to-end test passes.
- **Cal.com** (free plan): user `nattyfitnesstrainer`, Google Calendar connected (bookings go to the same Gmail calendar hello@ forwards to, which the reminder script checks), Google Meet installed. Event "Free Consultation" at `https://cal.com/nattyfitnesstrainer/free-consultation`: 20 minutes, America/Los_Angeles, Google Meet or attendee phone number (Nathnael calls), 10-minute buffer after, 12-hour minimum notice, 30-minute slot intervals, at most 3 a day, bookable 21 days ahead, one upcoming booking per person (offers to reschedule the existing one).

## Content-Security-Policy

The site doesn't send a Content-Security-Policy today: there are no security headers in the code, and `public/_headers` only sets caching for `/_next/static/*`. If one is added later (in code or as a Cloudflare Transform Rule), it must allow:

- the Cal.com embed: `script-src https://app.cal.com`, `frame-src https://app.cal.com https://cal.com`, `connect-src https://app.cal.com`
- Turnstile: `script-src https://challenges.cloudflare.com`, `frame-src https://challenges.cloudflare.com`

## How to test locally

1. Copy `.dev.vars.example` to `.dev.vars` (already git-ignored).
2. For UI/success-flow testing without any external credentials: set `NEXT_PUBLIC_CONSULTATION_FORM_ENABLED=true` and `CONSULTATION_DEV_BYPASS=true`, leave the Turnstile/Resend variables blank. `npm run dev`, submit the form, and confirm you land on `/consultation/thank-you`.
3. To test with real Turnstile verification, use Cloudflare's test site/secret key pair instead of the bypass (see above), and set `CONSULTATION_DEV_BYPASS=false`.
4. To test real email delivery, configure real `RESEND_API_KEY`/`CONSULTATION_TO_EMAIL`/`CONSULTATION_FROM_EMAIL` values (with a verified Resend domain) and submit a real test inquiry — check that it arrives with the expected subject (`New consultation request — {coaching interest}`) and fields, and that it does **not** contain the Turnstile token or any IP address.

## How to disable the form quickly

Set `NEXT_PUBLIC_CONSULTATION_FORM_ENABLED` to anything other than `"true"` (or remove it) and redeploy. `/consultation` will show the "temporarily unavailable" message, and `/api/consultation` will independently refuse to process submissions (503) even if someone bypasses the UI and posts to the endpoint directly.

## Booking and questionnaire links

Set these in `consultationFollowUpLinks` (`src/content/consultation.ts`). They're public URLs, not secrets; while a value is `null`, everything that depends on it stays hidden (thank-you page section, confirmation email line, FAQ and consultation-page wording).

Current values: `bookingUrl` is the live Cal.com event. `questionnaire` is `QUESTIONNAIRE_PLACEHOLDER`, which is **not a working link**; it only lets the page and the email be tested with both links until the Google Form exists.

- `bookingUrl`: the Cal.com event's public link, e.g. `https://cal.com/<username>/free-consultation`.
- `questionnaire`: the Google Form's `…/viewform` link plus `entryIds`, the pre-fill keys (`entry.123456789`) of the three questions the site fills in: `email` (1.1 "Email"), `name` (1.2 "Full name") and `format` (5.7, "Which coaching format are you leaning toward?"). `docs/apps-script/build-questionnaire.gs` prints all of them; the form's "Get pre-filled link" option shows them too.
- `questionnaireFormatAnswers` maps the website's coaching-interest values to 5.7's answers: In-person, Online, Hybrid, Not sure. They must match the form's choices exactly, or the format pre-fill silently does nothing. The Leads sheet receives the same wording.

## The questionnaire form

The full question list is in the Claude Doc "Client Questionnaire — Natty Fitness Trainer (Draft v1)". [`docs/apps-script/build-questionnaire.gs`](apps-script/build-questionnaire.gs) generates the Google Form from it in one run (with branching at 3.11, 5.7 and 7.11, and a new private "Questionnaire responses (private)" sheet); after that, the form is edited in the Google Forms editor and the script is kept for history.

Keeping the pre-fill working:

- Edits in the Forms editor don't change the form link or the pre-fill keys.
- Never delete and recreate Email (1.1), Full name (1.2) or the coaching-format question (5.7): a new question gets a new key. Rewording them is fine.
- If 5.7's answers change, change `questionnaireFormatAnswers` too.
- The reminder script finds the email column by its header ("Email"), so adding or moving questions doesn't break it. "Questionnaire done" means a response row whose email matches the lead's, trimmed and ignoring case.
- No health answers ever leave the private responses sheet: the website, lead emails and the Leads tab never carry them.

## Go-live checklist

1. Replace `QUESTIONNAIRE_PLACEHOLDER` with the real Google Form link and its three pre-fill keys, and ship that change. Until then, every confirmation email would carry a broken questionnaire link.
2. Merge and release the booking code the usual way (backup tag first).
3. In Workers Builds, set `NEXT_PUBLIC_CONSULTATION_FORM_ENABLED=true` and redeploy the latest build.
4. End-to-end test on `https://www.nattyfitnesstrainer.com/consultation` with a second email address: you land on the thank-you page, the calendar shows your name and email filled in, the request reaches the Gmail inbox with Reply set to the test address, and the confirmation from hello@ arrives with both links. Book a slot, confirm it lands on Google Calendar with a Meet link, then cancel it.
5. If anything is wrong, remove `NEXT_PUBLIC_CONSULTATION_FORM_ENABLED` and redeploy; for a bad code release, roll back the Worker version in Cloudflare.

## Storage behavior

The application has no database. A submission is emailed to Nathnael and, when configured, one row (request ID, date, name, email, coaching interest) is added to the private Leads sheet. Questionnaire answers live only in the questionnaire's own private responses sheet; the Leads sheet only records the date it was done. Retention for people who don't become clients: questionnaire answers 6 months, Leads rows 12 months (handled by the Apps Script once `RETENTION_ENABLED` is turned on).

## Daily reminder script

[`docs/apps-script/consultation-leads.gs`](apps-script/consultation-leads.gs) is pasted into the Leads spreadsheet (Extensions → Apps Script) and runs in Nathnael's Google account, not on this website. It receives Leads rows from the API (`doPost`, checked against the shared secret), and once a day at 9 AM Pacific it checks Google Calendar (an event listing the lead's email = booked) and the questionnaire responses (a row with the lead's email = done). It sends one combined reminder at day 1 and a last one at day 3, only for what's missing; it skips leads whose call time has passed, marked Client or Closed, or who replied STOP. Setup steps are at the top of the file.

## Manual lead workflow

There's no CRM or database in this sprint, but leads still need to be triaged and tracked once they land in the business inbox. See [`docs/lead-management.md`](lead-management.md) for the manual Gmail-labels-and-spreadsheet workflow, recommended labels/columns, and privacy guidance for handling delivered leads.

## Future roadmap

- **Lead storage**: a database instead of the Leads sheet, once volume makes the sheet painful.
- **CRM integration**: connecting leads to a CRM instead of a single inbox and sheet.

None of these are implemented yet, and this document should be updated when they are.
