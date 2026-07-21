import { getCanonicalUrl } from "@/content/site";
import type { ArticleFrontmatter } from "@/content/insights/types";

interface JsonLdPerson {
  readonly "@type": "Person";
  readonly name: string;
}

interface ArticleJsonLdSchema {
  readonly "@context": "https://schema.org";
  readonly "@type": "Article";
  readonly headline: string;
  readonly description: string;
  readonly author: JsonLdPerson;
  readonly reviewedBy?: JsonLdPerson;
  readonly datePublished: string;
  readonly dateModified: string;
  readonly image?: string;
  readonly mainEntityOfPage: {
    readonly "@type": "WebPage";
    readonly "@id": string;
  };
}

function buildArticleJsonLd(
  slug: string,
  article: ArticleFrontmatter,
): ArticleJsonLdSchema {
  const url = getCanonicalUrl(`/insights/${slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    author: { "@type": "Person", name: article.author.name },
    ...(article.reviewer
      ? {
          reviewedBy: {
            "@type": "Person" as const,
            name: article.reviewer.name,
          },
        }
      : {}),
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    ...(article.featuredImage
      ? { image: getCanonicalUrl(article.featuredImage.src) }
      : {}),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}

interface ArticleJsonLdProps {
  readonly slug: string;
  readonly article: ArticleFrontmatter;
}

/** Renders Article JSON-LD. Only ever renders for published (non-draft) articles. */
export function ArticleJsonLd({ slug, article }: ArticleJsonLdProps) {
  if (article.draft) {
    return null;
  }

  const json = buildArticleJsonLd(slug, article);
  // Guard against "</script>" sequences breaking out of the script tag.
  const safeJson = JSON.stringify(json).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson }}
    />
  );
}
