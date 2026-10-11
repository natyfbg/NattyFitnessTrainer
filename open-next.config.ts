// OpenNext configuration for Cloudflare Workers.
// See https://opennext.js.org/cloudflare/caching
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

export default defineCloudflareConfig({
  // Every page on this site is prerendered at build time and never
  // revalidated (no `revalidate`, no dynamic APIs; only /api/consultation runs
  // per request). Serve those prerendered pages straight from Workers static
  // assets instead of rendering React on every request: far less CPU per
  // page view, which keeps requests under the Workers CPU limit (error 1102).
  // The cache is read-only and filled by `opennextjs-cloudflare deploy` /
  // `upload` / `preview` (our `npm run deploy` / `upload` scripts), so a new
  // deploy is what updates it. If a page ever needs revalidation, switch to
  // the R2 incremental cache instead.
  incrementalCache: staticAssetsIncrementalCache,
  // Answer cached pages before loading the Next.js server.
  enableCacheInterception: true,
});
