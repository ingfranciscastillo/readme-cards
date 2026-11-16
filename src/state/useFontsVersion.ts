import { useSyncExternalStore } from "react";
import { type FontFaceUse, faceKey, loadFace } from "../lib/fonts";
import { clearMeasureCache } from "../lib/svg/text";

// Fonts load on demand: a card asks for the faces it uses, and once they
// arrive every card re-measures its text with the real metrics.
let version = 0;
const listeners = new Set<() => void>();
const requested = new Set<string>();
const failed = new Set<string>();
let pending: ReturnType<typeof setTimeout> | undefined;

/**
 * Cards ask for their faces separately and the files arrive one by one;
 * coalesce the arrivals so every card re-measures once, not once per batch.
 */
function scheduleBump() {
  if (pending !== undefined) return;
  pending = setTimeout(() => {
    pending = undefined;
    clearMeasureCache();
    version += 1;
    for (const listener of listeners) listener();
  }, 50);
}

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
    results.forEach((ok, i) => {
      if (!ok) failed.add(faceKey(fresh[i]));
    });
    if (results.some(Boolean)) scheduleBump();
  });
}

/** Ask again for faces whose download failed, e.g. once the network is back. */
export function retryFaces(faces: FontFaceUse[]): void {
  for (const face of faces) {
    const key = faceKey(face);
    if (failed.delete(key)) requested.delete(key);
  }
  requestFaces(faces);
}

/** Changes whenever newly loaded fonts make earlier text measurements stale. */
export function useFontsVersion(): number {
  return useSyncExternalStore(subscribe, () => version);
}
