import { contactEmail, contactSms, type ContactLink } from "./contact";
import { termsPage, type TermsTable, type TermsText } from "./terms";

/**
 * Stripe customer portal login link (Stripe → Settings → Billing → Customer
 * portal → Portal link). Clients enter their email there and Stripe emails
 * them a sign-in link to update their card, see invoices or cancel. Set to
 * null to hide the button.
 *
 * This is the SANDBOX link (it contains "/login/test_"), for testing on the
 * dev preview. Replace it with the live link before /billing ships to main:
 * while a test link is set, the page shows a test-mode note and the footer
 * doesn't link to /billing.
 */
export const billingPortalUrl: string | null =
  "https://billing.stripe.com/p/login/test_dRm3cw9DX4xo27Z42E0kE00";

/** True while the portal link points at Stripe's sandbox. */
export const isTestPortalLink: boolean =
  billingPortalUrl?.includes("/p/login/test_") ?? false;

/** True once a live portal link is set; the footer links to /billing then. */
export const billingPortalLive: boolean =
  billingPortalUrl !== null && !isTestPortalLink;

function requireContact(link: ContactLink | null, field: string): ContactLink {
  if (link === null) {
    throw new Error(
      `The /billing page needs trainer.contact.${field} in src/content/trainer.ts.`,
    );
  }
  return link;
}

const text = requireContact(contactSms, "phone");
const email = requireContact(contactEmail, "email");

/** "When you pay" comes straight from /terms, so the two never disagree. */
function whenYouPayTable(): TermsTable {
  const table = termsPage.sections.find(
    (section) => section.id === "how-this-works",
  )?.table;
  if (!table) {
    throw new Error(
      'The /billing page reads the "how-this-works" table in src/content/terms.ts.',
    );
  }
  return table;
}

export interface BillingPageContent {
  readonly title: string;
  readonly description: string;
  readonly eyebrow: string;
  readonly heading: string;
  readonly intro: string;
  readonly portalButtonLabel: string;
  readonly signInNote: string;
  readonly testModeNote: string;
  readonly noPortalNote: TermsText;
  readonly portalFeaturesHeading: string;
  readonly portalFeatures: readonly string[];
  readonly whenYouPayHeading: string;
  readonly whenYouPay: TermsTable;
  readonly cardNote: string;
  readonly helpHeading: string;
  readonly help: TermsText;
  readonly termsLinkLabel: string;
}

/** Copy for /billing. Only states what /terms and the privacy notice already say. */
export const billingPage: BillingPageContent = {
  title: "Billing",
  description:
    "Manage your Natty Fitness Trainer coaching plan: update your card, see invoices, or cancel.",
  eyebrow: "Billing",
  heading: "Manage your coaching plan",
  intro:
    "Your plan is billed through Stripe. Sign in to the billing portal with the email you use for coaching to update your card, see your invoices, or cancel.",
  portalButtonLabel: "Manage my subscription",
  signInNote:
    "Enter your email on the next page and Stripe will email you a sign-in link. There's no password to remember.",
  testModeNote:
    "Test mode: this button opens Stripe's sandbox portal, not real billing.",
  noPortalNote: [
    "Online billing isn't set up yet. Text ",
    text,
    " or email ",
    email,
    " and I'll help with anything billing-related.",
  ],
  portalFeaturesHeading: "In the billing portal you can",
  portalFeatures: [
    "Update the card you pay with",
    "See and download your invoices and receipts",
    "Cancel your plan. It runs to the end of the period you've paid for.",
  ],
  whenYouPayHeading: "When you pay",
  whenYouPay: whenYouPayTable(),
  cardNote:
    "You enter your card details on Stripe's secure pages, never on this site.",
  helpHeading: "Pauses, plan changes and questions",
  help: [
    "Pauses and plan changes go through me rather than the portal. Text ",
    text,
    " or email ",
    email,
    " and I'll set them up, or answer any question about an invoice.",
  ],
  termsLinkLabel: "Read the full Terms & Cancellation Policy",
};
