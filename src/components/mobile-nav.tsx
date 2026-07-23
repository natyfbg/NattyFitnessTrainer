"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CtaLink } from "./cta-link";
import type { NavItem } from "@/content/navigation";
import type { HomeCta } from "@/content/home";

interface MobileNavProps {
  readonly items: readonly NavItem[];
  readonly cta: HomeCta;
}

/**
 * Mobile navigation disclosure. Uses native <details>/<summary> for
 * accessible, JS-free toggle behavior — the only reason this is a Client
 * Component at all is `usePathname()`, used purely as a `key` so the
 * <details> element remounts (and therefore closes) after navigating to a
 * new page. Without this, the open/closed state would persist across
 * client-side navigations, since SiteHeader lives in the persistent root
 * layout and isn't remounted between pages.
 */
export function MobileNav({ items, cta }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <details key={pathname} className="md:hidden">
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
            {items.map((item) => (
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
          <CtaLink href={cta.href} className="mt-4 w-full">
            {cta.label}
          </CtaLink>
        </nav>
      </div>
    </details>
  );
}
