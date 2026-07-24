# Lead Management Workflow

This documents the launch-time workflow for handling consultation leads once they leave the application. See [`docs/consultation-leads.md`](consultation-leads.md) for how the form itself works (Turnstile, Resend, validation, security); this document picks up from the moment an email lands in the business inbox.

There is no CRM, database, or automation in this sprint. This is a manual, email-first workflow suited to low lead volume.

## Workflow

```
Website form → Turnstile → Resend → nattyfitnessgeek@gmail.com → Gmail labels → private Google Sheet
```

1. A visitor submits `/consultation`. Turnstile and server-side validation run as described in `docs/consultation-leads.md`.
2. Resend delivers the submission as an email to the business inbox, configured as the `CONSULTATION_TO_EMAIL` environment variable (intended value: `nattyfitnessgeek@gmail.com`). This inbox is private — see [`AGENTS.md`](../AGENTS.md) / [`CLAUDE.md`](../CLAUDE.md) for the standing rule against publishing it.
3. Each new lead email is manually labeled in Gmail (below) as it's triaged.
4. Key details are manually copied into a private Google Sheet for tracking across the full lead lifecycle, since Gmail labels alone don't capture status changes over time or provide an easy overview.

No part of this workflow is automated (no Gmail filters wired to Sheets, no Apps Script, no Zapier/Make). Labeling and spreadsheet entry are manual steps performed by Nathnael.

## Recommended Gmail labels

Apply one label per lead email, updating it as the lead progresses:

- `Natty Fitness/Leads/New` — just arrived, not yet reviewed
- `Natty Fitness/Leads/Replied` — an initial reply has been sent
- `Natty Fitness/Leads/Consultation Scheduled` — a consultation time has been agreed
- `Natty Fitness/Leads/Converted` — the lead became a client
- `Natty Fitness/Leads/Closed` — no further action (declined, unresponsive, not a fit)

Nesting all labels under `Natty Fitness/Leads/` keeps them grouped and out of the way of personal email.

## Recommended spreadsheet columns

A single private Google Sheet, one row per lead:

| Column            | Purpose                                                                               |
| ----------------- | ------------------------------------------------------------------------------------- |
| Lead ID           | A simple sequential or date-based identifier, for reference                           |
| Date received     | When the consultation email arrived                                                   |
| Name              | From the submission                                                                   |
| Email             | From the submission                                                                   |
| Phone             | From the submission, if provided                                                      |
| General area      | City/area from the submission, if provided                                            |
| Coaching interest | Online / Hybrid / In-Person / Not sure yet                                            |
| Primary goal      | As selected on the form                                                               |
| Status            | Mirrors the Gmail label (New / Replied / Consultation Scheduled / Converted / Closed) |
| Last contact      | Date of the most recent communication                                                 |
| Next follow-up    | Date to check back in, if applicable                                                  |
| Consultation date | Scheduled date/time, once set                                                         |
| Outcome           | Free-text summary once the lead reaches Converted or Closed                           |

## Privacy guidance

- **The email is the original record.** The spreadsheet is an operational tracker for follow-up and pipeline visibility — it is not the source of truth and is not a medical-record system.
- **Do not copy medical information into the spreadsheet.** No diagnoses, medications, injury details, or other sensitive health data belong in any column, including "Outcome." The consultation form itself already asks visitors not to submit this information (see [`/privacy`](../src/app/privacy/page.tsx)); the spreadsheet should not become a place where it accumulates anyway.
- **Keep free-text copying minimal.** Copy only what's needed for follow-up (name, contact info, goal category, status) rather than pasting a lead's full message into the sheet.
- **Restrict access.** The spreadsheet should only be shared with people who need it for the business — not made publicly viewable or link-shared broadly.
- **No unsolicited marketing enrollment.** Tracking a lead in this sheet does not imply consent to add them to a marketing list or newsletter; see the no-enrollment rule already in `docs/consultation-leads.md`.
- **This is a placeholder workflow, not a permanent architecture.** If lead volume grows, a proper database and admin interface (see the "Future roadmap" in `docs/consultation-leads.md`) should replace manual Gmail labels and spreadsheet rows — this document should be revisited when that happens.
