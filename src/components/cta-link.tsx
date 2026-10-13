import Link from "next/link";
import type { ReactNode } from "react";

export type CtaVariant = "primary" | "secondary";

interface CtaLinkProps {
  readonly href: string;
  readonly children: ReactNode;
  readonly variant?: CtaVariant;
  readonly className?: string;
}

const baseClassName =
  "inline-flex min-h-11 items-center justify-center rounded-card px-6 py-3 text-base font-medium transition-colors duration-150";

const variantClassName: Record<CtaVariant, string> = {
  primary: "bg-gold text-background hover:bg-gold-hover",
  secondary:
    "border border-border text-foreground hover:border-gold hover:text-gold",
};

/** The CTA styling, for the rare external link that can't use CtaLink. */
export function getCtaClassName(variant: CtaVariant = "primary"): string {
  return `${baseClassName} ${variantClassName[variant]}`;
}

/** Shared CTA/button-link styling. Internal routes and anchors only. */
export function CtaLink({
  href,
  children,
  variant = "primary",
  className,
}: CtaLinkProps) {
  return (
    <Link
      href={href}
      className={`${baseClassName} ${variantClassName[variant]} ${className ?? ""}`}
    >
      {children}
    </Link>
  );
}
