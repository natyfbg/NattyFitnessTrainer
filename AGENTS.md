<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Implementation rules for coding agents

These rules apply to Codex and other coding agents working in this repository.

- Read the existing implementation before editing. Understand the surrounding code and its conventions before making changes.
- Make small, focused changes. Do not bundle unrelated work into a single change.
- Do not redesign unrelated sections of the code or UI while completing a task.
- Preserve SEO, accessibility, responsive design, and performance characteristics of existing pages and components.
- Prefer Server Components. Only add `"use client"` when a component genuinely needs browser interactivity (state, effects, event handlers, browser APIs).
- Use semantic HTML elements (`<nav>`, `<main>`, `<section>`, `<article>`, `<button>`, etc.) rather than generic `<div>`/`<span>` where a semantic element fits.
- Keep reusable components typed — props should have explicit TypeScript types/interfaces.
- Avoid adding unnecessary dependencies. Justify any new dependency before adding it.
- Do not expose secrets. Never commit API keys, tokens, or credentials, and never print them to logs or output.
- Do not silently change the approved technology stack or deployment architecture (Next.js, React, Tailwind CSS, OpenNext, Cloudflare Workers, Wrangler). Flag any such need instead of making the change unilaterally.
- Before reporting a task complete, run `npm run format:check`, `npm run lint`, `npm run typecheck`, and `npm run build`, and resolve any failures.
- Never commit, push, deploy, or modify Git history unless explicitly requested by the user.

## Deployment-hardening rules

- Never deploy, upload, commit, push, merge, or rewrite Git history unless explicitly requested.
- Never expose, print, or commit secrets.
- Preserve the OpenNext and Cloudflare Workers architecture.
- Preserve the Worker name and the match between it and the `WORKER_SELF_REFERENCE` service binding.
- Preserve the Webpack flags (`--webpack` on `dev`/`build`) unless an explicitly approved compatibility migration replaces them.
- `main` must remain production-ready.
- Deployment-related changes require `npm run check`, `npm run build`, and a manual `npm run preview` before production review.
- Never use production client data in previews.
- Never introduce a production environment variable or binding without documenting it.

## Content integrity rules

- Centralized content files under `src/content/` are the source of truth for business copy — do not hardcode business copy directly in components/pages instead of reading it from there.
- Never invent contact information, testimonials, credentials, prices, service locations, reviewer identities, citations, or medical claims. Use `null`/`undefined` for unknown values instead of a placeholder.
- Draft articles (`draft: true`) must not be exposed in production — verify this through the existing registry/route logic rather than adding a separate, divergent check.
- Article references must correspond to sources actually used to write that article.
- Do not represent opinion as established evidence; keep research-supported information, professional interpretation, and personal opinion clearly distinguishable.
- Do not publish or expose client photos or stories without explicit permission.
- MDX content and article metadata must remain typed and build-safe for Cloudflare — no runtime filesystem reads, no untyped `any` escape hatches for content data.
- Preserve the Git-managed content architecture (Version 1: Git + MDX + repository images) unless explicitly approved otherwise.

## Visual system rules

- Preserve the semantic design tokens in `src/app/globals.css` (`--bg`, `--text`, `--gold`, `--border`, etc., mapped via Tailwind's `@theme`) — use the existing token utility classes rather than introducing raw hex values or ad hoc colors in components. See `docs/design-system.md`.
- Maintain mobile-first responsive behavior — build the small-viewport layout first, then add `sm`/`md`/`lg` refinements, not the reverse.
- Do not introduce a second, unrelated visual system (new color palette, type scale, spacing scale, or component library) without updating `docs/design-system.md` first.
- Do not invent content to fill empty UI — an honest "coming soon" or empty state is always preferable to a fabricated placeholder.
- Never use fake testimonials, client photos, or invented metrics/statistics to make a section feel more populated.
- Keep Server Components as the default; only introduce a Client Component when a feature genuinely requires browser interactivity that native HTML (e.g. `<details>`/`<summary>`) can't provide.
- Avoid adding UI/animation/icon-library dependencies — the existing token system, Tailwind utilities, and small inline SVGs are sufficient for this project's needs.

## Consultation lead flow rules

- Consultation form submissions (name, email, phone, city/area, goals) are sensitive personal information — never log or commit submitted lead data, and never add logging that would capture it, even for debugging.
- Never commit Turnstile or Resend credentials, and never expose `TURNSTILE_SECRET_KEY` or `RESEND_API_KEY` to client code, logs, or error responses.
- Server-side validation in `src/app/api/consultation/route.ts` is mandatory and authoritative — client-side validation is for UX only; never remove or weaken the server-side re-validation.
- Turnstile verification cannot be skipped in production under any circumstance. The local development bypass (`CONSULTATION_DEV_BYPASS`) must remain gated on `NODE_ENV !== "production"`, checked in code, not just by convention.
- Never make the API respond as if an email was delivered when it wasn't — an unconfigured or failing email provider must return an honest error, never a false success.
- Do not add form fields that collect medical records, diagnoses, medications, or other unnecessary sensitive health data. A separate, later flow is where a detailed assessment belongs.
- Do not enroll consultation leads in marketing emails or any mailing list without separate, explicit consent — this form is for responding to the inquiry only.
- Preserve `NEXT_PUBLIC_CONSULTATION_FORM_ENABLED` as a genuine kill switch — both the page and the API route must honor it independently.
- Preserve the local-only nature of the development bypass — it must never be reachable in a production build/deployment, and must never log submitted PII even when active.

## Coaching and About page rules

- Training format (online/hybrid/in-person) and support tier (check-in frequency, live-session count, communication cadence, customization level) are different concepts — support tiers are undesigned and unpriced; never invent one on `/coaching`, `/about`, or elsewhere.
- Never invent exact response times, package inclusions, session counts, certification numbers/renewal dates, competitions, injuries, awards, dates, or a specific service-radius/city beyond the confirmed general "Bay Area" label.
- The business inbox address is environment-configured for the consultation flow only — never hardcode it into public page content, and never publish it without explicit instruction.
- Coaching-format comparisons must only state confirmed distinctions and must remain usable on narrow screens without horizontal table overflow (see the `FormatComparison` pattern in `docs/design-system.md`).
- Reuse existing homepage components (`HowItWorks`, `ConsultationCta`, `TrustStrip`, `FaqAccordion`) on new pages instead of duplicating their content or markup.

<!-- END:nextjs-agent-rules -->
