import type { RenderedCard } from "../../types/card";
import { escapeXml, num } from "./markup";

export interface DocumentOptions {
  idPrefix: string;
  /** Pre-built @font-face rules; omitted in the live preview where the page already has the fonts. */
  fontCss?: string;
}

/** Wrap a rendered card in a standalone, namespaced SVG document. */
export function toSvgDocument(card: RenderedCard, options: DocumentOptions): string {
  const w = num(card.width);
  const h = num(card.height);
  const titleId = `${options.idPrefix}-title`;
  const descId = `${options.idPrefix}-desc`;
  const desc = card.description.trim();
  const style = options.fontCss ? `<style>${options.fontCss}</style>` : "";
  const defs = style || card.defs.value ? `<defs>${style}${card.defs.value}</defs>` : "";
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img" aria-labelledby="${titleId}${desc ? ` ${descId}` : ""}">`,
    `<title id="${titleId}">${escapeXml(card.title)}</title>`,
    desc ? `<desc id="${descId}">${escapeXml(desc)}</desc>` : "",
    defs,
    card.body.value,
    "</svg>",
  ].join("");
}
