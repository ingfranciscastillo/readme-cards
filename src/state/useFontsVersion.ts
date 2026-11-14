import { useEffect, useState } from "react";
import { loadAllFonts } from "../lib/fonts";
import { clearMeasureCache } from "../lib/svg/text";

/**
 * Increments once bundled fonts finish loading, so cards re-measure their text
 * with the real metrics instead of fallback fonts.
 */
export function useFontsVersion(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    loadAllFonts().then(() => {
      if (!active) return;
      clearMeasureCache();
      setVersion((v) => v + 1);
    });
    return () => {
      active = false;
    };
  }, []);
  return version;
}
