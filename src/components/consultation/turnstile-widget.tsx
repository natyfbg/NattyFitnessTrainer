"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Script from "next/script";

const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const TURNSTILE_ACTION = "consultation_submit";

interface TurnstileRenderOptions {
  readonly sitekey: string;
  readonly action: string;
  readonly theme: "dark";
  readonly size: "flexible";
  readonly callback: (token: string) => void;
  readonly "expired-callback": () => void;
  readonly "error-callback": () => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: TurnstileRenderOptions,
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

export interface TurnstileWidgetHandle {
  /** Clears the current (likely consumed or expired) token and requests a fresh one. */
  reset: () => void;
}

interface TurnstileWidgetProps {
  readonly siteKey: string;
  readonly onVerify: (token: string) => void;
  readonly onExpire: () => void;
  readonly onError: () => void;
}

/**
 * Cloudflare Turnstile widget, rendered explicitly (not auto-rendered) so
 * the parent form can reset it after a failed submission. Client-side
 * completion is only ever a UX signal here — the server independently
 * re-verifies every token before treating a submission as valid.
 */
export const TurnstileWidget = forwardRef<
  TurnstileWidgetHandle,
  TurnstileWidgetProps
>(function TurnstileWidget({ siteKey, onVerify, onExpire, onError }, ref) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbacksRef = useRef({ onVerify, onExpire, onError });
  const [scriptReady, setScriptReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Loading verification…");
  const reactId = useId();

  useEffect(() => {
    callbacksRef.current = { onVerify, onExpire, onError };
  }, [onVerify, onExpire, onError]);

  useImperativeHandle(ref, () => ({
    reset() {
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.reset(widgetIdRef.current);
        setStatusMessage("Verification reset — please verify again.");
      }
    },
  }));

  useEffect(() => {
    if (!scriptReady || !containerRef.current || !window.turnstile) {
      return;
    }

    const widgetId = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      action: TURNSTILE_ACTION,
      theme: "dark",
      size: "flexible",
      callback: (token: string) => {
        setStatusMessage("Verification complete.");
        callbacksRef.current.onVerify(token);
      },
      "expired-callback": () => {
        setStatusMessage("Verification expired — please verify again.");
        callbacksRef.current.onExpire();
        // Expiry alone doesn't make Turnstile re-challenge itself — reset
        // so the widget actually offers a fresh verification.
        window.turnstile?.reset(widgetId);
      },
      "error-callback": () => {
        setStatusMessage("Verification failed to load. Please try again.");
        callbacksRef.current.onError();
        window.turnstile?.reset(widgetId);
      },
    });
    widgetIdRef.current = widgetId;

    return () => {
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [scriptReady, siteKey]);

  const containerId = `turnstile-${reactId}`;

  return (
    <div>
      <Script
        src={TURNSTILE_SCRIPT_SRC}
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div ref={containerRef} id={containerId} />
      <p role="status" aria-live="polite" className="sr-only">
        {statusMessage}
      </p>
    </div>
  );
});
