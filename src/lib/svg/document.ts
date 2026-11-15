import type { RenderedCard } from "../../types/card";
import { escapeXml, num } from "./markup";
import { darkModeRules } from "./theme";

export interface DocumentOptions {
  idPrefix: string;
  /** Pre-built @font-face rules; omitted in the live preview where the page already has the fonts. */
  fontCss?: string;
  /**
   * Which colours to show when the card has dark mode: "auto" follows the
   * viewer's theme (export), "light" or "dark" pins one (preview). Default "light".
   */
  scheme?: "auto" | "light" | "dark";
}

/** Wrap a rendered card in a standalone, namespaced SVG document. */
export function toSvgDocument(card: RenderedCard, options: DocumentOptions): string {
  const w = num(card.width);
  const h = num(card.height);
  const titleId = `${options.idPrefix}-title`;
  const descId = `${options.idPrefix}-desc`;
  const desc = card.description.trim();
  const scheme = options.scheme ?? "light";
  // Scoped to this card's root id: an inline preview shares the page's stylesheet.
  const rules = scheme === "light" ? "" : darkModeRules(card.darkColors, `#${options.idPrefix}`);
  const themeCss =
    rules && scheme === "auto" ? `@media (prefers-color-scheme:dark){${rules}}` : rules;
  const css = `${options.fontCss ?? ""}${themeCss}`;
  const style = css ? `<style>${css}</style>` : "";
  const defs = style || card.defs.value ? `<defs>${style}${card.defs.value}</defs>` : "";
  return [
    `<svg xmlns="http://www.w3.org/2000/svg"${themeCss ? ` id="${options.idPrefix}"` : ""} width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img" aria-labelledby="${titleId}${desc ? ` ${descId}` : ""}">`,
    `<title id="${titleId}">${escapeXml(card.title)}</title>`,
    desc ? `<desc id="${descId}">${escapeXml(desc)}</desc>` : "",
    defs,
    card.body.value,
    "</svg>",
  ].join("");
}
