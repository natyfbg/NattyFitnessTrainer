import type { ReactNode } from "react";
import { Container } from "./container";

interface SectionProps {
  readonly children: ReactNode;
  readonly id?: string;
  readonly className?: string;
  /** Use the elevated background tone to separate this section visually. */
  readonly tone?: "default" | "elevated";
  readonly narrow?: boolean;
  readonly "aria-labelledby"?: string;
}

export function Section({
  children,
  id,
  className,
  tone = "default",
  narrow,
  "aria-labelledby": ariaLabelledBy,
}: SectionProps) {
  const toneClassName =
    tone === "elevated" ? "bg-background-elevated" : "bg-background";

  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      // scroll-mt keeps anchor-linked sections clear of the sticky header
      // (h-16 / sm:h-20 in SiteHeader) when scrolled to via #id navigation.
      className={`py-[var(--section-spacing)] ${id ? "scroll-mt-16 sm:scroll-mt-20" : ""} ${toneClassName} ${className ?? ""}`}
    >
      <Container narrow={narrow}>{children}</Container>
    </section>
  );
}
