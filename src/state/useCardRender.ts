import { useCallback, useEffect, useMemo, useState } from "react";
import { byteSize } from "../lib/export/download";
import type { FontFaceUse } from "../lib/fonts";
import { toSvgDocument } from "../lib/svg/document";
import { buildFontCss, prefetchFonts } from "../lib/svg/fontEmbed";
import { type ValidationResult, validateSvg } from "../lib/svg/validate";
import { renderCard } from "../templates";
import type { CardConfig, CardTemplate, RenderedCard } from "../types/card";
import { requestFaces, retryFaces } from "./useFontsVersion";

export const PREVIEW_ID_PREFIX = "rc";

export function useRenderedCard(
  template: CardTemplate<unknown>,
  config: CardConfig<unknown>,
  fontsVersion: number,
  scheme: "light" | "dark" = "light",
): { card: RenderedCard; markup: string } {
  const rendered = useMemo(() => {
    // fontsVersion invalidates measurements taken before fonts loaded.
    void fontsVersion;
    const card = renderCard(template, config, { idPrefix: PREVIEW_ID_PREFIX });
    return { card, markup: toSvgDocument(card, { idPrefix: PREVIEW_ID_PREFIX, scheme }) };
  }, [template, config, fontsVersion, scheme]);
  useEffect(() => requestFaces(rendered.card.faces), [rendered.card.faces]);
  return rendered;
}

export interface ExportState {
  status: "building" | "ready" | "error";
  source: string;
  bytes: number;
  validation: ValidationResult;
  /** Faces that are not embedded and will fall back to the viewer's fonts. */
  systemFaces: FontFaceUse[];
  error?: string;
  /** Build again, e.g. after a failed font download. */
  retry: () => void;
}

/** A readable reason for a failed font download. */
function fontErrorMessage(err: Error): string {
  // Browsers word network failures differently ("Failed to fetch", "Load
  // failed", "NetworkError…") but all raise a TypeError.
  if (err instanceof TypeError) {
    return "Couldn't download the fonts to embed, so this file uses fallback fonts. Check your connection and try again.";
  }
  return `Fonts could not be embedded (${err.message}). This file uses fallback fonts.`;
}

/**
 * The exported document: the preview's card plus embedded fonts. Built in an
 * effect so clipboard writes can happen synchronously on click.
 */
export function useExportedSvg(card: RenderedCard, embedFonts: boolean): ExportState {
  const [attempt, setAttempt] = useState(0);
  // Retrying also re-requests the preview's faces, so the preview measures
  // with the same fonts the export embeds.
  const retry = useCallback(() => {
    retryFaces(card.faces);
    setAttempt((n) => n + 1);
  }, [card.faces]);
  const plain = useMemo(
    () => toSvgDocument(card, { idPrefix: PREVIEW_ID_PREFIX, scheme: "auto" }),
    [card],
  );
  const [state, setState] = useState<Omit<ExportState, "retry">>(() => ({
    status: "building",
    source: plain,
    bytes: byteSize(plain),
    validation: { valid: true, issues: [] },
    systemFaces: [],
  }));

  useEffect(() => {
    // attempt: a retry rebuilds the same card.
    void attempt;
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
          finish(
            toSvgDocument(card, { idPrefix: PREVIEW_ID_PREFIX, fontCss: css, scheme: "auto" }),
            system,
          ),
        )
        .catch((err: Error) => finish(plain, card.faces, fontErrorMessage(err)));
    }, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [card, plain, embedFonts, attempt]);

  // Downloads that failed offline usually succeed once the connection is back.
  useEffect(() => {
    if (state.status !== "error") return;
    window.addEventListener("online", retry);
    return () => window.removeEventListener("online", retry);
  }, [state.status, retry]);

  useEffect(() => {
    if (embedFonts) prefetchFonts(card.faces);
  }, [card.faces, embedFonts]);

  return useMemo(() => ({ ...state, retry }), [state, retry]);
}
