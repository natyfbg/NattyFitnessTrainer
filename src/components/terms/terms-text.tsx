import type { TermsText as TermsTextValue } from "@/content/terms";

interface TermsTextProps {
  readonly value: TermsTextValue;
}

/** Renders terms copy that may include contact links (sms:, mailto:). */
export function TermsText({ value }: TermsTextProps) {
  if (typeof value === "string") {
    return value;
  }

  return value.map((part) =>
    typeof part === "string" ? (
      part
    ) : (
      <a
        key={part.href}
        href={part.href}
        className="whitespace-nowrap text-foreground underline underline-offset-2 hover:no-underline"
      >
        {part.label}
      </a>
    ),
  );
}
