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

Since 2026-10-11, prerendered pages are served from Workers static assets instead of being rendered on every request (`open-next.config.ts`: `staticAssetsIncrementalCache` with `enableCacheInterception`). Before this, OpenNext used its default "dummy" cache, so every page view re-rendered React in the Worker (`x-nextjs-cache: MISS`). That cost enough CPU that the dev preview hit error 1102 ("Worker exceeded resource limits") right after a deploy.

- It fits this site because every page is prerendered at build time and nothing revalidates (no `revalidate`, no dynamic APIs). Only `/api/consultation` and `/_next/image` run per request.
- The cache is read-only. `opennextjs-cloudflare deploy`, `upload` and `preview` (our `npm run deploy` / `upload` / `preview` scripts) copy the build's prerendered pages into `.open-next/assets/cdn-cgi/_next_cache`, which only the Worker can read. A new deploy is what updates it, so a plain `wrangler deploy` without OpenNext would leave pages uncached (rendered per request, as before).
- Check it on any deployment: page responses carry `x-opennext-cache: HIT` (or `x-nextjs-cache: HIT`).
- If a page ever needs ISR or revalidation, switch to the R2 incremental cache (see the [OpenNext caching docs](https://opennext.js.org/cloudflare/caching)).

## Logs

Workers Logs is on (`observability` in `wrangler.jsonc`) with invocation logs off, so the only lines stored are the ones the app writes. Today that is one JSON line per failed step of a consultation request (`src/lib/consultation/diagnostics.ts`):

```json
{
  "event": "consultation_failure",
  "step": "turnstile",
  "requestId": "…",
  "reason": "not-successful",
  "errorCodes": ["invalid-input-secret"]
}
```

- `step` is `turnstile`, `notification-email`, `confirmation-email`, `leads-sheet` or `unexpected`. `reason`, `status`, `errorCodes`, `hostname` and `action` say why.
- Lines never contain a name, email, phone, area, goals text, Turnstile token, secret or IP address. Keep it that way when adding new ones.
- Read them in the Cloudflare dashboard: **Workers & Pages → natty-fitness-trainer → Logs** (search for `consultation_failure`), or live with **Real-time logs** / `wrangler tail`.

Common reasons:

| Step                                    | Reason                                    | Meaning                                                                                                              |
| --------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| turnstile                               | `not-successful` + `invalid-input-secret` | `TURNSTILE_SECRET_KEY` doesn't belong to the widget whose site key the site was built with.                          |
| turnstile                               | `not-successful` + `timeout-or-duplicate` | The token expired (5 minutes) or was already used. The visitor just retries.                                         |
| turnstile                               | `hostname-mismatch` / `action-mismatch`   | Turnstile reported a different hostname or action than the request.                                                  |
| turnstile                               | `AbortError` / `TypeError`                | siteverify didn't answer in 8 seconds, or the request failed.                                                        |
| notification-email / confirmation-email | `provider-error` + `status`               | Resend refused the email (401/403: API key; 422: from address or domain).                                            |
| leads-sheet                             | `reply-not-json`                          | The Apps Script web app isn't deployed with access "Anyone", or `LEADS_SCRIPT_URL` isn't its `/exec` URL.            |
| leads-sheet                             | `script-refused`                          | The script rejected the row, usually because `LEADS_SCRIPT_SECRET` doesn't match its `LEADS_SECRET` script property. |

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
7. **Error 1102 ("Worker exceeded resource limits")** means a request used more CPU than the Workers plan allows. Check that pages still show `x-opennext-cache: HIT` (see Caching above), then the Worker's CPU time in the dashboard metrics.
8. **"We couldn't verify your submission"** on the consultation form, or any other consultation failure: find the request's `consultation_failure` line in the Worker's logs (see Logs above).
9. Distinguish **warnings** (informational console output, e.g. the Windows/OpenNext preview warning) from **failed builds** (a build/deploy command exits non-zero) or **HTTP 500 responses** (the Worker deployed but is erroring at runtime) — each requires a different fix.

## Manual dashboard configuration still required

The following still need to be done manually in the Cloudflare dashboard; nothing in this repository configures them:

- Connect the GitHub repository (`natyfbg/NattyFitnessTrainer`) to Workers Builds and apply the settings in the [table above](#planned-workers-builds-configuration).
- Configure the `NODE_VERSION` build variable (`24`) in Workers Builds.
- Configure any Worker runtime variables/secrets in the Worker's settings.
- Connect a custom domain once one is confirmed.
- Enable Cloudflare Access on preview URLs, if/when preview protection is needed.
