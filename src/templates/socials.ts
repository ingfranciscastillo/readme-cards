import type { IconName } from "../lib/svg/icons";
import type { SocialPlatform } from "../types/content";

export interface SocialPlatformInfo {
  value: SocialPlatform;
  label: string;
  icon: IconName;
}

/** Platforms offered for social links, in the order the editor lists them. */
export const SOCIAL_PLATFORMS: SocialPlatformInfo[] = [
  { value: "github", label: "GitHub", icon: "github" },
  { value: "gitlab", label: "GitLab", icon: "gitlab" },
  { value: "x", label: "X", icon: "x" },
  { value: "linkedin", label: "LinkedIn", icon: "linkedin" },
  { value: "mastodon", label: "Mastodon", icon: "mastodon" },
  { value: "threads", label: "Threads", icon: "threads" },
  { value: "instagram", label: "Instagram", icon: "instagram" },
  { value: "youtube", label: "YouTube", icon: "youtube" },
  { value: "discord", label: "Discord", icon: "discord" },
  { value: "telegram", label: "Telegram", icon: "telegram" },
  { value: "medium", label: "Medium", icon: "medium" },
  { value: "dribbble", label: "Dribbble", icon: "dribbble" },
  { value: "codepen", label: "CodePen", icon: "codepen" },
  { value: "email", label: "Email", icon: "mail" },
  { value: "link", label: "Website", icon: "link" },
];

const FALLBACK = SOCIAL_PLATFORMS[SOCIAL_PLATFORMS.length - 1];

export function socialPlatform(value: string): SocialPlatformInfo {
  return SOCIAL_PLATFORMS.find((p) => p.value === value) ?? FALLBACK;
}

export function isSocialPlatform(value: unknown): value is SocialPlatform {
  return SOCIAL_PLATFORMS.some((p) => p.value === value);
}
