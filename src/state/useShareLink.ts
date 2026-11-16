import { useCallback, useEffect, useRef, useState } from "react";
import { decodeShare, encodeShare, readSharePayload, shareUrl } from "../lib/share";
import { getTemplate } from "../templates";
import type { CardConfig, TemplateId } from "../types/card";
import type { Route } from "./store";

export type ShareNotice =
  | { kind: "loaded"; templateId: TemplateId; droppedImages: boolean }
  | {
      kind: "confirm";
      templateId: TemplateId;
      config: CardConfig<unknown>;
      droppedImages: boolean;
    }
  | { kind: "broken"; templateId: TemplateId };

/**
 * Apply a share link (`#/edit/<id>?c=...`) when the app opens on one. The
 * parameter is removed straight away, so a reload or later edits never
 * re-apply it. Saved edits to the same template are only replaced after the
 * person confirms.
 */
export function useIncomingShare(
  route: Route,
  configs: Partial<Record<TemplateId, CardConfig<unknown>>>,
  setConfig: (id: TemplateId, update: (c: CardConfig<unknown>) => CardConfig<unknown>) => void,
) {
  const [notice, setNotice] = useState<ShareNotice | null>(null);
  const configsRef = useRef(configs);
  configsRef.current = configs;

  useEffect(() => {
    if (route.view !== "editor") return;
    const payload = readSharePayload(window.location.hash);
    if (!payload) return;
    const { templateId } = route;
    history.replaceState(history.state, "", `#/edit/${templateId}`);
    void decodeShare(getTemplate(templateId), payload).then((shared) => {
      if (!shared) {
        setNotice({ kind: "broken", templateId });
        return;
      }
      const saved = configsRef.current[templateId];
      if (saved && JSON.stringify(saved) !== JSON.stringify(shared.config)) {
        setNotice({ kind: "confirm", templateId, ...shared });
        return;
      }
      setConfig(templateId, () => shared.config);
      setNotice({ kind: "loaded", templateId, droppedImages: shared.droppedImages });
    });
  }, [route, setConfig]);

  const accept = useCallback(() => {
    if (notice?.kind !== "confirm") return;
    setConfig(notice.templateId, () => notice.config);
    setNotice({
      kind: "loaded",
      templateId: notice.templateId,
      droppedImages: notice.droppedImages,
    });
  }, [notice, setConfig]);

  const dismiss = useCallback(() => setNotice(null), []);

  return { notice, accept, dismiss };
}

export interface ShareLink {
  url: string;
  droppedImages: boolean;
}

/**
 * The share link for the card being edited, kept up to date in the
 * background so copying it on click needs no await (Safari only allows
 * clipboard writes close to the click).
 */
export function useOutgoingShare(
  templateId: TemplateId,
  config: CardConfig<unknown>,
): ShareLink | null {
  const [link, setLink] = useState<ShareLink | null>(null);
  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      encodeShare(config)
        .then(({ payload, droppedImages }) => {
          if (!cancelled) {
            setLink({ url: shareUrl(templateId, payload, window.location.href), droppedImages });
          }
        })
        .catch(() => {
          if (!cancelled) setLink(null);
        });
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [templateId, config]);
  return link;
}
