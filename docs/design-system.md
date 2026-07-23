# Design System

This documents the visual foundation established in Sprint 1B (Visual Foundation and Homepage V1). It's the reference for how future pages and components should look and behave — read this before adding new UI.

## Visual direction

An original premium personal-training brand: disciplined, confident, modern, personal, credible, approachable, and performance-oriented without feeling aggressive or intimidating. It draws on high-end personal-brand presentation, strong editorial hierarchy, deliberate spacing, and a conversion-focused section flow — not on any specific existing website's layout, copy, or assets.

Explicitly avoided: lime green, neon fitness branding, excessive gradients, glow effects, glassmorphism, generic bodybuilding imagery, loud red accents, overly rounded "bubbly" cards, cartoonish icons, fabricated statistics/testimonials, and generic AI-template visual patterns.

This is a single, deliberate dark brand identity — not a light/dark mode toggle. The near-black/charcoal + warm off-white + gold palette **is** the brand, regardless of OS theme preference.

## Colors and semantic tokens

All tokens are defined once in `src/app/globals.css` (`:root`, then mapped through Tailwind v4's `@theme inline`) and consumed as Tailwind utility classes — never as raw hex values scattered through components.

| Semantic token (Tailwind class)   | CSS variable      | Purpose                                                           |
| --------------------------------- | ----------------- | ----------------------------------------------------------------- |
| `bg-background` / `text-...`      | `--bg`            | Primary page background (near-black charcoal)                     |
| `bg-background-elevated`          | `--bg-elevated`   | Slightly lighter charcoal for cards and alternating sections      |
| `bg-surface-light`                | `--surface-light` | Warm off-white surface, used sparingly for inverted/light accents |
| `text-foreground`                 | `--text`          | Primary text (warm off-white)                                     |
| `text-foreground-muted`           | `--text-muted`    | Secondary/muted text (warm gray)                                  |
| `bg-gold` / `text-gold`           | `--gold`          | Restrained dark-gold/champagne accent                             |
| `bg-gold-hover` (hover states)    | `--gold-hover`    | Slightly brighter gold for hover                                  |
| `border-border` / `divide-border` | `--border`        | Subtle low-opacity borders/dividers                               |
| (used in `:focus-visible`)        | `--focus-ring`    | Keyboard focus outline color                                      |

Layout tokens (also in `:root`, used via Tailwind arbitrary-value syntax, e.g. `max-w-[var(--content-max-width)]`):

- `--content-max-width` (80rem) — standard section content width
- `--content-max-width-narrow` (42rem) — prose-width sections (About, FAQ, Consultation CTA)
- `--content-padding-x` — responsive horizontal page padding
- `--section-spacing` — responsive vertical section padding (`clamp()`-based, so it scales smoothly rather than jumping at breakpoints)
- `--radius-card-value` → `rounded-card` utility — the one card/button radius (deliberately modest, not pill-shaped)
- `--radius-pill-value` → `rounded-pill` utility — reserved for small badges/tags only
- `--shadow-elevated-value` → `shadow-elevated` utility — one subtle elevation shadow, never a glow

The gold accent is tuned to read as premium and readable at normal text sizes against the near-black background (well above WCAG AA contrast), not as a bright/neon yellow.

## Typography

Two font families only, both loaded via `next/font/google` in `src/app/layout.tsx` (no additional font packages):

- **Display** — Fraunces (`--font-display`, `font-display` utility): an editorial serif used for headlines (h1–h3) and other display moments. Gives the "premium personal brand" character without being uppercase-shouty.
- **Body** — Inter (`--font-sans`, default `font-sans`): a highly readable grotesk used for body copy, labels, and UI text.

Rules:

- Not every heading is uppercase — only the small `Eyebrow` label uses letter-spaced caps-adjacent styling; headline case follows normal sentence/title case.
- Body text uses regular/medium weights for comfortable reading — no ultra-thin weights.
- Headline sizes scale responsively (`text-4xl sm:text-5xl lg:text-6xl` for the hero h1, smaller scales for section h2s) rather than jumping to oversized desktop-only sizes that would overwhelm a laptop viewport.
- Body copy blocks are constrained with `max-w-[Nch]` (character-count based) so line lengths stay comfortable on wide screens.

## Spacing and layout principles

- Mobile-first: base styles target ~375px; `sm`/`md`/`lg` breakpoints add desktop refinement, not the other way around.
- `Container` centers content and applies responsive horizontal padding via `--content-padding-x`; pass `narrow` for prose-width sections.
- `Section` applies consistent vertical rhythm via `--section-spacing` and a `tone` of `"default"` (base background) or `"elevated"` (alternating background), so sections read as a deliberate sequence rather than a flat stack.
- Generous whitespace over dense packing; avoid cramming cards together on smaller viewports (grids collapse to 1–2 columns before 3+).

## Components

Reusable primitives live in `src/components/`; homepage-only section components live in `src/components/home/`.

- **`Container`** — max-width + responsive horizontal padding wrapper.
- **`Section`** — semantic `<section>` with vertical rhythm, optional `id` (for anchor links), `tone`, and `narrow`.
- **`SectionHeading`** — eyebrow + heading + optional supporting statement; defaults to `h2` (the page's one `h1` lives in the Hero).
- **`Eyebrow`** — small gold label with a short rule, used to introduce a section or headline.
- **`CtaLink`** — the one Button/CTA component, with `"primary"` (gold-filled) and `"secondary"` (outlined) variants. Wraps `next/link`; only ever used for real internal routes or in-page anchors.
- **`TrustItem`** — a single credential/trust list item (checkmark + text), rendered inside a `<ul>`.
- **`SiteHeader`** / **`SiteFooter`** — the shared page shell, included once in `src/app/layout.tsx` so every route gets them automatically.
- **`MobileNav`** — the mobile navigation disclosure used by `SiteHeader`. The only reason it's a Client Component: it reads the current pathname (via `usePathname()`) purely to use as a React `key` on the `<details>` element, so the disclosure remounts (and closes) after navigating to a new page. Without this, the open/closed state would persist across client-side navigations, since `SiteHeader` lives in the persistent root layout.
- **`FaqAccordion`** — the zero-JS `<details>/<summary>` accordion body (no heading), shared by the homepage FAQ preview and the `/coaching` FAQ section so the markup exists in one place.
- **`PhotoFrame`** — the one photography component (see below).

### PhotoFrame

`src/components/photo-frame.tsx` is the single reusable primitive for every photography slot on the site (hero, About, coaching, the lifestyle band, NFG screenshots). It takes an image slot from `src/content/media.ts` (`HomeImage | null`) plus an `aspectClassName`:

- **When the slot has a real image**, it renders `next/image` with `fill`, `sizes`, and the configured `objectPosition` — inside a fixed-aspect-ratio container, so there is never layout shift when a real photo replaces a fallback.
- **When the slot is `null`**, it renders one of three tasteful branded fallbacks (`fallbackVariant`), never a broken image and never literal words like "placeholder" or "image missing":
  - `"monogram"` (default) — large initials + a thin gold rule, optionally with a real, verified caption (e.g. the trainer's name) below. Used for identity-flavored slots (hero portrait, About).
  - `"texture"` — a low-contrast diagonal hairline pattern with no text. Used for atmospheric/supporting slots (coaching action, the lifestyle band) so they don't repeat the monogram treatment.
  - `"device"` — abstract UI bars inside the existing phone-frame shape. Used only for the NFG app screenshot slots.
- Pass `rounded={false}` / `bordered={false}` for edge-to-edge/full-bleed usage (the lifestyle band).
- A `caption` on the underlying `HomeImage` renders as a real `<figcaption>` (the component switches to a `<figure>` wrapper automatically) — only set one when genuinely needed.
- `PhotoFrame` is a Server Component; it never needs client-side JavaScript.

### Card conventions

Cards (coaching style cards, Insights preview cards) use `bg-background-elevated`, `border border-border`, and `rounded-card` — a modest, restrained radius, not an oversized "bubbly" rounded corner.

### Button/CTA conventions

- Primary: filled gold background, near-black text — reserved for the single highest-priority action in a given context (e.g. "Book a Free Consultation").
- Secondary: outlined, border + foreground text, gold on hover — for a supporting action alongside a primary CTA.
- Minimum touch target of 44px height (`min-h-11`) on all CTA links.

## Accessibility expectations

- Text contrast: primary text, muted text, and the gold accent are all chosen to clear WCAG AA against the near-black/charcoal backgrounds they appear on.
- Keyboard focus: a global `:focus-visible` rule applies a visible off-white outline (`--focus-ring`) to any focused interactive element — never remove focus outlines without replacing them.
- Touch targets: interactive elements (CTAs, the mobile menu toggle) target at least 44×44px.
- No information is conveyed by color alone — e.g. the FAQ disclosure marker and mobile menu icon both change shape/glyph, not just color, and status text (like "Draft" on Insights articles) is always real text, not a color swatch.
- `prefers-reduced-motion: reduce` is respected globally (animations/transitions are effectively disabled; smooth scroll falls back to instant).
- Anchor navigation accounts for the sticky header: `Section` applies `scroll-mt-16 sm:scroll-mt-20` whenever it's given an `id`, matching `SiteHeader`'s `h-16`/`sm:h-20` height, so `#coaching`/`#about`/`#faq`/`#consultation` land with clearance below the header instead of underneath it. Keep these values in sync if the header height ever changes.
- Mobile navigation uses native `<details>/<summary>` — keyboard operability and expanded/collapsed state come from the browser, not custom JavaScript.

## Responsive breakpoints

Reviewed and intended to hold up at approximately:

- **375px** (mobile) — single-column stacking everywhere, hero photo frame below the text content, no horizontal scrolling.
- **430px** (large mobile) — same layout, slightly more breathing room.
- **768px** (tablet) — coaching cards and "how it works" steps begin moving to 2-column grids; desktop nav is still hidden below `md`.
- **1024px** (small desktop) — desktop navigation and hero two-column layout activate (`md`/`lg` breakpoints); "how it works" moves to 4 columns.
- **1440px** (desktop) — content is capped by `--content-max-width` (80rem) rather than stretching edge-to-edge or scaling type further.

## Photography guidance

See [`public/images/README.md`](../public/images/README.md) for the full folder structure, file conventions, and the homepage photography inventory (every configurable slot, its folder, and its approximate crop). For the design system specifically:

- Every photography location on the homepage is a `PhotoFrame` reading from a named slot in `src/content/media.ts` (`homeMedia`): `heroPortrait`, `heroDetail`, `coachingAction`, the three About variants (`aboutTrainerPortrait` / `aboutCoachingInteraction` / `aboutTrainingAction`, rendered in that priority order — only one at a time), `lifestyleBand`, and `nfgScreenshotPrimary` / `nfgScreenshotSecondary`.
- Each slot is a fixed-aspect-ratio container so a future real photo drops in without any layout change — swap the `null` for a real `HomeImage` (`src`, `alt`, optional `width`/`height`/`objectPosition`/`caption`) and nothing else needs to change.
- Never substitute a stock photo, a fabricated "client" photo, or a plain gray placeholder box for real photography — the branded `PhotoFrame` fallbacks (see the `PhotoFrame` section above) are always preferable to a fake one.
- The NFG app preview uses an abstract device-frame composition (CSS shapes, not a screenshot) alongside an honest "Coming Soon" badge — replace with real app screenshots only once the app is real and screenshots are available, and never add a fake app-store badge or download button.
- `/coaching` and `/about` have their own photography slots (`coachingHeroImage`, `coachingEnvironmentImage`, `aboutPageHeroPortrait`, `aboutPageTrainingAction`, `aboutPageCoachingInteraction`, `aboutPageTechnicalScene`) — separate from the homepage's own slots, since a photo chosen for the homepage teaser isn't necessarily right for the dedicated page's different layout/aspect ratio.

## Dedicated pages (/coaching, /about)

Both dedicated pages (Sprint 1D) follow the same pattern as the homepage: a custom Hero (not wrapped in `Section`, matching `Hero`'s own layout) followed by a sequence of `Section`-based components, each with its own typed content in `src/content/coaching-page.ts` / `src/content/about.ts`. Section components live in `src/components/coaching/` and `src/components/about/`, mirroring `src/components/home/`.

Both pages **reuse existing homepage components directly** rather than duplicating them:

- `/coaching` reuses `HowItWorks` (the same 4-step process — "do not create competing process copy") and `ConsultationCta` (the final CTA) unchanged.
- `/about` reuses `TrustStrip` (for the credentials/experience section) and `ConsultationCta`-style patterns for its own final CTA.
- Both pages' FAQ sections build on the shared `FaqAccordion` component rather than re-implementing the accordion markup.

### Format comparison pattern

`/coaching`'s `FormatComparison` component is the reference pattern for presenting tabular data responsively without ever introducing horizontal overflow:

- Below `sm`, it renders **one card per format** (not per row), each a `<dl>` of label/value pairs — nothing to scroll horizontally.
- From `sm` up, the exact same data renders as a real `<table>` (with proper `scope="col"`/`scope="row"` headers and a `sr-only` `<caption>`), wrapped in `overflow-x-auto` as a safety net even though it shouldn't need to scroll at the sizes this project targets.
- Comparison values are plain text only — no color-coded cells — so the information doesn't depend on color to be understood.
- Only confirmed distinctions belong in a comparison row (e.g. "Bay Area requirement"). Never add a row implying a specific session count, check-in frequency, or price — those are support-tier concepts that don't exist yet.

## Rules against fabricated content

- Never invent prices, testimonials, transformation claims, contact information, social URLs, certification numbers, or service cities. All business facts are read from `src/content/`.
- The Insights preview only reads from `getPublishedArticles()` — it can never surface a draft article, and it shows an honest "coming soon" message rather than fabricated article cards when the list is empty.
- The consultation CTA section states plainly that online booking is being finalized — it never uses a submit button or form control that doesn't actually do anything.
- Training format (online/hybrid/in-person) and support tier (frequency of check-ins, live sessions, communication, customization) are different concepts — support tiers haven't been designed or priced yet and must not be invented on `/coaching`, `/about`, or anywhere else.
- Never invent exact response times, package inclusions, session counts, certification numbers/renewal dates, or a specific service-radius/city beyond the confirmed general "Bay Area" label.

## How future pages should reuse this system

- Reuse `Container`, `Section`, `SectionHeading`, `Eyebrow`, `CtaLink`, and `TrustItem` rather than re-implementing spacing/typography/button styling inline.
- Add new page-specific copy to a dedicated typed file under `src/content/` (following the `home.ts` pattern) rather than hardcoding strings in components.
- Keep new sections as Server Components by default; only reach for a Client Component when a feature genuinely requires browser interactivity that native HTML (like `<details>`/`<summary>`) can't provide.
- Don't introduce a second visual language (new color tokens, a different type scale, a component library, or an icon/animation dependency) without updating this document first.
