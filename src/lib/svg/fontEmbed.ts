import { FONTS, type FontFaceUse, faceFile } from "../fonts";

const cache = new Map<string, Promise<string>>();

function toBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read font file"));
    reader.readAsDataURL(blob);
  });
}

function loadFont(url: string): Promise<string> {
  let pending = cache.get(url);
  if (!pending) {
    pending = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Font request failed (${res.status})`);
        return res.blob();
      })
      .then(toBase64);
    // Do not cache failures, so a later export can retry.
    pending.catch(() => cache.delete(url));
    cache.set(url, pending);
  }
  return pending;
}

export interface FontCssResult {
  css: string;
  embedded: FontFaceUse[];
  /** System fonts that cannot be embedded and will use the viewer's fonts. */
  system: FontFaceUse[];
}

/**
 * Build @font-face rules with the used faces inlined as base64 woff2, so the
 * SVG keeps its typography when GitHub serves it as an <img>. Only the Latin
 * subset is embedded to keep files small.
 */
export async function buildFontCss(faces: FontFaceUse[]): Promise<FontCssResult> {
  const embedded: FontFaceUse[] = [];
  const system: FontFaceUse[] = [];
  const rules = await Promise.all(
    faces.map(async (face) => {
      const def = FONTS[face.font];
      const url = faceFile(face);
      if (!def.family || !url) {
        system.push(face);
        return "";
      }
      const data = await loadFont(url);
      embedded.push(face);
      return `@font-face{font-family:'${def.family}';font-style:${face.italic ? "italic" : "normal"};font-weight:${face.weight};src:url(data:font/woff2;base64,${data}) format('woff2');}`;
    }),
  );
  return { css: rules.join(""), embedded, system };
}

/** Warm the cache so the first export does not wait on the network. */
export function prefetchFonts(faces: FontFaceUse[]): void {
  for (const face of faces) {
    const url = faceFile(face);
    if (url) loadFont(url).catch(() => undefined);
  }
}
