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

<!-- END:nextjs-agent-rules -->
