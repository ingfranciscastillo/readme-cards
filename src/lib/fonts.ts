import geistMono400 from "@fontsource/geist-mono/files/geist-mono-latin-400-normal.woff2?url";
import geistMono500 from "@fontsource/geist-mono/files/geist-mono-latin-500-normal.woff2?url";
import geistMono700 from "@fontsource/geist-mono/files/geist-mono-latin-700-normal.woff2?url";
import geist400 from "@fontsource/geist-sans/files/geist-sans-latin-400-normal.woff2?url";
import geist500 from "@fontsource/geist-sans/files/geist-sans-latin-500-normal.woff2?url";
import geist600 from "@fontsource/geist-sans/files/geist-sans-latin-600-normal.woff2?url";
import geist700 from "@fontsource/geist-sans/files/geist-sans-latin-700-normal.woff2?url";
import serif400Italic from "@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2?url";
import serif400 from "@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2?url";
import type { FontId } from "../types/card";

export interface FontDefinition {
  id: FontId;
  label: string;
  /** Family name registered by Fontsource (and by the embedded @font-face). */
  family: string | null;
  /** Full CSS stack written into the SVG. */
  stack: string;
  weights: number[];
  italic: boolean;
  /** woff2 files keyed by `${weight}` or `${weight}italic`; empty for system fonts. */
  files: Record<string, string>;
  kind: "sans" | "serif" | "mono";
}

export const FONTS: Record<FontId, FontDefinition> = {
  geist: {
    id: "geist",
    label: "Geist Sans",
    family: "Geist Sans",
    stack: "'Geist Sans', ui-sans-serif, system-ui, sans-serif",
    weights: [400, 500, 600, 700],
    italic: false,
    files: { "400": geist400, "500": geist500, "600": geist600, "700": geist700 },
    kind: "sans",
  },
  "geist-mono": {
    id: "geist-mono",
    label: "Geist Mono",
    family: "Geist Mono",
    stack: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    weights: [400, 500, 700],
    italic: false,
    files: { "400": geistMono400, "500": geistMono500, "700": geistMono700 },
    kind: "mono",
  },
  "instrument-serif": {
    id: "instrument-serif",
    label: "Instrument Serif",
    family: "Instrument Serif",
    stack: "'Instrument Serif', Georgia, 'Times New Roman', serif",
    weights: [400],
    italic: true,
    files: { "400": serif400, "400italic": serif400Italic },
    kind: "serif",
  },
  "system-sans": {
    id: "system-sans",
    label: "System sans",
    family: null,
    stack:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif",
    weights: [400, 500, 600, 700],
    italic: true,
    files: {},
    kind: "sans",
  },
  "system-serif": {
    id: "system-serif",
    label: "System serif",
    family: null,
    stack: "Georgia, 'Times New Roman', Times, serif",
    weights: [400, 700],
    italic: true,
    files: {},
    kind: "serif",
  },
  "system-mono": {
    id: "system-mono",
    label: "System mono",
    family: null,
    stack: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
    weights: [400, 700],
    italic: false,
    files: {},
    kind: "mono",
  },
};

export const FONT_OPTIONS = Object.values(FONTS).map((f) => ({ value: f.id, label: f.label }));

export function isFontId(value: unknown): value is FontId {
  return typeof value === "string" && value in FONTS;
}

/** The closest weight the font actually ships, so measuring and rendering agree. */
export function resolveWeight(font: FontId, weight: number): number {
  const { weights } = FONTS[font];
  let best = weights[0];
  for (const w of weights) {
    if (Math.abs(w - weight) < Math.abs(best - weight)) best = w;
  }
  return best;
}

export function resolveItalic(font: FontId, italic: boolean | undefined): boolean {
  return Boolean(italic) && FONTS[font].italic;
}

/** A specific face a card uses; embedded fonts are collected from these. */
export interface FontFaceUse {
  font: FontId;
  weight: number;
  italic: boolean;
}

export function faceKey(face: FontFaceUse): string {
  return `${face.font}:${face.weight}:${face.italic ? "i" : "n"}`;
}

export function faceFile(face: FontFaceUse): string | undefined {
  return FONTS[face.font].files[`${face.weight}${face.italic ? "italic" : ""}`];
}

/**
 * Wait until every bundled face is loaded so canvas text measurement matches
 * what the SVG will render. Resolves even if a face fails to load.
 */
export async function loadAllFonts(): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  const loads: Promise<unknown>[] = [];
  for (const def of Object.values(FONTS)) {
    if (!def.family) continue;
    for (const key of Object.keys(def.files)) {
      const italic = key.endsWith("italic");
      const weight = Number.parseInt(key, 10);
      loads.push(
        document.fonts
          .load(`${italic ? "italic " : ""}${weight} 16px '${def.family}'`, "Aa")
          .catch(() => undefined),
      );
    }
  }
  await Promise.all(loads);
}
