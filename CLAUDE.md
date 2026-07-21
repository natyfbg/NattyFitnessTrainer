@AGENTS.md

# Claude-specific working instructions

This project is Natty Fitness Trainer: an SEO-first, mobile-first personal trainer client-acquisition website built with Next.js (App Router), React, TypeScript, Tailwind CSS, and OpenNext for Cloudflare Workers. The public website is currently under development.

In addition to the implementation rules in AGENTS.md above, when working in this repository:

- Before starting a task, confirm your understanding of the current file structure and existing conventions rather than assuming patterns from training data — this Next.js version has breaking changes from what you may expect.
- Do not redesign or modify the visible homepage, add application features, deploy, or run `npm audit fix --force` unless explicitly asked.
- Do not upgrade Next.js, React, OpenNext, Wrangler, or other existing framework dependencies unless explicitly asked.
- Preserve the existing npm scripts, especially the `--webpack` flags on `dev`/`build` (required for OpenNext compatibility on Windows) and the Cloudflare scripts (`preview`, `deploy`, `upload`, `cf-typegen`).
- Run `npm run format:check`, `npm run lint`, `npm run typecheck`, and `npm run build` before reporting a task as complete. Do not run `npm run preview` automatically — it starts an interactive, long-running server and should only be run when explicitly requested.
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
