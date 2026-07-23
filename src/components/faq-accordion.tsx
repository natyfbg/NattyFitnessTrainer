import type { FaqItem } from "@/content/faq";

interface FaqAccordionProps {
  readonly items: readonly FaqItem[];
}

/**
 * Zero-JS accessible accordion (native <details>/<summary>) for a list of
 * FAQ items. Callers provide their own Section/SectionHeading wrapper so
 * each usage can have its own heading copy.
 */
export function FaqAccordion({ items }: FaqAccordionProps) {
  return (
    <div className="mt-8 flex flex-col divide-y divide-border border-t border-b border-border">
      {items.map((item) => (
        <details key={item.question} className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-foreground [&::-webkit-details-marker]:hidden">
            {item.question}
            <span
              aria-hidden="true"
              className="text-gold transition-transform duration-150 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-3 text-sm text-foreground-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
