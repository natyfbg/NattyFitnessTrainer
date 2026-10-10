import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import {
  DEFAULT_SOCIAL_IMAGE,
  SITE_NAME,
  SITE_LOCALE,
  getCanonicalUrl,
} from "@/content/site";
import { contactEmail } from "@/content/contact";
import { privacyLastUpdated } from "@/content/privacy";

const title = "Privacy Notice";
const description =
  "How Natty Fitness Trainer handles information submitted through the free consultation form, booking and the questionnaire, and how coaching payments are processed.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: getCanonicalUrl("/privacy"),
  },
  openGraph: {
    title: `${title} | ${SITE_NAME}`,
    description,
    url: getCanonicalUrl("/privacy"),
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    type: "website",
    images: [DEFAULT_SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | ${SITE_NAME}`,
    description,
  },
};

export default function PrivacyPage() {
  return (
    <main className="py-16 sm:py-20 lg:py-24">
      <Container narrow>
        <h1 className="font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
          Privacy Notice
        </h1>
        <p className="mt-3 text-sm text-foreground-muted">
          Last updated: {privacyLastUpdated}
        </p>

        <div className="mt-8 flex flex-col gap-6 text-foreground-muted">
          <p>
            This notice explains what happens to the information you submit
            through the free consultation form on this site, what happens after
            you send it, and how coaching payments are handled. It&rsquo;s a
            plain-language notice, not legal advice, and hasn&rsquo;t been
            reviewed as a certified legal compliance document.
          </p>

          <section>
            <h2 className="font-display text-xl font-medium text-foreground">
              What this form collects
            </h2>
            <p className="mt-2">
              The consultation form collects your full name, email address,
              optional phone number, optional city or general area, your
              coaching interest, your primary goal, and a brief description of
              your goals that you choose to share.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium text-foreground">
              Why it&rsquo;s collected
            </h2>
            <p className="mt-2">
              This information is used only to respond to your consultation
              inquiry — to understand your goals and coaching interest and to
              get back to you personally by email. Submitting this form does not
              enroll you in any marketing emails or mailing list.
            </p>
            <p className="mt-2">
              After you send it, you get one confirmation email with links to
              book your call and to the questionnaire. If you haven&rsquo;t
              booked or filled in the questionnaire, up to two short reminders
              follow over the next few days; reply STOP to end them.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium text-foreground">
              Anti-spam and delivery services
            </h2>
            <p className="mt-2">
              This form is protected by Cloudflare Turnstile, which checks that
              submissions come from real visitors rather than automated bots.
              Submitted information is sent using Resend, an email delivery
              service, to Nathnael&rsquo;s inbox, and Resend also sends your
              confirmation email.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium text-foreground">
              Booking and the questionnaire
            </h2>
            <p className="mt-2">
              Calls are booked through Cal.com. The thank-you page loads
              Cal.com&rsquo;s booking calendar and fills in the name and email
              you just entered, so Cal.com receives them when the calendar
              loads. A booked call is added to Nathnael&rsquo;s Google Calendar.
              The questionnaire is a Google Form, and its link fills in your
              name, email and coaching interest. Your answers, including any
              health and readiness answers, are kept in a private Google Sheet
              that only Nathnael can access, never on this website.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium text-foreground">
              Site analytics
            </h2>
            <p className="mt-2">
              This site uses Cloudflare Web Analytics to count visits and see
              which pages are viewed. It doesn&rsquo;t use cookies, and it
              doesn&rsquo;t track you across other websites.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium text-foreground">
              Payments
            </h2>
            <p className="mt-2">
              Coaching payments are processed by Stripe. You enter your card or
              bank details on Stripe&rsquo;s secure pages, not on this site, and
              Nathnael never sees or stores your full card number. Stripe shares
              your name, email address, payment history, and limited card
              details (such as the card brand and last four digits) so your plan
              can be managed. Stripe&rsquo;s own privacy policy covers how it
              handles your payment information.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium text-foreground">
              No sale of your information
            </h2>
            <p className="mt-2">Consultation information is never sold.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium text-foreground">
              Security and retention
            </h2>
            <p className="mt-2">
              Reasonable precautions are used to protect submitted information,
              but no method of transmission or storage can be guaranteed
              completely secure. Submitted information is kept only as long as
              reasonably needed to respond to and manage your inquiry.
            </p>
            <p className="mt-2">
              Your name, email, coaching interest and the date you sent the form
              are also kept in a private Google Sheet used to follow up on
              requests. If you don&rsquo;t become a client, questionnaire
              answers are deleted after 6 months and request records after 12
              months.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium text-foreground">
              Please don&rsquo;t submit sensitive health information
            </h2>
            <p className="mt-2">
              Please don&rsquo;t include medical records, diagnoses,
              medications, or other highly sensitive health information in this
              form.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium text-foreground">
              Privacy requests
            </h2>
            <p className="mt-2">
              To make a privacy-related request (for example, to ask what
              information is on file or to request its deletion), email{" "}
              {contactEmail ? (
                <a
                  href={contactEmail.href}
                  className="underline hover:no-underline"
                >
                  {contactEmail.label}
                </a>
              ) : (
                "Nathnael"
              )}{" "}
              or use the{" "}
              <Link
                href="/consultation"
                className="underline hover:no-underline"
              >
                consultation form
              </Link>
              , select &ldquo;Other&rdquo; as your primary goal, and write
              &ldquo;Privacy Request&rdquo; along with your request in the goals
              field.
            </p>
          </section>
        </div>
      </Container>
    </main>
  );
}
