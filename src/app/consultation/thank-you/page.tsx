import type { Metadata } from "next";
import { BookingCalendar } from "@/components/consultation/booking-calendar";
import { QuestionnaireLink } from "@/components/consultation/questionnaire-link";
import { Container } from "@/components/container";
import { CtaLink } from "@/components/cta-link";
import {
  consultationCallDescription,
  consultationFollowUpLinks,
  consultationThankYouContent as content,
} from "@/content/consultation";
import { socialLinks } from "@/content/social";

export const metadata: Metadata = {
  title: "Thank You",
  robots: {
    index: false,
    follow: false,
  },
};

const sectionHeadingClassName =
  "font-display text-2xl font-medium text-foreground";

export default function ConsultationThankYouPage() {
  const { bookingUrl, questionnaire } = consultationFollowUpLinks;
  // With nothing to book or fill in, the short message sits centred.
  const centred = bookingUrl === null && questionnaire === null;

  return (
    <main
      className={`flex-1 py-16 sm:py-20 lg:py-24 ${centred ? "flex items-center" : ""}`}
    >
      <Container narrow>
        <p className="text-sm font-medium tracking-wide text-gold">
          {content.eyebrow}
        </p>
        <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
          {content.heading}
        </h1>
        <p className="mt-4 max-w-[60ch] text-lg text-foreground-muted">
          {content.intro}
        </p>
        {bookingUrl === null ? (
          <p className="mt-4 max-w-[60ch] text-foreground-muted">
            {content.noBookingNote}
          </p>
        ) : null}

        {bookingUrl !== null ? (
          <section
            aria-labelledby="book-call-heading"
            className="mt-12 border-t border-border pt-10"
          >
            <h2 id="book-call-heading" className={sectionHeadingClassName}>
              {content.booking.heading}
            </h2>
            <p className="mt-2 text-foreground-muted">
              {consultationCallDescription}
            </p>
            <div className="mt-6">
              <BookingCalendar
                bookingUrl={bookingUrl}
                fallbackLinkLabel={content.booking.fallbackLinkLabel}
              />
            </div>
            <p className="mt-4 text-sm text-foreground-muted">
              {content.booking.notReady}
            </p>
          </section>
        ) : null}

        {questionnaire !== null ? (
          <section
            aria-labelledby="questionnaire-heading"
            className="mt-12 border-t border-border pt-10"
          >
            <h2 id="questionnaire-heading" className={sectionHeadingClassName}>
              {content.questionnaire.heading}
            </h2>
            <p className="mt-2 max-w-[60ch] text-foreground-muted">
              {content.questionnaire.intro}
            </p>
            <div className="mt-6">
              <QuestionnaireLink
                questionnaire={questionnaire}
                label={content.questionnaire.cta}
              />
            </div>
          </section>
        ) : null}

        {socialLinks.length > 0 ? (
          <p className="mt-12 max-w-[60ch] text-foreground-muted">
            In the meantime, see Nathnael&rsquo;s training on{" "}
            {socialLinks.map((link, index) => (
              <span key={link.href}>
                {index > 0
                  ? index === socialLinks.length - 1
                    ? " and "
                    : ", "
                  : null}
                <a
                  href={link.href}
                  target="_blank"
                  rel="me noopener noreferrer"
                  className="text-foreground underline hover:no-underline"
                >
                  {link.label}
                </a>
              </span>
            ))}
            .
          </p>
        ) : null}
        <CtaLink href="/" variant="secondary" className="mt-8">
          Back to Home
        </CtaLink>
      </Container>
    </main>
  );
}
