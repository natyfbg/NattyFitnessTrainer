/**
 * Single centralized FAQ source. The homepage preview, the /coaching page,
 * and the dedicated /faq page all read from `faqItems` (via the helper
 * functions below) rather than each hardcoding their own question list —
 * so an answer can never silently diverge between pages.
 *
 * Careful-answer rules baked into every entry here:
 * - results vary; consistency and adherence matter more than any single
 *   session
 * - plans may be adjusted based on progress and practical circumstances
 * - no exact timelines, package inclusions, or contact-frequency promises
 * - nutrition guidance is not identical for every client, is not medical
 *   nutrition therapy, and Nathnael is not presented as a registered
 *   dietitian
 * - the free consultation determines the appropriate coaching approach
 */

export type FaqCategoryId =
  | "getting-started"
  | "coaching-formats"
  | "programming-and-progress"
  | "nutrition";

export interface FaqCategory {
  readonly id: FaqCategoryId;
  readonly label: string;
}

export const faqCategories: readonly FaqCategory[] = [
  { id: "getting-started", label: "Getting Started" },
  { id: "coaching-formats", label: "Coaching Formats" },
  { id: "programming-and-progress", label: "Programming & Progress" },
  { id: "nutrition", label: "Nutrition" },
] as const;

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
  readonly category: FaqCategoryId;
  /** Included in the homepage's concise FAQ preview subset. */
  readonly featuredOnHome?: boolean;
  /** Included in the /coaching page's FAQ subset. */
  readonly featuredOnCoaching?: boolean;
}

export const faqItems: readonly FaqItem[] = [
  // Getting started
  {
    category: "getting-started",
    question: "Who is coaching suitable for?",
    answer:
      "Coaching is built for people at any experience level who want structured, personalized guidance — whether you're just starting out, returning to training, or working through a plateau.",
    featuredOnHome: true,
  },
  {
    category: "getting-started",
    question: "Are beginners welcome?",
    answer:
      "Yes. Programming is built around your current ability and experience level, so beginners are welcome, and the plan adjusts as you progress.",
  },
  {
    category: "getting-started",
    question: "How does the free consultation work?",
    answer:
      "The free consultation is a conversation about your goals, schedule, and training preferences, used to recommend the coaching format that fits you best. There's no obligation, and no payment information is requested.",
    featuredOnHome: true,
  },
  {
    category: "getting-started",
    question: "Does submitting the form confirm a booking?",
    answer:
      "No. Submitting the consultation form sends your request directly to Nathnael by email — it doesn't automatically confirm a booking or session. Expect a personal reply rather than an instant confirmation.",
  },
  {
    category: "getting-started",
    question: "What does coaching cost?",
    answer:
      "Pricing is discussed during your free consultation and depends on the coaching style and plan that fits your goals.",
  },

  // Coaching formats
  {
    category: "coaching-formats",
    question: "How does online coaching work?",
    answer:
      "You train independently from a plan built around your goals, equipment, and schedule, with monthly check-ins to review progress and adjust the plan.",
  },
  {
    category: "coaching-formats",
    question: "How does hybrid coaching work?",
    answer:
      "Hybrid coaching combines in-person sessions in the Bay Area with online programming and check-ins for the training you do on your own.",
  },
  {
    category: "coaching-formats",
    question: "How does in-person training work?",
    answer:
      "In-person training means training together face to face in the Bay Area, with hands-on coaching, technique correction, and a plan that's reviewed monthly.",
  },
  {
    category: "coaching-formats",
    question: "How do I know which format fits me?",
    answer:
      "The free consultation is the best way to figure this out — it's a conversation about your schedule, location, and how much hands-on support you're looking for.",
    featuredOnHome: true,
    featuredOnCoaching: true,
  },
  {
    category: "coaching-formats",
    question: "Do I need a commercial gym membership?",
    answer:
      "Not necessarily. Programming can be adapted to a commercial gym, a home setup, or limited equipment, depending on what's realistic for you.",
    featuredOnCoaching: true,
  },
  {
    category: "coaching-formats",
    question: "Can training adapt to home equipment or limited equipment?",
    answer:
      "Yes — programming takes your available equipment and training environment into account, whether that's a full gym, a home setup, or minimal equipment.",
    featuredOnCoaching: true,
  },

  // Programming and progress
  {
    category: "programming-and-progress",
    question: "How are programs personalized?",
    answer:
      "Programs are built around your goals, experience level, schedule, training environment, available equipment, and current ability — not a generic template.",
  },
  {
    category: "programming-and-progress",
    question: "What factors influence programming?",
    answer:
      "Your primary goals, experience level, weekly schedule, training environment, available equipment, exercise preferences, and current ability all shape your program.",
  },
  {
    category: "programming-and-progress",
    question: "How are monthly progress assessments used?",
    answer:
      "Monthly assessments are used to review how training is going and adjust your plan based on your actual progress and circumstances.",
  },
  {
    category: "programming-and-progress",
    question: "How often may a program be adjusted?",
    answer:
      "Programs are reviewed monthly, though adjustments can happen sooner if your circumstances, schedule, or progress call for it.",
    featuredOnCoaching: true,
  },
  {
    category: "programming-and-progress",
    question: "How quickly should someone expect results?",
    answer:
      "Results vary from person to person and depend heavily on consistency and adherence. There's no fixed timeline — progress is tracked and discussed at each monthly assessment.",
  },

  // Nutrition
  {
    category: "nutrition",
    question: "Is nutrition guidance included?",
    answer:
      "General nutrition guidance is part of online and hybrid coaching, alongside your training program.",
    featuredOnHome: true,
  },
  {
    category: "nutrition",
    question: "What type of nutrition guidance may be provided?",
    answer:
      "Guidance may cover sustainable eating habits, calorie and macro awareness when appropriate, protein intake, meal structure, and consistency — all in support of your fitness goals.",
  },
  {
    category: "nutrition",
    question: "Will clients receive rigid meal plans?",
    answer:
      "Not necessarily — nutrition guidance isn't identical for every client, and the approach is discussed as part of your coaching rather than a fixed, one-size-fits-all meal plan.",
  },
  {
    category: "nutrition",
    question:
      "Does coaching replace a registered dietitian or medical professional?",
    answer:
      "No. This isn't medical nutrition therapy, and Nathnael isn't a registered dietitian. For medical or condition-specific nutrition concerns, please consult an appropriate qualified healthcare professional.",
  },
] as const;

export function getFaqItemsByCategory(
  categoryId: FaqCategoryId,
): readonly FaqItem[] {
  return faqItems.filter((item) => item.category === categoryId);
}

/** Concise subset for the homepage FAQ preview. */
export function getHomeFaqItems(): readonly FaqItem[] {
  return faqItems.filter((item) => item.featuredOnHome);
}

/** Coaching-format-focused subset for the /coaching page. */
export function getCoachingFaqItems(): readonly FaqItem[] {
  return faqItems.filter((item) => item.featuredOnCoaching);
}
