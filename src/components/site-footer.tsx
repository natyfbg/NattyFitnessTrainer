import Image from "next/image";
import Link from "next/link";
import { contactEmail, contactPhone } from "@/content/contact";
import { footerNavigation } from "@/content/navigation";
import { SITE_NAME, SITE_TAGLINE } from "@/content/site";
import { socialLinks } from "@/content/social";
import { trainer } from "@/content/trainer";
import logoMark from "../../public/images/brand/logo-mark-256.png";
import { ContactIcon } from "./contact-icon";
import { Container } from "./container";
import { SocialIcon } from "./social-icon";

const columnHeadingClass = "text-sm font-medium tracking-wide text-gold";
const footerLinkClass =
  "text-sm text-foreground-muted transition-colors hover:text-foreground";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <Container className="py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Link
              href="/"
              className="inline-flex items-center gap-3 font-display text-lg font-medium text-foreground"
            >
              <Image src={logoMark} alt="" width={40} height={40} />
              {SITE_NAME}
            </Link>
            <p className="mt-4 max-w-sm text-sm text-foreground-muted">
              {SITE_TAGLINE}
            </p>
            <p className="mt-2 max-w-sm text-sm text-foreground-muted">
              Online coaching, hybrid coaching, and in-person training in the{" "}
              {trainer.serviceAreaLabel}.
            </p>

            {socialLinks.length > 0 ? (
              <ul aria-label="Social media" className="mt-6 flex gap-3">
                {socialLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="me noopener noreferrer"
                      aria-label={`${link.label} (opens in a new tab)`}
                      title={link.label}
                      className="flex h-10 w-10 items-center justify-center rounded-pill border border-border text-foreground-muted transition-colors hover:border-gold hover:text-gold"
                    >
                      <SocialIcon
                        platform={link.platform}
                        className="h-[18px] w-[18px]"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.5fr)] lg:col-span-7">
            {/* Full width on phones (the email is long); last column from sm up. */}
            <div className="col-span-2 sm:order-last sm:col-span-1">
              <h2 className={columnHeadingClass}>Get in touch</h2>
              <ul className="mt-4 flex flex-col gap-3">
                <li>
                  <Link href="/consultation" className={footerLinkClass}>
                    Free consultation
                  </Link>
                </li>
                {contactEmail ? (
                  <li>
                    <a
                      href={contactEmail.href}
                      className={`inline-flex items-center gap-2 [overflow-wrap:anywhere] ${footerLinkClass}`}
                    >
                      <ContactIcon
                        kind="email"
                        className="h-4 w-4 shrink-0 text-gold"
                      />
                      {contactEmail.label}
                    </a>
                  </li>
                ) : null}
                {contactPhone ? (
                  <li>
                    <a
                      href={contactPhone.href}
                      className={`inline-flex items-center gap-2 ${footerLinkClass}`}
                    >
                      <ContactIcon
                        kind="phone"
                        className="h-4 w-4 shrink-0 text-gold"
                      />
                      {contactPhone.label}
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>

            {footerNavigation.map((group) => {
              const headingId = `footer-${group.heading.toLowerCase()}`;
              return (
                <nav key={group.heading} aria-labelledby={headingId}>
                  <h2 id={headingId} className={columnHeadingClass}>
                    {group.heading}
                  </h2>
                  <ul className="mt-4 flex flex-col gap-3">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Link href={item.href} className={footerLinkClass}>
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              );
            })}
          </div>
        </div>
      </Container>

      <div className="border-t border-border">
        <Container className="flex flex-col gap-2 py-6 text-xs text-foreground-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE_NAME}. All rights reserved.
          </p>
          <p>
            {trainer.credentials.join(" · ")} · {trainer.serviceAreaLabel}
          </p>
        </Container>
      </div>
    </footer>
  );
}
