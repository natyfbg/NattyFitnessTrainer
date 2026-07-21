import type { ReactNode } from "react";

interface TrustItemProps {
  readonly children: ReactNode;
}

/** A single credential/trust point. Render inside a <ul>. */
export function TrustItem({ children }: TrustItemProps) {
  return (
    <li className="flex items-center gap-2 text-sm text-foreground-muted">
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="h-4 w-4 shrink-0 text-gold"
      >
        <path
          fill="currentColor"
          d="M13.7 4.3a1 1 0 0 1 0 1.4l-6 6a1 1 0 0 1-1.4 0l-3-3a1 1 0 1 1 1.4-1.4L7 9.6l5.3-5.3a1 1 0 0 1 1.4 0Z"
        />
      </svg>
      <span>{children}</span>
    </li>
  );
}
