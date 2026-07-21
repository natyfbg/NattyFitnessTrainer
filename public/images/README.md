# Website Images

Repository-managed photography and graphics for the public site (Version 1 of the content roadmap — see [`docs/content-management.md`](../../docs/content-management.md)).

## Folder purpose

- `brand/` — logo, wordmark, favicon source, and other brand marks.
- `home/` — homepage-specific photography (hero images, etc.).
- `about/` — trainer/about-page photography (e.g. headshot).
- `coaching/` — images representing coaching styles (online, hybrid, in-person) and the coaching process.
- `insights/` — featured images for Insights articles.
- `nfg-app/` — imagery for the upcoming NFG app.
- `testimonials/` — client testimonial photography. **Never add a client photo here without that client's explicit permission.**

## Conventions

- Use descriptive kebab-case filenames, e.g. `trainer-headshot-800x1000.jpg`, not `IMG_1234.jpg`.
- Do not commit camera RAW files (`.CR2`, `.NEF`, `.ARW`, etc.) or unnecessarily huge originals — export an optimized web version before adding it here.
- Always keep an archival copy of the original, full-resolution file outside this repository (e.g. cloud storage or a local archive). This folder holds web-ready derivatives only.
- Prefer optimized WebP or AVIF for photography; JPEG or PNG are acceptable where those formats fit better (e.g. PNG for graphics with transparency).
- Where practical, include the image's dimensions in the filename (e.g. `-1600x900`) or in a per-folder inventory note, so downstream `width`/`height` values for `next/image` are easy to find.
- Render all website photography with [`next/image`](https://nextjs.org/docs/app/api-reference/components/image), not a raw `<img>` tag, so it gets automatic optimization.
- Every meaningful image needs accurate, specific alternative text describing what the image shows. Purely decorative images should use an empty `alt=""`, not a description.
- Do not add placeholder, fake, or third-party stock photos to this repository — an empty folder with real content pending is preferable to a fake stand-in image.

## Planned professional photo shoot

The following shots are planned but not yet captured; do not fabricate placeholders for them:

- Horizontal desktop hero
- Vertical mobile hero
- Trainer headshot
- Training/client interaction
- Exercise demonstration
- Online coaching / app context
- Bay Area / outdoor fitness
- Neutral-background service photographs
