import Image from "next/image";
import type { HomeImage } from "@/content/media";

type FallbackVariant = "monogram" | "texture" | "device";

interface PhotoFrameProps {
  readonly image: HomeImage | null;
  /** Tailwind aspect-ratio utility classes, e.g. "aspect-4/5 lg:aspect-3/4". */
  readonly aspectClassName: string;
  readonly sizes?: string;
  readonly priority?: boolean;
  readonly fallbackVariant?: FallbackVariant;
  /** Shown in the fallback only — a real, verified label (e.g. a name), never invented copy. */
  readonly fallbackLabel?: string;
  readonly rounded?: boolean;
  /** Set to false for edge-to-edge/full-bleed usage (e.g. the lifestyle band). */
  readonly bordered?: boolean;
  readonly className?: string;
}

/**
 * Renders a real photograph (via next/image) when one is configured, and a
 * tasteful branded placeholder composition otherwise. Never renders a
 * broken image — image slots are `null` until a real one exists.
 */
export function PhotoFrame({
  image,
  aspectClassName,
  sizes = "(min-width: 1024px) 480px, 100vw",
  priority = false,
  fallbackVariant = "monogram",
  fallbackLabel,
  rounded = true,
  bordered = true,
  className,
}: PhotoFrameProps) {
  const frameClassName = `relative overflow-hidden bg-background-elevated ${bordered ? "border border-border" : ""} ${rounded ? "rounded-card" : ""} ${aspectClassName} ${className ?? ""}`;

  const media = image ? (
    <Image
      src={image.src}
      alt={image.alt}
      fill
      sizes={sizes}
      priority={priority}
      style={{
        objectFit: "cover",
        objectPosition: image.objectPosition ?? "center",
      }}
    />
  ) : (
    <PhotoFrameFallback variant={fallbackVariant} label={fallbackLabel} />
  );

  if (image?.caption) {
    return (
      <figure className={frameClassName}>
        {media}
        <figcaption className="absolute inset-x-0 bottom-0 bg-background/80 px-4 py-2 text-xs text-foreground-muted">
          {image.caption}
        </figcaption>
      </figure>
    );
  }

  return <div className={frameClassName}>{media}</div>;
}

function PhotoFrameFallback({
  variant,
  label,
}: {
  readonly variant: FallbackVariant;
  readonly label?: string;
}) {
  if (variant === "device") {
    return (
      <div
        aria-hidden="true"
        className="flex h-full flex-col justify-between p-6"
      >
        <div className="flex flex-col gap-3">
          <div className="h-3 w-2/3 rounded-full bg-background" />
          <div className="h-20 rounded-card bg-background" />
          <div className="h-3 w-1/2 rounded-full bg-background" />
          <div className="h-3 w-full rounded-full bg-background" />
        </div>
        <div className="flex justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-border" />
          <span className="h-1.5 w-1.5 rounded-full bg-border" />
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
        </div>
      </div>
    );
  }

  if (variant === "texture") {
    return (
      <div
        aria-hidden="true"
        className="h-full w-full opacity-[0.16]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, var(--border) 0, var(--border) 1px, transparent 1px, transparent 14px)",
        }}
      />
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <span
        aria-hidden="true"
        className="font-display text-6xl font-medium text-border"
      >
        NG
      </span>
      <span aria-hidden="true" className="h-px w-14 bg-gold" />
      {label ? <p className="text-sm text-foreground-muted">{label}</p> : null}
    </div>
  );
}
