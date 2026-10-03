import { trainer } from "./trainer";

export interface SocialLink {
  readonly label: string;
  readonly href: string;
}

/** Nathnael's confirmed social profiles, in display order; unset ones are skipped. */
export const socialLinks: readonly SocialLink[] = [
  { label: "Instagram", href: trainer.social.instagram },
  { label: "TikTok", href: trainer.social.tiktok },
  { label: "YouTube", href: trainer.social.youtube },
].filter((link): link is SocialLink => link.href !== null);
