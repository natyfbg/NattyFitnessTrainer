// Declares static image imports (e.g. `import x from "./photo.webp"`) for
// `tsc`. Next.js also adds this reference to the generated, gitignored
// `next-env.d.ts`, but that file is missing on a fresh clone (such as the
// Cloudflare Workers Build, which runs `npm run check` before any Next.js
// command), so it is committed here as well.
/// <reference types="next/image-types/global" />
