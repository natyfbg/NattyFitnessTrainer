import { Section } from "@/components/section";
import { FaqAccordion } from "@/components/faq-accordion";
import {
  faqCategories,
  getFaqItemsByCategory,
  type FaqCategoryId,
} from "@/content/faq";

interface FaqGroupSectionProps {
  readonly categoryId: FaqCategoryId;
  readonly tone?: "default" | "elevated";
}

/** One FAQ category rendered as its own labeled section. */
export function FaqGroupSection({
  categoryId,
  tone = "default",
}: FaqGroupSectionProps) {
  const category = faqCategories.find(
    (candidate) => candidate.id === categoryId,
  );
  const items = getFaqItemsByCategory(categoryId);

  if (items.length === 0) {
    return null;
  }

  const headingId = `faq-${categoryId}-heading`;

  return (
    <Section id={categoryId} tone={tone} aria-labelledby={headingId} narrow>
      <h2
        id={headingId}
        className="font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl"
      >
        {category?.label ?? categoryId}
      </h2>
      <FaqAccordion items={items} />
    </Section>
  );
}
