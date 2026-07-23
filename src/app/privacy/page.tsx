import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { getCanonicalUrl } from "@/content/site";
import { privacyLastUpdated } from "@/content/privacy";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description:
    "How Natty Fitness Trainer handles information submitted through the free consultation form.",
  alternates: {
    canonical: getCanonicalUrl("/privacy"),
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
            through the free consultation form on this site. It&rsquo;s a
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
          </section>

          <section>
            <h2 className="font-display text-xl font-medium text-foreground">
              Anti-spam and delivery services
            </h2>
            <p className="mt-2">
              This form is protected by Cloudflare Turnstile, which checks that
              submissions come from real visitors rather than automated bots.
              Submitted information is sent using Resend, an email delivery
              service, to Nathnael&rsquo;s inbox.
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
              information is on file or to request its deletion), use the{" "}
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
