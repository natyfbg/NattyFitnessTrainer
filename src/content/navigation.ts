export interface NavItem {
  readonly label: string;
  readonly href: string;
}

export interface NavGroup {
  readonly heading: string;
  readonly items: readonly NavItem[];
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
  { label: "Terms", href: "/terms" },
] as const;

/** Header navigation. All entries are dedicated routes. */
export const headerNavigation: readonly NavItem[] = [
  { label: "Coaching", href: "/coaching" },
  { label: "About", href: "/about" },
  { label: "Insights", href: "/insights" },
  { label: "FAQ", href: "/faq" },
] as const;

/**
 * Footer link columns. The footer's contact column (consultation, email,
 * phone) is built from trainer.contact rather than listed here.
 */
export const footerNavigation: readonly NavGroup[] = [
  {
    heading: "Explore",
    items: [
      { label: "Coaching", href: "/coaching" },
      { label: "About", href: "/about" },
      { label: "Insights", href: "/insights" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    heading: "Legal",
    items: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms & cancellation", href: "/terms" },
    ],
  },
] as const;
