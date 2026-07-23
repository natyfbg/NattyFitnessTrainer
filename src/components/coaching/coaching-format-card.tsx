import { trainingStyles } from "@/content/coaching";
import type { CoachingFormatDetail } from "@/content/coaching-page";

interface CoachingFormatCardProps {
  readonly detail: CoachingFormatDetail;
}

/** One expanded coaching-format card: who it suits, how it works, advantages, and limitations. */
export function CoachingFormatCard({ detail }: CoachingFormatCardProps) {
  const style = trainingStyles.find((candidate) => candidate.id === detail.id);

  return (
    <div className="flex flex-col gap-4 rounded-card border border-border bg-background-elevated p-6">
      <div>
        <h3 className="font-display text-xl font-medium text-foreground">
          {style?.label ?? detail.id}
        </h3>
        {style ? (
          <p className="mt-1 text-sm text-foreground-muted">
            {style.description}
          </p>
        ) : null}
      </div>

      <p className="text-sm text-foreground-muted">
        <span className="font-medium text-foreground">Best for: </span>
        {detail.suitedFor}
      </p>

      <p className="text-sm text-foreground-muted">
        <span className="font-medium text-foreground">How it works: </span>
        {detail.howItWorks}
      </p>

      <div>
        <p className="text-sm font-medium text-foreground">Advantages</p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {detail.advantages.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-sm text-foreground-muted"
            >
              <span
                aria-hidden="true"
                className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground">Limitations</p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {detail.limitations.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-sm text-foreground-muted"
            >
              <span
                aria-hidden="true"
                className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-border"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
