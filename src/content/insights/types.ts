import type { ComponentType } from "react";
import type { ArticleCategoryId } from "./categories";

export interface ArticleContributor {
  readonly name: string;
  readonly credentials?: readonly string[];
}

export interface ArticleReference {
  readonly label: string;
  readonly url?: string;
}

export interface ArticleFeaturedImage {
  readonly src: string;
  readonly alt: string;
}

export interface ArticleFrontmatter {
  readonly title: string;
  readonly description: string;
  readonly category: ArticleCategoryId;
  readonly tags: readonly string[];
  readonly author: ArticleContributor;
  /**
   * Only set this when the named person actually reviewed this specific
   * article — never attach a reviewer by default or for a different article.
   */
  readonly reviewer?: ArticleContributor;
  /** ISO 8601 date string, e.g. "2026-07-20". */
  readonly publishedAt: string;
  /** ISO 8601 date string. */
  readonly updatedAt?: string;
  readonly featuredImage?: ArticleFeaturedImage;
  readonly draft: boolean;
  /** Sources actually used to write this article. */
  readonly references?: readonly ArticleReference[];
}

export interface ArticleSummary extends ArticleFrontmatter {
  readonly slug: string;
}

export interface ArticleEntry {
  readonly slug: string;
  readonly frontmatter: ArticleFrontmatter;
  readonly Component: ComponentType;
}
