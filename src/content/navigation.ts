export interface NavItem {
  readonly label: string;
  readonly href: string;
}

/** Only routes that actually exist — never a placeholder link. */
export const primaryNavigation: readonly NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Insights", href: "/insights" },
] as const;
