import type { TermsTable as TermsTableValue } from "@/content/terms";

interface TermsTableProps {
  readonly table: TermsTableValue;
}

/**
 * Two-column policy table. Follows the FormatComparison pattern: stacked
 * cards below `sm` (no horizontal scrolling), a real table from `sm` up.
 */
export function TermsTable({ table }: TermsTableProps) {
  const [whenHeader, outcomeHeader] = table.headers;

  return (
    <>
      <dl className="mt-4 flex flex-col gap-3 sm:hidden">
        {table.rows.map((row) => (
          <div
            key={row.when}
            className="rounded-card border border-border bg-background-elevated p-4"
          >
            <dt className="text-sm font-medium text-foreground">{row.when}</dt>
            <dd className="mt-1 text-sm">{row.outcome}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 hidden overflow-x-auto sm:block">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">{table.caption}</caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="w-2/5 border-b border-border py-2 pr-4 text-left font-medium text-foreground"
              >
                {whenHeader}
              </th>
              <th
                scope="col"
                className="border-b border-border py-2 text-left font-medium text-foreground"
              >
                {outcomeHeader}
              </th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row.when}>
                <th
                  scope="row"
                  className="border-b border-border py-3 pr-4 text-left align-top font-medium text-foreground-muted"
                >
                  {row.when}
                </th>
                <td className="border-b border-border py-3 align-top text-foreground">
                  {row.outcome}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
