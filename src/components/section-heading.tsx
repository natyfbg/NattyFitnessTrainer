import type { ElementType, ReactNode } from "react";
import { Eyebrow } from "./eyebrow";

interface SectionHeadingProps {
  readonly eyebrow?: string;
  readonly heading: ReactNode;
  readonly supportingStatement?: string;
  readonly id?: string;
  /** Heading element to render — defaults to h2 since the page's single h1 lives in the hero. */
  readonly as?: ElementType;
  readonly align?: "left" | "center";
}

export function SectionHeading({
  eyebrow,
  heading,
  supportingStatement,
  id,
  as: HeadingTag = "h2",
  align = "left",
}: SectionHeadingProps) {
  const isCentered = align === "center";

  return (
    <div
      className={`flex flex-col gap-4 ${isCentered ? "items-center text-center" : "items-start text-left"}`}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <HeadingTag
        id={id}
        className="font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl"
      >
        {heading}
      </HeadingTag>
      {supportingStatement ? (
        <p
          className={`max-w-[60ch] text-lg text-foreground-muted ${isCentered ? "mx-auto" : ""}`}
        >
          {supportingStatement}
        </p>
      ) : null}
    </div>
  );
}
