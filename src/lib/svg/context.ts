import type { Align, CardStyle } from "../../types/card";
import { FONTS, type FontFaceUse, faceKey } from "../fonts";
import { type SafeSvg, svg } from "./markup";
import { type ResolvedTextStyle, resolveStyle, type TextStyle } from "./text";

export type Anchor = "start" | "middle" | "end";

export const ANCHOR: Record<Align, Anchor> = { left: "start", center: "middle", right: "end" };

/**
 * Per-render state: collects the font faces the card uses (so export can embed
 * exactly those) and namespaces element ids.
 */
export class RenderContext {
  readonly idPrefix: string;
  readonly style: CardStyle;
  private readonly faces = new Map<string, FontFaceUse>();
  private readonly defs: SafeSvg[] = [];

  constructor(idPrefix: string, style: CardStyle) {
    this.idPrefix = idPrefix;
    this.style = style;
  }

  id(name: string): string {
    return `${this.idPrefix}-${name}`;
  }

  addDef(def: SafeSvg): void {
    this.defs.push(def);
  }

  getDefs(): SafeSvg {
    return svg`${this.defs}`;
  }

  registerFont(style: TextStyle): ResolvedTextStyle {
    const resolved = resolveStyle(style);
    const face = { font: resolved.font, weight: resolved.weight, italic: resolved.italic };
    this.faces.set(faceKey(face), face);
    return resolved;
  }

  getFaces(): FontFaceUse[] {
    return [...this.faces.values()].sort((a, b) => faceKey(a).localeCompare(faceKey(b)));
  }

  /** Text x coordinate for the content box, honouring the alignment setting. */
  alignX(left: number, width: number, align: Align = this.style.align): number {
    if (align === "center") return left + width / 2;
    if (align === "right") return left + width;
    return left;
  }
}

export interface TextLinesOptions {
  x: number;
  /** Top of the first line box. */
  top: number;
  lines: string[];
  style: TextStyle;
  lineHeight: number;
  fill: string;
  opacity?: number;
  anchor?: Anchor;
}

/** Render pre-wrapped lines as one <text> element with a <tspan> per line. */
export function textLines(ctx: RenderContext, o: TextLinesOptions): SafeSvg {
  if (o.lines.length === 0) return svg``;
  const s = ctx.registerFont(o.style);
  const first = o.top + (o.lineHeight - s.size) / 2 + s.size * 0.8;
  const spans = o.lines.map(
    (line, i) => svg`<tspan x="${o.x}" y="${first + i * o.lineHeight}">${line}</tspan>`,
  );
  return svg`<text${fontAttrs(s)} fill="${o.fill}"${opacityAttr(o.opacity)} text-anchor="${o.anchor ?? "start"}">${spans}</text>`;
}

export function fontAttrs(s: ResolvedTextStyle): SafeSvg {
  return svg` font-family="${FONTS[s.font].stack}" font-size="${s.size}" font-weight="${s.weight}"${
    s.italic ? svg` font-style="italic"` : ""
  }${s.tracking ? svg` letter-spacing="${s.tracking}"` : ""}`;
}

export function opacityAttr(opacity: number | undefined): SafeSvg {
  return opacity === undefined || opacity >= 1 ? svg`` : svg` fill-opacity="${opacity}"`;
}

/** Text helpers shared by all templates, derived from the card style. */
export function typeScale(style: CardStyle) {
  const serifDisplay = FONTS[style.displayFont].kind === "serif";
  const base = style.fontSize;
  return {
    base,
    title: Math.round(base * (serifDisplay ? 1.95 : 1.6)),
    small: Math.round(base * 0.88 * 10) / 10,
    eyebrow: Math.round(base * 0.76 * 10) / 10,
    lineHeight: Math.round(base * style.lineHeight * 10) / 10,
    muted: 0.64,
  };
}
