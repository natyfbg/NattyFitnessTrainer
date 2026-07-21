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

- Direct trainer portrait (neutral background)
- Candid client interaction (with explicit client permission only)
- Exercise/training demonstration
- Equipment detail
- Laptop / online-coaching context
- Outdoor Bay Area fitness
- Horizontal **and** vertical versions of important scenes, since the homepage uses both orientations (see the inventory below)

## Homepage photography inventory

Each row is a configurable slot in `src/content/media.ts` (`homeMedia`). Until a slot has a real image, the homepage shows a tasteful branded fallback via `PhotoFrame` (`src/components/photo-frame.tsx`) — see `docs/design-system.md` for how that works. To add a photo, drop the optimized file in the matching folder below, then set that slot's `src`/`alt` (and optional `width`/`height`/`objectPosition`) in `media.ts`.

| Slot (`homeMedia.*`)       | Folder      | Approx. crop                                 | Notes                                                                                                  |
| -------------------------- | ----------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `heroPortrait`             | `home/`     | Vertical 4:5                                 | Primary hero image — the trainer, in frame, not a stock photo.                                         |
| `heroDetail`               | `home/`     | Vertical or square detail                    | Optional smaller accent shot (e.g. a training/equipment detail); only shown at desktop widths.         |
| `coachingAction`           | `coaching/` | Horizontal 3:2 (wide)                        | One wide supporting image below the coaching-style cards.                                              |
| `aboutTrainerPortrait`     | `about/`    | Vertical 4:5                                 | First-priority About section image.                                                                    |
| `aboutCoachingInteraction` | `about/`    | Vertical 4:5                                 | Used only if a trainer portrait isn't set (requires client permission).                                |
| `aboutTrainingAction`      | `about/`    | Vertical 4:5                                 | Used only if neither of the above is set.                                                              |
| `lifestyleBand`            | `home/`     | Wide 16:9 or 2:1                             | Full-width band between "How It Works" and "About" — training environment or Bay Area outdoor fitness. |
| `nfgScreenshotPrimary`     | `nfg-app/`  | Native mobile screenshot proportions (~9:16) | Real app screenshot once the app has a real UI to show.                                                |
| `nfgScreenshotSecondary`   | `nfg-app/`  | Native mobile screenshot proportions (~9:16) | Optional second screenshot; only shown at desktop widths.                                              |

Reminders:

- Explicit permission is required before publishing any client photograph — the `testimonials/` and `about/` (coaching-interaction) folders are the ones most likely to involve a client, so double-check before adding anything there.
- Archive the original, full-resolution photographs outside this repository (cloud storage or a local archive) — only optimized, web-ready versions get committed here.
- Use descriptive kebab-case filenames (e.g. `hero-portrait-1200x1500.webp`), not camera-generated names.
