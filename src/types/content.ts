export type SocialPlatform =
  | "github"
  | "gitlab"
  | "x"
  | "linkedin"
  | "mastodon"
  | "threads"
  | "instagram"
  | "youtube"
  | "discord"
  | "telegram"
  | "medium"
  | "dribbble"
  | "codepen"
  | "email"
  | "link";

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  handle: string;
}

export type AvatarShape = "circle" | "rounded" | "square";

export interface ProfileContent {
  displayName: string;
  username: string;
  bio: string;
  location: string;
  website: string;
  showAvatar: boolean;
  /** A data: URI so the exported SVG never depends on a remote image. */
  avatar: string;
  avatarShape: AvatarShape;
  showUsername: boolean;
  showBio: boolean;
  showLocation: boolean;
  showWebsite: boolean;
  showSocials: boolean;
  socials: SocialLink[];
  showStats: boolean;
  followers: number;
  following: number;
  repos: number;
}

export interface RepositoryContent {
  owner: string;
  name: string;
  description: string;
  language: string;
  languageColor: string;
  stars: number;
  forks: number;
  license: string;
  showOwner: boolean;
  showDescription: boolean;
  showLanguage: boolean;
  showStars: boolean;
  showForks: boolean;
  showLicense: boolean;
}

export interface QuoteContent {
  quote: string;
  author: string;
  attribution: string;
  showAuthor: boolean;
  showAttribution: boolean;
  italic: boolean;
}

export interface StackContent {
  title: string;
  subtitle: string;
  showTitle: boolean;
  showSubtitle: boolean;
  /** One item per line or comma separated. */
  items: string;
}

export interface BannerContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** One item per line or comma separated. */
  tags: string;
  showEyebrow: boolean;
  showSubtitle: boolean;
  showTags: boolean;
}

export interface LanguageEntry {
  id: string;
  name: string;
  /** Any non-negative weight (bytes, repo count or a percentage); shares are computed from the total. */
  value: number;
  color: string;
}

export interface LanguagesContent {
  title: string;
  showTitle: boolean;
  showPercent: boolean;
  languages: LanguageEntry[];
}

export interface ContactContent {
  title: string;
  subtitle: string;
  showTitle: boolean;
  showSubtitle: boolean;
  showPlatform: boolean;
  links: SocialLink[];
}
