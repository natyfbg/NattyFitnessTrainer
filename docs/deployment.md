# Deployment

This document describes how Natty Fitness Trainer is built, previewed, and deployed to Cloudflare Workers via OpenNext. It is the detailed reference; see the [README](../README.md#deployment) for a quick summary.

## Local development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). `dev` intentionally uses the `--webpack` flag for OpenNext/Cloudflare compatibility on Windows — do not remove it.

## Validation

Run before any deployment-related work is considered done:

```bash
npm run check
npm run build
```

`check` runs Prettier formatting verification, ESLint, and TypeScript checking. `build` runs the Next.js production build (also with `--webpack`).

## Cloudflare-local validation

```bash
npm run preview
```

This runs an OpenNext build against the Cloudflare Workers runtime and then serves it locally. The exact local Worker URL (host and port) is printed in the command's output — use that value.

A Windows/OpenNext-related warning may appear in the console during this command even when the preview build and server start successfully. Treat it as informational unless the preview server fails to start or requests fail.

## Manual deployment commands

- `npm run upload` — builds with OpenNext and creates a new Worker **version** with a preview URL. It does **not** promote that version to production traffic.
- `npm run deploy` — builds with OpenNext and deploys, **promoting the new version to production**. This changes the live Worker at `https://natty-fitness-trainer.natyfbg.workers.dev`.

Production deployments (`npm run deploy`) should only be run from a clean, reviewed `main` branch. Never deploy from `dev` or a feature branch.

## Branch workflow

- Feature branches merge into `dev`.
- `dev` is the shared integration branch.
- `dev` merges into `main` only after validation.
- `main` is production and must remain production-ready at all times.

## Planned Workers Builds configuration

This is the intended configuration for Cloudflare Workers Builds (CI-driven builds/deploys triggered by GitHub pushes). It has not yet been configured in the Cloudflare dashboard as part of this task — see [Manual dashboard configuration still required](#manual-dashboard-configuration-still-required).

| Setting                       | Value                         |
| ----------------------------- | ----------------------------- |
| GitHub repository             | `natyfbg/NattyFitnessTrainer` |
| Production branch             | `main`                        |
| Root directory                | `/`                           |
| Build command                 | `npm run check`               |
| Production deploy command     | `npm run deploy`              |
| Non-production deploy command | `npm run upload`              |
| Non-production branch builds  | Enabled                       |
| Build caching                 | Enabled                       |
| `NODE_VERSION` build variable | `24`                          |

The Cloudflare **build command** (`npm run check`) only performs formatting verification, linting, and TypeScript validation — it does not build the app. The **deploy** and **upload** scripts each perform their own full OpenNext build (`opennextjs-cloudflare build`) before deploying or uploading. This split lets Workers Builds fail fast on code-quality issues via the build command, while the actual OpenNext/Next.js build happens as part of the deploy or upload step itself.

## Preview behavior

- Non-production branches (via Workers Builds, once configured) create preview Worker versions, and `npm run upload` does the same manually.
- Previews must never replace production traffic.
- Preview URLs are public by default unless later protected with Cloudflare Access.
- Preview URLs must never contain real client data or production-only secrets.

## Environment management

- `.dev.vars` is for local Worker development only and must never be committed. It is git-ignored; only `.dev.vars.example` (if present) is tracked.
- Cloudflare **build** variables (e.g. `NODE_VERSION`) are configured in Workers Builds settings.
- Cloudflare **runtime** variables and secrets are configured in the Worker's own settings (bindings/secrets), not in this repository.
- Secrets must never be added to source files, README files, logs, or Git history.

## Custom domain

`workers.dev` (`https://natty-fitness-trainer.natyfbg.workers.dev`) is currently the temporary production address. A Natty Fitness Trainer custom domain will be connected later. No domain name is confirmed yet, so none is documented here.

## Caching

OpenNext emitted a recommendation (in `open-next.config.ts`) to consider enabling R2-based incremental caching for best results. This has intentionally **not** been configured as part of this task — no KV, R2, or other incremental cache backend is set up. Caching will be reconsidered when the site introduces ISR, frequently updated dynamic content, or other features that require persistent Next.js cache behavior across requests.

## Rollback

If a production deployment causes a regression, use Cloudflare's Worker deployment/version history (in the Cloudflare dashboard, or `wrangler deployments list` / `wrangler rollback`) to identify and restore a previously working version. Do not use Git history rewriting (e.g. revert-by-force-push, history rewrites) as a rollback method — Git history and live Worker state are managed independently.

## Troubleshooting

Work through these in order:

1. `npm run check` — catches formatting, lint, and type errors.
2. `npm run build` — confirms the Next.js production build succeeds on its own, independent of Cloudflare/OpenNext.
3. `npm run preview` — confirms the OpenNext build and Cloudflare Workers runtime behave correctly locally.
4. Inspect Cloudflare build and deployment logs (Workers Builds run logs, and the Worker's own deployment logs) for errors that only show up in the Cloudflare environment.
5. Confirm the Worker name (`natty-fitness-trainer`) and the `WORKER_SELF_REFERENCE` service binding's `service` value still match each other in `wrangler.jsonc`.
6. Confirm `.open-next/` (the generated OpenNext build output) is not committed to Git — it must always be produced fresh by the build step, never checked in.
7. Distinguish **warnings** (informational console output, e.g. the Windows/OpenNext preview warning) from **failed builds** (a build/deploy command exits non-zero) or **HTTP 500 responses** (the Worker deployed but is erroring at runtime) — each requires a different fix.

## Manual dashboard configuration still required

The following still need to be done manually in the Cloudflare dashboard; nothing in this repository configures them:

- Connect the GitHub repository (`natyfbg/NattyFitnessTrainer`) to Workers Builds and apply the settings in the [table above](#planned-workers-builds-configuration).
- Configure the `NODE_VERSION` build variable (`24`) in Workers Builds.
- Configure any Worker runtime variables/secrets in the Worker's settings.
- Connect a custom domain once one is confirmed.
- Enable Cloudflare Access on preview URLs, if/when preview protection is needed.
