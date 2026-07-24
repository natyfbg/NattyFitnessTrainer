export interface NavItem {
  readonly label: string;
  readonly href: string;
}

/** Only routes that actually exist — never a placeholder link. */
export const primaryNavigation: readonly NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Coaching", href: "/coaching" },
  { label: "About", href: "/about" },
  { label: "Insights", href: "/insights" },
  { label: "FAQ", href: "/faq" },
  { label: "Consultation", href: "/consultation" },
  { label: "Privacy", href: "/privacy" },
] as const;

/** Header navigation. All entries are dedicated routes. */
export const headerNavigation: readonly NavItem[] = [
  { label: "Coaching", href: "/coaching" },
  { label: "About", href: "/about" },
  { label: "Insights", href: "/insights" },
  { label: "FAQ", href: "/faq" },
] as const;
