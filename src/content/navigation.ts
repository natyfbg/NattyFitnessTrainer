export interface NavItem {
  readonly label: string;
  readonly href: string;
}

/** Only routes that actually exist — never a placeholder link. */
export const primaryNavigation: readonly NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Insights", href: "/insights" },
  { label: "Privacy", href: "/privacy" },
] as const;

/**
 * Header navigation. Mixes the real /insights route with homepage anchors —
 * anchors use a leading "/" so they resolve correctly (navigate home, then
 * scroll) from any page, not just from "/" itself.
 */
export const headerNavigation: readonly NavItem[] = [
  { label: "Coaching", href: "/#coaching" },
  { label: "About", href: "/#about" },
  { label: "Insights", href: "/insights" },
  { label: "FAQ", href: "/#faq" },
] as const;
