export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

/**
 * Foundational FAQ set. Expand as real client questions come in — see
 * docs/content-management.md.
 */
export const faqItems: readonly FaqItem[] = [
  {
    question: "What coaching styles are available?",
    answer:
      "Online coaching, hybrid coaching, and in-person personal training in the Bay Area.",
  },
  {
    question: "How do I get started?",
    answer:
      "Start with a free consultation to talk through your goals and the coaching style that fits you best.",
  },
  {
    question: "How is progress tracked?",
    answer: "Through monthly progress assessments built into your coaching.",
  },
  {
    question: "What does coaching cost?",
    answer:
      "Pricing is discussed during your free consultation and depends on the coaching style and plan that fits your goals.",
  },
] as const;
