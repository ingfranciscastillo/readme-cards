import type { FontId } from "../../types/card";
import { FONTS, resolveItalic, resolveWeight } from "../fonts";

export interface TextStyle {
  font: FontId;
  size: number;
  weight?: number;
  italic?: boolean;
  /** Letter spacing in px. */
  tracking?: number;
}

export interface ResolvedTextStyle {
  font: FontId;
  size: number;
  weight: number;
  italic: boolean;
  tracking: number;
}

export function resolveStyle(style: TextStyle): ResolvedTextStyle {
  return {
    font: style.font,
    size: style.size,
    weight: resolveWeight(style.font, style.weight ?? 400),
    italic: resolveItalic(style.font, style.italic),
    tracking: style.tracking ?? 0,
  };
}

let context: CanvasRenderingContext2D | null | undefined;
let contextFont = "";
const cache = new Map<string, number>();

function getContext(): CanvasRenderingContext2D | null {
  if (context !== undefined) return context;
  context =
    typeof document === "undefined" ? null : document.createElement("canvas").getContext("2d");
  return context;
}

/** Fonts loaded after a measurement was cached would leave stale widths. */
export function clearMeasureCache(): void {
  cache.clear();
}

export function measureText(text: string, style: TextStyle): number {
  if (!text) return 0;
  const s = resolveStyle(style);
  const key = `${s.font}|${s.size}|${s.weight}|${s.italic}|${s.tracking}|${text}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const ctx = getContext();
  let width: number;
  if (ctx) {
    // Assigning ctx.font re-parses the CSS font string, which dominates the
    // cost of measuring; consecutive calls usually share a style.
    const font = `${s.italic ? "italic " : ""}${s.weight} ${s.size}px ${FONTS[s.font].stack}`;
    if (font !== contextFont) {
      ctx.font = font;
      contextFont = font;
    }
    width = ctx.measureText(text).width;
  } else {
    // Deterministic fallback for non-browser environments.
    const factor = FONTS[s.font].kind === "mono" ? 0.6 : 0.52;
    width = text.length * s.size * factor;
  }
  width += s.tracking * Math.max(0, [...text].length - 1);
  cache.set(key, width);
  return width;
}

const ELLIPSIS = "…";

/** Shorten a single line with an ellipsis until it fits. */
export function truncate(text: string, style: TextStyle, maxWidth: number): string {
  if (measureText(text, style) <= maxWidth) return text;
  const chars = [...text];
  let lo = 0;
  let hi = chars.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    const candidate = `${chars.slice(0, mid).join("").trimEnd()}${ELLIPSIS}`;
    if (measureText(candidate, style) <= maxWidth) lo = mid;
    else hi = mid - 1;
  }
  return lo === 0 ? ELLIPSIS : `${chars.slice(0, lo).join("").trimEnd()}${ELLIPSIS}`;
}

/** Split a word that is wider than the line on character boundaries. */
function breakWord(word: string, style: TextStyle, maxWidth: number): string[] {
  const parts: string[] = [];
  let current = "";
  for (const ch of word) {
    if (current && measureText(current + ch, style) > maxWidth) {
      parts.push(current);
      current = ch;
    } else {
      current += ch;
    }
  }
  if (current) parts.push(current);
  return parts;
}

/**
 * Greedy word wrap. Explicit newlines start new lines; when `maxLines` is
 * exceeded the last visible line is ellipsized.
 */
export function wrapText(
  text: string,
  style: TextStyle,
  maxWidth: number,
  maxLines = Number.POSITIVE_INFINITY,
): string[] {
  const lines: string[] = [];
  const width = Math.max(1, maxWidth);
  for (const paragraph of text.replace(/\r\n?/g, "\n").split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      if (paragraph.length === 0 && lines.length > 0) lines.push("");
      continue;
    }
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (measureText(candidate, style) <= width) {
        line = candidate;
        continue;
      }
      if (line) lines.push(line);
      if (measureText(word, style) > width) {
        const pieces = breakWord(word, style, width);
        lines.push(...pieces.slice(0, -1));
        line = pieces[pieces.length - 1] ?? "";
      } else {
        line = word;
      }
    }
    if (line) lines.push(line);
  }
  while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
  if (lines.length > maxLines) {
    const visible = lines.slice(0, maxLines);
    const last = visible[maxLines - 1];
    visible[maxLines - 1] = truncate(`${last}${ELLIPSIS}`, style, width);
    return visible;
  }
  return lines;
}

/**
 * Baseline for a line box whose top edge is `top`. Uses a fixed ascent ratio
 * instead of font metrics so output is deterministic across environments.
 */
export function baseline(top: number, lineHeight: number, size: number): number {
  return top + (lineHeight - size) / 2 + size * 0.8;
}

const COMPACT = [
  { limit: 1e9, suffix: "B" },
  { limit: 1e6, suffix: "M" },
  { limit: 1e3, suffix: "k" },
];

export function compactNumber(value: number): string {
  const n = Math.max(0, Math.round(value || 0));
  for (const { limit, suffix } of COMPACT) {
    if (n >= limit) {
      const scaled = n / limit;
      const digits = scaled >= 100 ? 0 : 1;
      return `${Number(scaled.toFixed(digits))}${suffix}`;
    }
  }
  return String(n);
}
