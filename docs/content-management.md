# Content Management

This document explains how to update business copy, photography, and Insights articles for Natty Fitness Trainer under the Version 1 (Git + MDX) content architecture. See the [README](../README.md#content-management) for a quick summary, and [`docs/deployment.md`](deployment.md) for how changes actually reach production.

## Content roadmap

- **Version 1 (current):** Git-managed content — typed TypeScript content files, MDX articles, and repository-managed images. Every change goes through a pull request and the normal branch workflow.
- **Version 1.5 (future, optional):** A headless CMS, if publishing becomes frequent enough that non-developers need to publish without a PR.
- **Version 2 (future):** A custom client and business administration system.

Do not introduce a CMS or admin system ahead of this roadmap without an explicit decision to do so.

## Where business copy lives

All business copy is centralized under `src/content/` as typed TypeScript modules — this is the **source of truth**, not the JSX in page components:

| File                        | Contents                                                                                                          |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `src/content/site.ts`       | Site name, tagline, canonical site URL, primary call-to-action (free consultation)                                |
| `src/content/trainer.ts`    | Trainer name, credentials, years of experience, general service-area label, biography, social links, contact info |
| `src/content/coaching.ts`   | Training styles (online/hybrid/in-person) and coaching benefits                                                   |
| `src/content/process.ts`    | "How it works" steps                                                                                              |
| `src/content/faq.ts`        | FAQ foundation                                                                                                    |
| `src/content/navigation.ts` | Primary navigation items                                                                                          |
| `src/content/nfg-app.ts`    | Upcoming NFG app wording                                                                                          |
| `src/content/insights/`     | Insights article types and the article registry (see below)                                                       |

Unknown or not-yet-provided values are represented as `null` (e.g. `trainer.bio`, `trainer.social.instagram`) — never as a fake URL, placeholder phone number, or invented city. Components that consume these fields should check for `null`/`undefined` and omit that piece of UI rather than rendering a broken link or placeholder text.

### How to update the biography

Edit `bio` in `src/content/trainer.ts`:

```ts
bio: "Write the real biography copy here.",
```

Leave it as `null` until real copy is provided.

### How to add Instagram and TikTok URLs

Edit `social` in `src/content/trainer.ts` once the exact URLs are confirmed:

```ts
social: {
  instagram: "https://instagram.com/<handle>",
  tiktok: "https://tiktok.com/@<handle>",
},
```

Do not add a URL that hasn't been explicitly provided, and never use a placeholder like `"#"`.

### How to update credentials and general service area

Edit `credentials`, `yearsOfExperience`, and `serviceAreaLabel` in `src/content/trainer.ts`. Keep `serviceAreaLabel` general (e.g. "Bay Area") unless a specific city is explicitly confirmed for publication.

## How to add website photographs

1. Read [`public/images/README.md`](../public/images/README.md) for folder purpose, naming, and format conventions.
2. Add the optimized image file to the appropriate `public/images/<folder>/` subfolder, using a descriptive kebab-case filename.
3. Reference it with [`next/image`](https://nextjs.org/docs/app/api-reference/components/image), not a raw `<img>` tag.
4. Write accurate, specific `alt` text describing what the image shows. Use `alt=""` only for purely decorative images.
5. Never commit a client photograph without that client's explicit permission.

## How to create a new MDX article

1. Add a new `.mdx` file under `src/content/insights/articles/`, e.g. `src/content/insights/articles/my-new-article.mdx`.
2. At the top of the file, export a `frontmatter` object (see **Required article metadata** below).
3. Write the article body in MDX below the `frontmatter` export.

   **Heading levels:** the article page template already renders the article's `title` as the single page-level `<h1>`. MDX article bodies must begin their sections at `##` (h2) — do not place a `#` (h1) heading inside the MDX body, or the page will end up with two `<h1>` elements. See `evidence-informed-coaching-template.mdx` for an example that correctly starts at `##`.

4. Add a matching type declaration file next to it, `my-new-article.mdx.d.ts`:

   ```ts
   import type { ArticleFrontmatter } from "../types";

   export { default } from "*.mdx";
   export const frontmatter: ArticleFrontmatter;
   ```

   This is required for the `frontmatter` export to type-check — `@types/mdx` only types the default component export by default, so each article needs this sibling file (see `evidence-informed-coaching-template.mdx.d.ts` for a working example).

5. Register the article in `src/content/insights/registry.ts`: add a static import for the new file's default export and `frontmatter`, then add an entry to the `allArticleEntries` array with the article's `slug`.

Articles are statically imported and registered by hand — there is no filesystem scanning, so every article must be explicitly added to the registry. This keeps the registry safe to run in the Cloudflare Workers runtime.

### Required article metadata

The `frontmatter` export must satisfy `ArticleFrontmatter` (`src/content/insights/types.ts`):

| Field           | Required | Notes                                                                 |
| --------------- | -------- | --------------------------------------------------------------------- |
| `title`         | Yes      |                                                                       |
| `description`   | Yes      |                                                                       |
| `category`      | Yes      | One of the ids in `src/content/insights/categories.ts`                |
| `tags`          | Yes      | Array of strings, can be empty                                        |
| `author`        | Yes      | `{ name, credentials? }`                                              |
| `reviewer`      | No       | `{ name, credentials? }` — see below                                  |
| `publishedAt`   | Yes      | ISO 8601 date string, e.g. `"2026-07-20"`                             |
| `updatedAt`     | No       | ISO 8601 date string                                                  |
| `featuredImage` | No       | `{ src, alt }`                                                        |
| `draft`         | Yes      | `true` while unpublished, `false`/omit-as-false when ready to publish |
| `references`    | No       | Array of `{ label, url? }` — sources actually used                    |

## How draft and published states work

- `getPublishedArticles()` and `getPublishedArticleSlugs()` (`src/content/insights/registry.ts`) always exclude articles with `draft: true` — these drive the `/insights` listing and `generateStaticParams` for production builds.
- `getArticleBySlug()` also excludes drafts, but **only when `NODE_ENV === "production"`**. In local development (`npm run dev`), it returns drafts too, so you can preview them at `/insights/<slug>`.
- Because of this, a draft article is unreachable in a production build/deployment (`/insights/<slug>` 404s), while still being fully previewable locally.

## How to add a reviewer responsibly

Only set `reviewer` on an article's `frontmatter` when that named person has actually reviewed **that specific article**. Never:

- Add a reviewer by default or "just in case."
- Reuse a reviewer from one article on a different article they didn't review.
- Invent a reviewer's name, title, or credentials.

If no one has reviewed the article, omit `reviewer` entirely.

## How to add references

Add entries to the `references` array in the article's `frontmatter`:

```ts
references: [
  { label: "Author, A. (Year). Title. Publication.", url: "https://..." },
],
```

References must correspond to sources actually used to write the article. Do not add references to make an article look more substantiated than it is, and do not present personal opinion as if it were a cited claim.

## How to preview a draft locally

Run `npm run dev` and visit `/insights/<slug>` for the draft's slug. The draft renders with a visible "Draft" badge. It will not appear in the `/insights` listing (which only shows published articles, even locally) and will not be reachable once deployed.

## How to publish through the Git workflow

1. Create or update the article on a feature branch.
2. When ready to go live, set `draft: false` in that article's `frontmatter`.
3. Run `npm run check` and `npm run build` locally.
4. Open a PR into `dev`. Once validated on `dev`, merge into `main` following the normal branch workflow (see [`docs/deployment.md`](deployment.md#branch-workflow)).
5. The article becomes reachable only after a production deployment picks up the change — publishing content follows the same deploy process as any other code change.

## Why generated pages should not be edited directly

`/insights` and `/insights/[slug]` are generated from the typed content in `src/content/` and the MDX files in `src/content/insights/articles/`. Editing the rendered route files directly to change copy will be overwritten or diverge from the content model the next time someone touches those routes — always edit the source content instead, so there is a single source of truth for both the rendered page and anything (like JSON-LD) derived from it.
