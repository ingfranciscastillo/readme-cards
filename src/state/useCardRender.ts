import { useEffect, useMemo, useState } from "react";
import { byteSize } from "../lib/export/download";
import type { FontFaceUse } from "../lib/fonts";
import { toSvgDocument } from "../lib/svg/document";
import { buildFontCss, prefetchFonts } from "../lib/svg/fontEmbed";
import { type ValidationResult, validateSvg } from "../lib/svg/validate";
import type { CardConfig, CardTemplate, RenderedCard } from "../types/card";

export const PREVIEW_ID_PREFIX = "rc";

export function useRenderedCard(
  template: CardTemplate<unknown>,
  config: CardConfig<unknown>,
  fontsVersion: number,
): { card: RenderedCard; markup: string } {
  return useMemo(() => {
    // fontsVersion invalidates measurements taken before fonts loaded.
    void fontsVersion;
    const card = template.render(config, { idPrefix: PREVIEW_ID_PREFIX });
    return { card, markup: toSvgDocument(card, { idPrefix: PREVIEW_ID_PREFIX }) };
  }, [template, config, fontsVersion]);
}

export interface ExportState {
  status: "building" | "ready" | "error";
  source: string;
  bytes: number;
  validation: ValidationResult;
  /** Faces that are not embedded and will fall back to the viewer's fonts. */
  systemFaces: FontFaceUse[];
  error?: string;
}

/**
 * The exported document: the preview's card plus embedded fonts. Built in an
 * effect so clipboard writes can happen synchronously on click.
 */
export function useExportedSvg(card: RenderedCard, embedFonts: boolean): ExportState {
  const plain = useMemo(() => toSvgDocument(card, { idPrefix: PREVIEW_ID_PREFIX }), [card]);
  const [state, setState] = useState<ExportState>(() => ({
    status: "building",
    source: plain,
    bytes: byteSize(plain),
    validation: { valid: true, issues: [] },
    systemFaces: [],
  }));

  useEffect(() => {
    let cancelled = false;
    const finish = (source: string, systemFaces: FontFaceUse[], error?: string) => {
      if (cancelled) return;
      setState({
        status: error ? "error" : "ready",
        source,
        bytes: byteSize(source),
        validation: validateSvg(source),
        systemFaces,
        error,
      });
    };
    if (!embedFonts) {
      finish(plain, card.faces);
      return;
    }
    setState((prev) => ({ ...prev, status: "building" }));
    const timer = window.setTimeout(() => {
      buildFontCss(card.faces)
        .then(({ css, system }) =>
          finish(toSvgDocument(card, { idPrefix: PREVIEW_ID_PREFIX, fontCss: css }), system),
        )
        .catch((err: Error) =>
          finish(plain, card.faces, `Fonts could not be embedded (${err.message}).`),
        );
    }, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [card, plain, embedFonts]);

  useEffect(() => {
    if (embedFonts) prefetchFonts(card.faces);
  }, [card.faces, embedFonts]);

  return state;
}
