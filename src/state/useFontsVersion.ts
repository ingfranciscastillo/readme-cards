import { useSyncExternalStore } from "react";
import { type FontFaceUse, faceKey, loadFace } from "../lib/fonts";
import { clearMeasureCache } from "../lib/svg/text";

// Fonts load on demand: a card asks for the faces it uses, and once they
// arrive every card re-measures its text with the real metrics.
let version = 0;
const listeners = new Set<() => void>();
const requested = new Set<string>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Download any of these faces not requested yet, then re-render cards. */
export function requestFaces(faces: FontFaceUse[]): void {
  const fresh = faces.filter((face) => !requested.has(faceKey(face)));
  if (fresh.length === 0) return;
  for (const face of fresh) requested.add(faceKey(face));
  // Each face is asked for once per session; a failed download falls back to
  // the stack's next font instead of retrying on every render.
  Promise.all(fresh.map(loadFace)).then((results) => {
    if (!results.some(Boolean)) return;
    clearMeasureCache();
    version += 1;
    for (const listener of listeners) listener();
  });
}

/** Changes whenever newly loaded fonts make earlier text measurements stale. */
export function useFontsVersion(): number {
  return useSyncExternalStore(subscribe, () => version);
}
