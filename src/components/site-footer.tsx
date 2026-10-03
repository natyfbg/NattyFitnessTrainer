import Image from "next/image";
import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE } from "@/content/site";
import { primaryNavigation } from "@/content/navigation";
import { socialLinks } from "@/content/social";
import { trainer } from "@/content/trainer";
import logoMark from "../../public/images/brand/logo-mark-256.png";
import { Container } from "./container";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <Container className="flex flex-col gap-8 py-12 sm:flex-row sm:justify-between">
        <div className="max-w-sm">
          <p className="flex items-center gap-3 font-display text-lg font-medium text-foreground">
            <Image src={logoMark} alt="" width={36} height={36} />
            {SITE_NAME}
          </p>
          <p className="mt-2 text-sm text-foreground-muted">{SITE_TAGLINE}</p>
          <p className="mt-2 text-sm text-foreground-muted">
            Online coaching, hybrid coaching, and in-person training in the{" "}
            {trainer.serviceAreaLabel}.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:items-end">
          <nav aria-label="Footer">
            <ul className="flex flex-col gap-2 sm:items-end">
              {primaryNavigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-foreground-muted hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {socialLinks.length > 0 ? (
            <ul aria-label="Social media" className="flex gap-4">
              {socialLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="me noopener noreferrer"
                    className="text-sm text-foreground-muted hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Container>

      <div className="border-t border-border">
        <Container className="py-6">
          <p className="text-xs text-foreground-muted">
            © {year} {SITE_NAME}. All rights reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}
