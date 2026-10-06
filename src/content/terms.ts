import { contactEmail, contactSms, type ContactLink } from "./contact";

/**
 * Booking, cancellation and refund terms shown on /terms, written in
 * Nathnael's voice. Plan prices and per-plan session counts are kept off
 * this page on purpose (pricing stays private), so examples use fractions
 * rather than dollar amounts. The hold fee is a policy fee and is listed.
 *
 * Update `termsLastUpdated` whenever this content materially changes.
 */
export const termsLastUpdated = "2026-10-06";

/** Plain text, or a run of text and links (e.g. a phone number). */
export type TermsText = string | readonly (string | ContactLink)[];

export interface TermsTableRow {
  readonly when: string;
  readonly outcome: string;
}

export interface TermsTable {
  /** Read by screen readers; not shown visually. */
  readonly caption: string;
  readonly headers: readonly [string, string];
  readonly rows: readonly TermsTableRow[];
}

export interface TermsItem {
  readonly term: string;
  readonly detail: TermsText;
}

/**
 * Each section renders its parts in this order: intro, table, callout,
 * items, notes. Every part is optional.
 */
export interface TermsSection {
  /** Anchor id for the on-page contents list. */
  readonly id: string;
  readonly heading: string;
  readonly intro?: TermsText;
  readonly table?: TermsTable;
  /** A short note set apart from the text around it. */
  readonly callout?: TermsText;
  readonly items?: readonly TermsItem[];
  readonly notes?: readonly TermsText[];
}

export interface TermsPageContent {
  readonly title: string;
  readonly description: string;
  readonly intro: string;
  readonly sections: readonly TermsSection[];
}

function requireContact(link: ContactLink | null, field: string): ContactLink {
  if (link === null) {
    throw new Error(
      `The /terms page needs trainer.contact.${field} in src/content/trainer.ts.`,
    );
  }
  return link;
}

const text = requireContact(contactSms, "phone");
const email = requireContact(contactEmail, "email");

export const termsPage: TermsPageContent = {
  title: "Terms & Cancellation Policy",
  description:
    "How payment, cancellations, pauses and refunds work for coaching with Natty Fitness Trainer, including your rights under California law.",
  intro:
    "Here's how payment, cancellations, pauses and refunds work for every coaching option. If anything's unclear, text or email me before you book.",
  sections: [
    {
      id: "how-this-works",
      heading: "How this works",
      intro:
        "Everything is paid before it starts, so cancelling never leaves you with a bill to pay later. The worst a late cancellation can do is use up a session you've already paid for.",
      table: {
        caption: "When each coaching option is paid",
        headers: ["Option", "When you pay"],
        rows: [
          { when: "Single session", outcome: "When you book" },
          {
            when: "Monthly plan (online, in-person or hybrid)",
            outcome: "At the start of each billing month",
          },
          {
            when: "3-month online plan",
            outcome: "Up front, for all 3 months",
          },
        ],
      },
      callout: [
        "To cancel or reschedule, text ",
        text,
        " or email ",
        email,
        ". Your notice counts from the time your message arrives.",
      ],
    },
    {
      id: "single-sessions",
      heading: "Single sessions",
      intro:
        "Cancel at least 24 hours ahead and it costs you nothing. Inside 24 hours, the session counts as used.",
      table: {
        caption: "What happens when you cancel a single session",
        headers: ["When you cancel", "What happens"],
        rows: [
          {
            when: "24 hours or more before",
            outcome:
              "Free. Reschedule, keep the full amount as a credit, or ask for a refund.",
          },
          {
            when: "Less than 24 hours before, or no-show",
            outcome: "The session counts as used. No credit or refund.",
          },
        ],
      },
      callout:
        "Your first late cancellation is on me: once per client, I treat it as if you gave 24 hours' notice. No-shows don't qualify.",
    },
    {
      id: "monthly-plans",
      heading: "Monthly in-person and hybrid plans",
      intro:
        "Your plan includes a set number of sessions each billing month, so a cancelled session gets moved, not refunded.",
      table: {
        caption: "What happens when you cancel a session on a monthly plan",
        headers: ["When you cancel", "What happens"],
        rows: [
          {
            when: "24 hours or more before",
            outcome: "We reschedule it within the same billing month.",
          },
          {
            when: "Less than 24 hours before",
            outcome:
              "Your first one each billing month is rescheduled. After that, the session counts as used.",
          },
          { when: "No-show", outcome: "The session counts as used." },
        ],
      },
      notes: [
        "Unused sessions don't roll over to the next month, with two exceptions: sessions I cancel, and sessions you moved in time that we couldn't fit in. Those carry into the first two weeks of the next month.",
        "Your sessions are counted per billing month, not per week. In a month with a fifth week, you can add an extra session at your plan's per-session rate.",
      ],
    },
    {
      id: "online-coaching",
      heading: "Online coaching calls and check-ins",
      items: [
        {
          term: "Coaching calls",
          detail:
            "Coaching calls follow the same 24-hour rule: with 24 hours' notice, we move the call to another time in the same month. A call missed without notice isn't made up.",
        },
        {
          term: "Check-ins",
          detail:
            "If you miss a check-in, your program update happens at your next scheduled check-in. Missed check-ins don't extend your plan or lower its price.",
        },
      ],
    },
    {
      id: "on-the-day",
      heading: "When I cancel, someone's late, or plans change on the day",
      intro:
        "If I cancel, it never costs you anything: you choose a reschedule, a credit or a refund.",
      items: [
        {
          term: "Running late",
          detail:
            "If you arrive late, the session still ends at its scheduled time. If I'm late, you get the full 60 minutes or a credit for the time you missed.",
        },
        {
          term: "No word after 15 minutes",
          detail:
            "If you haven't arrived or messaged 15 minutes after the start time, the session counts as a no-show.",
        },
        {
          term: "Weather",
          detail:
            "For outdoor sessions, I'll offer an indoor option or a free reschedule, decided at least 2 hours before.",
        },
        {
          term: "Gym or building access",
          detail:
            "You arrange access for me. If I'm turned away because of an access problem on your side, it counts as a late cancellation.",
        },
      ],
    },
    {
      id: "pausing",
      heading: "Pausing your plan",
      intro:
        "You can pause any plan for 1 or 2 billing months, up to 2 months in any 12. Ask at least 7 days before your next billing date. For a week or two away, we reschedule within the month instead.",
      items: [
        {
          term: "Hold fee",
          detail:
            "$20 for each month on hold. It keeps your current rate and, for in-person and hybrid plans, your regular session times.",
        },
        {
          term: "Injury or illness",
          detail:
            "No hold fee. Just tell me you can't train right now; I don't need medical details.",
        },
        {
          term: "Your progress stays on file",
          detail:
            "Your program, assessments and notes are kept whether you pause or cancel, so you pick up where you left off.",
        },
        {
          term: "Restarting",
          detail:
            "Your plan restarts on the agreed date at the same price, and I'll remind you 7 to 30 days before it bills again. On a 3-month plan, the paused time is added to the end.",
        },
      ],
      notes: [
        "If you'd rather not pay the hold fee, you can cancel instead and rejoin later at the prices current then.",
      ],
    },
    {
      id: "cancelling",
      heading: "Cancelling your plan",
      intro: [
        "You can cancel any plan at any time, with no minimum term. Use the cancel button in your billing portal, text ",
        text,
        ", or email ",
        email,
        ". Cancelling stops the next renewal right away.",
      ],
      items: [
        {
          term: "Monthly plans",
          detail:
            "Your plan runs to the end of the month you've paid for, and you can use your remaining sessions until then. Partial months aren't refunded.",
        },
        {
          term: "3-month online plans",
          detail:
            "If you stop early, you get back the share of the price for the time you haven't used. For example, stopping after 1 month refunds two-thirds of what you paid.",
        },
      ],
    },
    {
      id: "california-rights",
      heading: "Your rights under California law",
      intro:
        "These rights apply on top of everything above, and nothing in this policy takes them away.",
      items: [
        {
          term: "Cancel a new agreement within 5 business days",
          detail:
            "You can cancel before midnight of the fifth business day after you sign, not counting Sundays and holidays. Send written notice by first-class mail to the address in your client agreement, by email from the address I have on file, or in person. I'll refund what you paid within 10 days of getting your notice, minus the share of services that were available to you before you cancelled.",
        },
        {
          term: "Death or disability",
          detail:
            "If death or a disability (verified by a physician) keeps you from training, you or your estate owe nothing more, and I'll promptly refund the prepaid amount for sessions you didn't receive.",
        },
        {
          term: "Moving away",
          detail:
            "If you move more than 25 miles away, you can end your plan and owe nothing more, and I'll refund the prepaid amount for sessions you didn't receive. There's no fee for leaving this way.",
        },
      ],
    },
    {
      id: "credits-refunds-changes",
      heading: "Credits, refunds and changes",
      items: [
        {
          term: "Credits",
          detail:
            "Credits stay on your account, don't expire, and apply to your next booking or invoice.",
        },
        {
          term: "Refunds",
          detail:
            "Refunds go back to your original payment method and usually show up within 5 to 10 business days.",
        },
        {
          term: "Exceptions",
          detail:
            "Emergencies, illness and injury happen. I may waive any of the rules above at my discretion, so tell me what's going on when you cancel.",
        },
        {
          term: "Changes to prices or this policy",
          detail:
            "I'll tell you by text or email at least 7 days, and no more than 30 days, before a change to what you pay. A change never applies to time you've already paid for.",
        },
      ],
    },
  ],
};
