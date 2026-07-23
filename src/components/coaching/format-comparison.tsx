import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { trainingStyles } from "@/content/coaching";
import {
  formatComparisonIntro,
  formatComparisonRows,
  type ComparisonRow,
} from "@/content/coaching-page";

const FORMAT_COLUMNS: readonly {
  readonly id: "online" | "hybrid" | "in-person";
  readonly key: keyof Omit<ComparisonRow, "label">;
}[] = [
  { id: "online", key: "online" },
  { id: "hybrid", key: "hybrid" },
  { id: "in-person", key: "inPerson" },
];

function formatLabel(id: string): string {
  return trainingStyles.find((style) => style.id === id)?.label ?? id;
}

/**
 * Confirmed-only distinctions between coaching formats. Stacks as one card
 * per format on narrow screens (no horizontal table overflow) and becomes
 * a real comparison table from `sm` up.
 */
export function FormatComparison() {
  return (
    <Section
      id="format-comparison"
      tone="elevated"
      aria-labelledby="format-comparison-heading"
    >
      <SectionHeading
        id="format-comparison-heading"
        eyebrow={formatComparisonIntro.eyebrow}
        heading={formatComparisonIntro.heading}
      />

      <div className="mt-10 flex flex-col gap-6 sm:hidden">
        {FORMAT_COLUMNS.map((column) => (
          <div
            key={column.id}
            className="rounded-card border border-border bg-background p-6"
          >
            <h3 className="font-display text-lg font-medium text-foreground">
              {formatLabel(column.id)}
            </h3>
            <dl className="mt-4 flex flex-col gap-3">
              {formatComparisonRows.map((row) => (
                <div key={row.label}>
                  <dt className="text-xs font-medium tracking-wide text-foreground-muted uppercase">
                    {row.label}
                  </dt>
                  <dd className="mt-0.5 text-sm text-foreground">
                    {row[column.key]}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <div className="mt-10 hidden overflow-x-auto sm:block">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">
            Comparison of online, hybrid, and in-person coaching formats
          </caption>
          <thead>
            <tr>
              <th scope="col" className="border-b border-border px-3 py-2">
                <span className="sr-only">Comparison point</span>
              </th>
              {FORMAT_COLUMNS.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className="border-b border-border px-3 py-2 text-left font-medium text-foreground"
                >
                  {formatLabel(column.id)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {formatComparisonRows.map((row) => (
              <tr key={row.label}>
                <th
                  scope="row"
                  className="border-b border-border px-3 py-3 text-left font-medium text-foreground-muted"
                >
                  {row.label}
                </th>
                {FORMAT_COLUMNS.map((column) => (
                  <td
                    key={column.id}
                    className="border-b border-border px-3 py-3 text-foreground"
                  >
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
