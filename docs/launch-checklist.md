# Launch Checklist

A concise pre-production checklist for the Natty Fitness Trainer site. This is a manual review checklist, not an automated gate — work through it before promoting a build to production. No secret values are recorded here; see [`docs/consultation-leads.md`](consultation-leads.md) and [`docs/deployment.md`](deployment.md) for where actual credentials are configured.

## Code and branch

- [ ] `npm run format:check`, `npm run lint`, `npm run typecheck`, and `npm run build` all pass cleanly.
- [ ] `main` reflects only reviewed, intentional changes — no stray debug code, `console.log`s, or commented-out blocks.
- [ ] No TODO/FIXME markers describing unfinished work that's actually load-bearing for launch.
- [ ] `.env.local` / `.dev.vars` are git-ignored and were never committed.

## Cloudflare

- [ ] Worker name and `WORKER_SELF_REFERENCE` service binding match (see `docs/deployment.md`).
- [ ] Production environment variables/secrets are configured in the Cloudflare dashboard (not just locally): Turnstile site/secret keys, Resend API key, `CONSULTATION_TO_EMAIL`, `CONSULTATION_FROM_EMAIL`.
- [ ] `NEXT_PUBLIC_CONSULTATION_FORM_ENABLED` is deliberately set (`true` only once Turnstile + Resend are verified working; otherwise left disabled).
- [ ] `CONSULTATION_DEV_BYPASS` is **not** set to `true` in the production environment (it's already code-gated to non-production, but the variable shouldn't be present in production configuration either).
- [ ] A manual `npm run preview` has been run against the OpenNext/Cloudflare Workers runtime, not just `npm run dev`.
- [ ] Resend's sending domain is verified — an unverified domain will fail to send in production.

## Consultation

- [ ] A real test submission was sent end-to-end (real Turnstile, real Resend) and arrived at the intended business inbox (documented as the intended value of `CONSULTATION_TO_EMAIL` — not published anywhere on the public site).
- [ ] The received email does not contain the Turnstile token or the visitor's IP address.
- [ ] `/consultation/thank-you` remains `noindex, nofollow`.
- [ ] The "temporarily unavailable" fallback message displays correctly when the form is disabled (spot-check by toggling `NEXT_PUBLIC_CONSULTATION_FORM_ENABLED` off locally).
- [ ] `/privacy` accurately describes current data handling (Turnstile, Resend, no database, no sale of information).

## SEO

- [ ] `/sitemap.xml` returns well-formed XML listing exactly the intended public routes (Home, About, Coaching, FAQ, Insights index, published articles, Consultation, Privacy) — no thank-you page, no API routes, no draft articles.
- [ ] `/robots.txt` allows public pages, disallows `/api/` and `/consultation/thank-you`, and references the sitemap.
- [ ] Every public page has a unique `<title>` and meta description — no duplicated or placeholder metadata.
- [ ] Canonical URLs resolve to the real production domain (via `getCanonicalUrl()`), not a workers.dev preview URL or an invented custom domain.
- [ ] A nonexistent route renders the branded 404 page (`not-found.tsx`) rather than a generic error.
- [ ] Article JSON-LD is present on published articles and absent on drafts.

## Responsive and accessibility

- [ ] Spot-check `/`, `/about`, `/coaching`, `/faq`, `/insights`, an article, `/consultation`, `/privacy`, and the 404 page at 375px, 430px, 768px, 1024px, and 1440px — no horizontal overflow.
- [ ] Mobile nav (including the FAQ entry) opens, closes, and closes on navigation as expected; touch targets are comfortably tappable.
- [ ] Each page has exactly one `<h1>` and a logical heading order.
- [ ] Keyboard navigation reaches all interactive elements (nav links, FAQ `<details>` toggles, form fields, CTAs) with a visible focus indicator.
- [ ] No information is conveyed by color alone.

## Content

- [ ] No fabricated testimonials, reviews, client counts, guarantees, response times, or transformation claims anywhere on the site.
- [ ] No prices are published (pricing is discussed during the free consultation only).
- [ ] Nutrition-related copy stays within general fitness-coaching scope — no registered-dietitian claims, no medical nutrition therapy language, no diagnosis/treatment claims.
- [ ] The business inbox address is not published anywhere in public page content.
- [ ] All draft Insights articles remain excluded from `/insights`, direct article URLs (in production), and the sitemap.
