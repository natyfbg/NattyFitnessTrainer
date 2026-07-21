import Link from "next/link";
import { SITE_NAME } from "@/content/site";
import { headerNavigation } from "@/content/navigation";
import { heroContent } from "@/content/home";
import { CtaLink } from "./cta-link";
import { Container } from "./container";

/**
 * Site header. Mobile navigation uses native <details>/<summary> — no
 * client-side JavaScript is needed for a fully accessible disclosure
 * pattern (keyboard support and expanded/collapsed state come from the
 * browser for free).
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95">
      <Container className="relative flex h-16 items-center justify-between sm:h-20">
        <Link
          href="/"
          className="font-display text-lg font-medium tracking-tight text-foreground sm:text-xl"
        >
          {SITE_NAME}
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          <ul className="flex items-center gap-8">
            {headerNavigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm font-medium text-foreground-muted transition-colors duration-150 hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <CtaLink
            href={heroContent.primaryCta.href}
            className="px-5 py-2.5 text-sm"
          >
            {heroContent.primaryCta.label}
          </CtaLink>
        </nav>

        <details className="md:hidden">
          <summary
            aria-label="Open menu"
            className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-card border border-border text-foreground [&::-webkit-details-marker]:hidden"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          </summary>
          <div className="absolute inset-x-0 top-full border-b border-border bg-background px-[var(--content-padding-x)] pb-6">
            <nav aria-label="Mobile">
              <ul className="flex flex-col gap-1 pt-2">
                {headerNavigation.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block rounded-card px-3 py-3 text-base font-medium text-foreground hover:bg-background-elevated"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <CtaLink
                href={heroContent.primaryCta.href}
                className="mt-4 w-full"
              >
                {heroContent.primaryCta.label}
              </CtaLink>
            </nav>
          </div>
        </details>
      </Container>
    </header>
  );
}
