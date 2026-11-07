import type { MDXComponents } from "mdx/types";

// Global MDX component mappings. Deliberately restrained — this is a
// baseline for readable article content, not the final visual design system.
const components: MDXComponents = {
  h1: ({ children }) => (
    <h1 className="mt-10 mb-4 text-3xl font-semibold tracking-tight text-foreground">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-8 mb-3 text-2xl font-semibold tracking-tight text-foreground">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 mb-2 text-xl font-semibold text-foreground">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-4 mb-2 text-lg font-semibold text-foreground">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="mb-4 leading-7 text-foreground-muted">{children}</p>
  ),
  a: ({ children, ...props }) => (
    <a
      className="underline decoration-foreground-muted underline-offset-2 hover:decoration-foreground"
      {...props}
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 list-disc space-y-1 pl-6 text-foreground-muted">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-1 pl-6 text-foreground-muted">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-7">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-4 border-border pl-4 italic text-foreground-muted">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-border px-3 py-2 text-left font-semibold text-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-border px-3 py-2 align-top text-foreground-muted">
      {children}
    </td>
  ),
  code: ({ children }) => (
    <code className="rounded bg-background-elevated px-1.5 py-0.5 font-mono text-[0.9em] text-foreground">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="mb-4 overflow-x-auto rounded-lg bg-background-elevated p-4 text-sm text-foreground">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-8 border-t border-border" />,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
