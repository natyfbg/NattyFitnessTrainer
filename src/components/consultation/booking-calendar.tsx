"use client";

import { useEffect, useRef } from "react";
import { readConsultationContact } from "@/lib/consultation/contact-handoff";
import { buildBookingLink, getCalLink } from "@/lib/consultation/links";
import { useConsultationContact } from "./use-consultation-contact";

// Cal.com's inline embed. Its script loads only on the thank-you page,
// only when a booking link is configured. The visitor's name and email
// come from this tab's sessionStorage (see contact-handoff.ts), never
// from the URL.
const CAL_EMBED_SCRIPT = "https://app.cal.com/embed/embed.js";
const CAL_ORIGIN = "https://app.cal.com";
const CAL_NAMESPACE = "free-consultation";

type CalCall = (...args: unknown[]) => void;

interface CalNamespaceApi extends CalCall {
  readonly q: unknown[][];
}

interface CalGlobal extends CalCall {
  readonly q: unknown[][];
  readonly ns: Record<string, CalNamespaceApi>;
  readonly loaded: boolean;
}

declare global {
  interface Window {
    Cal?: CalGlobal;
  }
}

function createNamespaceApi(): CalNamespaceApi {
  const queue: unknown[][] = [];
  return Object.assign((...args: unknown[]) => queue.push(args), {
    q: queue,
  });
}

/**
 * The same queueing loader as Cal.com's published embed snippet, typed:
 * calls are queued until embed.js loads and replays them.
 */
function ensureCal(): CalGlobal {
  if (window.Cal) {
    return window.Cal;
  }

  const queue: unknown[][] = [];
  const namespaces: Record<string, CalNamespaceApi> = {};
  const cal: CalGlobal = Object.assign(
    (...args: unknown[]) => {
      const [command, name] = args;
      if (command === "init" && typeof name === "string") {
        const api = namespaces[name] ?? createNamespaceApi();
        namespaces[name] = api;
        api.q.push(args);
        queue.push(["initNamespace", name]);
        return;
      }
      queue.push(args);
    },
    { q: queue, ns: namespaces, loaded: true },
  );
  window.Cal = cal;

  const script = document.createElement("script");
  script.src = CAL_EMBED_SCRIPT;
  script.async = true;
  document.head.appendChild(script);

  return cal;
}

interface BookingCalendarProps {
  readonly bookingUrl: string;
  readonly fallbackLinkLabel: string;
}

export function BookingCalendar({
  bookingUrl,
  fallbackLinkLabel,
}: BookingCalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const contact = useConsultationContact();

  useEffect(() => {
    const element = containerRef.current;
    // Embed once per page view (React runs effects twice in development).
    if (!element || startedRef.current) {
      return;
    }
    startedRef.current = true;

    const stored = readConsultationContact();
    // The brand gold comes from the site's own design token.
    const brandColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--gold")
      .trim();

    ensureCal()("init", CAL_NAMESPACE, { origin: CAL_ORIGIN });
    const api = window.Cal?.ns[CAL_NAMESPACE];
    api?.("inline", {
      elementOrSelector: element,
      calLink: getCalLink(bookingUrl),
      config: {
        layout: "month_view",
        theme: "dark",
        ...(stored ? { name: stored.fullName, email: stored.email } : {}),
      },
    });
    api?.("ui", {
      theme: "dark",
      layout: "month_view",
      ...(brandColor ? { styles: { branding: { brandColor } } } : {}),
    });
  }, [bookingUrl]);

  return (
    <div>
      <div
        ref={containerRef}
        className="min-h-[32rem] w-full overflow-hidden rounded-card border border-border"
      />
      <p className="mt-3 text-sm text-foreground-muted">
        <a
          href={buildBookingLink(bookingUrl, contact)}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:no-underline"
        >
          {fallbackLinkLabel}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </p>
    </div>
  );
}
