interface EyebrowProps {
  readonly children: string;
  readonly id?: string;
  readonly className?: string;
}

/** Small uppercase label used to introduce a section or headline. */
export function Eyebrow({ children, id, className }: EyebrowProps) {
  return (
    <p
      id={id}
      className={`flex items-center gap-2 text-sm font-medium tracking-wide text-gold ${className ?? ""}`}
    >
      <span aria-hidden className="h-px w-6 bg-gold" />
      {children}
    </p>
  );
}
