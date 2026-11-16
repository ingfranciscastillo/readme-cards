import type { FontFaceUse } from "../lib/fonts";
import type { SafeSvg } from "../lib/svg/markup";

export type FontId =
  | "geist"
  | "inter"
  | "ibm-plex-sans"
  | "dm-sans"
  | "manrope"
  | "space-grotesk"
  | "bricolage-grotesque"
  | "instrument-serif"
  | "fraunces"
  | "playfair-display"
  | "source-serif-4"
  | "lora"
  | "geist-mono"
  | "jetbrains-mono"
  | "ibm-plex-mono"
  | "fira-code"
  | "space-mono"
  | "system-sans"
  | "system-serif"
  | "system-mono";

export type Align = "left" | "center" | "right";

export type CategoryId = "profile" | "repository" | "developer" | "creative";

export type TemplateId =
  | "profile"
  | "banner"
  | "contact"
  | "now"
  | "repository"
  | "install"
  | "stack"
  | "languages"
  | "quote";

/** Appearance, typography and layout settings shared by every template. */
export interface CardStyle {
  // Appearance
  background: string;
  transparent: boolean;
  text: string;
  accent: string;
  border: string;
  showBorder: boolean;
  borderWidth: number;
  radius: number;
  // Dark mode: colours shown when the viewer's theme is dark.
  darkMode: boolean;
  darkBackground: string;
  darkText: string;
  darkAccent: string;
  darkBorder: string;
  // Typography
  displayFont: FontId;
  bodyFont: FontId;
  fontSize: number;
  titleWeight: number;
  lineHeight: number;
  // Layout
  width: number;
  height: number;
  autoHeight: boolean;
  padding: number;
  align: Align;
  gap: number;
  showDivider: boolean;
}

export interface CardConfig<C> {
  variant: string;
  content: C;
  style: CardStyle;
}

export interface RenderOptions {
  /** Prefix for ids (clip paths, title) so several inline SVGs can share a page. */
  idPrefix: string;
}

/** A rendered card body, before it is wrapped into a standalone document. */
export interface RenderedCard {
  width: number;
  height: number;
  title: string;
  description: string;
  defs: SafeSvg;
  body: SafeSvg;
  faces: FontFaceUse[];
  /** Light-to-dark colour pairs for dark mode; empty when it is off. */
  darkColors: [string, string][];
  /** True when a fixed height is too small and content is clipped. */
  overflow: boolean;
}

export interface TemplateVariant {
  value: string;
  label: string;
}

/**
 * A card template: typed defaults plus a pure, deterministic render function.
 * Rendering returns SVG markup rather than React nodes so that the exact
 * same string is shown in the preview and written to the exported file.
 */
export interface CardTemplate<C> {
  id: TemplateId;
  name: string;
  category: CategoryId;
  description: string;
  defaultFilename: string;
  variants: TemplateVariant[];
  defaultConfig: CardConfig<C>;
  /** Short alt text used in the generated Markdown snippet. */
  altText(config: CardConfig<C>): string;
  render(config: CardConfig<C>, options: RenderOptions): RenderedCard;
}

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "repository", label: "Repository" },
  { id: "developer", label: "Developer" },
  { id: "creative", label: "Creative" },
];
