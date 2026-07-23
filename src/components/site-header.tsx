import Link from "next/link";
import { SITE_NAME } from "@/content/site";
import { headerNavigation } from "@/content/navigation";
import { heroContent } from "@/content/home";
import { CtaLink } from "./cta-link";
import { Container } from "./container";
import { MobileNav } from "./mobile-nav";

/**
 * Site header. Desktop nav and the logo stay a Server Component; only the
 * mobile disclosure (src/components/mobile-nav.tsx) needs client-side
 * awareness of the current route, so it's the one small Client Component.
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

        <MobileNav items={headerNavigation} cta={heroContent.primaryCta} />
      </Container>
    </header>
  );
}
