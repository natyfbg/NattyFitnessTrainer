# Natty Fitness Trainer

An SEO-first, mobile-first client-acquisition website for a personal trainer. The site's purpose is to attract prospective clients through search, present the trainer's services clearly, and convert visitors into leads.

**Status:** The public website is currently under development. The homepage and other pages are being built out incrementally; content and design are not final.

## Technology Stack

- [Next.js](https://nextjs.org) (App Router)
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [OpenNext](https://opennext.js.org/cloudflare) for deployment to Cloudflare Workers
- [ESLint](https://eslint.org) + [Prettier](https://prettier.io) for linting and formatting

Framework and infrastructure choices (Next.js, React, OpenNext, Wrangler) are fixed for this project and should not be changed without explicit approval.

## Local Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Development Commands

| Command                | Description                                    |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | Start the local dev server (Webpack)           |
| `npm run build`        | Build the production app (Webpack)             |
| `npm run start`        | Start the built app locally                    |
| `npm run lint`         | Run ESLint                                     |
| `npm run format`       | Format the codebase with Prettier              |
| `npm run format:check` | Check formatting without writing changes       |
| `npm run typecheck`    | Run the TypeScript compiler in no-emit mode    |
| `npm run check`        | Run format check, lint, and typecheck together |
| `npm run cf-typegen`   | Generate Cloudflare environment types          |

> **Note:** `dev` and `build` intentionally use the `--webpack` flag for OpenNext/Cloudflare compatibility on Windows.

## Cloudflare Preview

To build and preview the app in the Cloudflare Workers runtime:

```bash
npm run preview
```

This runs an OpenNext build followed by a local Cloudflare Workers preview server.

Deployment and upload (`npm run deploy`, `npm run upload`) are separate, explicit actions and are not part of routine local development.

## Deployment

- `npm run preview` — build and run the app locally in the Cloudflare Workers runtime.
- `npm run upload` — build and upload a new Worker **version** with a preview URL, without promoting it to production.
- `npm run deploy` — build and deploy, **promoting the new version to production**. This changes the live Worker.

`main` is the production branch — production deployments should only be made from a clean, reviewed `main`.

See [`docs/deployment.md`](docs/deployment.md) for the full deployment guide (branch workflow, Workers Builds configuration, environment/secrets management, caching, and rollback).

> **Warning:** `npm run deploy` changes the live Worker at `https://natty-fitness-trainer.natyfbg.workers.dev`. Run it deliberately, not as part of routine local development.

## Content Management

Business copy is centralized as typed content under `src/content/`, and articles live under `/insights` as Git-managed MDX files. See [`docs/content-management.md`](docs/content-management.md) for how to update trainer/business information, add photography, and create or publish an Insights article.

## Architecture Principles

- **SEO-first** — pages are structured and optimized for search visibility.
- **Mobile-first** — layouts are designed for small screens first, then enhanced for larger viewports.
- **Accessible** — semantic HTML and accessible patterns are used throughout.
- **Performance-focused** — pages stay lightweight and fast, in keeping with Core Web Vitals.
- **Server Components by default** — Client Components are used only when browser interactivity is required.
- **Reusable components** — UI is built from typed, composable components.
- **Low-cost infrastructure** — the stack (Cloudflare Workers via OpenNext) is chosen to keep hosting costs minimal.

## Git Workflow

- `main` is production-ready at all times.
- `dev` is the shared integration branch.
- Feature branches are created from and merged into `dev`.
- `dev` is tested before being merged into `main`.
