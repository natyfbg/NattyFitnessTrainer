import { trainer } from "./trainer";

export type SocialPlatform = "instagram" | "tiktok" | "youtube";

export interface SocialLink {
  readonly platform: SocialPlatform;
  readonly label: string;
  readonly href: string;
}

interface SocialCandidate extends Omit<SocialLink, "href"> {
  readonly href: string | null;
}

const candidates: readonly SocialCandidate[] = [
  { platform: "instagram", label: "Instagram", href: trainer.social.instagram },
  { platform: "tiktok", label: "TikTok", href: trainer.social.tiktok },
  { platform: "youtube", label: "YouTube", href: trainer.social.youtube },
];

/** Profiles with a confirmed URL, in display order. */
export const socialLinks: readonly SocialLink[] = candidates.filter(
  (link): link is SocialLink => link.href !== null,
);
