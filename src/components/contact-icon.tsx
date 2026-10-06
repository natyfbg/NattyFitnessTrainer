interface ContactIconProps {
  readonly kind: "email" | "phone";
  readonly className?: string;
}

/** Small decorative line icon; the surrounding link carries the text. */
export function ContactIcon({ kind, className }: ContactIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {kind === "email" ? (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3.5 7 8.5 6 8.5-6" />
        </>
      ) : (
        <path d="M6.6 3.5h2.6l1.6 4.2-2 1.3a10.5 10.5 0 0 0 6.2 6.2l1.3-2 4.2 1.6v2.6a1.8 1.8 0 0 1-1.9 1.8A15.5 15.5 0 0 1 4.8 5.4a1.8 1.8 0 0 1 1.8-1.9Z" />
      )}
    </svg>
  );
}
