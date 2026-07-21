import type { ReactNode } from "react";

interface ContainerProps {
  readonly children: ReactNode;
  readonly className?: string;
  /** Narrows to a comfortable reading width instead of the full content width. */
  readonly narrow?: boolean;
}

export function Container({ children, className, narrow }: ContainerProps) {
  const maxWidth = narrow
    ? "max-w-[var(--content-max-width-narrow)]"
    : "max-w-[var(--content-max-width)]";

  return (
    <div
      className={`mx-auto w-full px-[var(--content-padding-x)] ${maxWidth} ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
