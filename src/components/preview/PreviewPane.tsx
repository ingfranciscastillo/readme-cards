import { ZoomIn, ZoomOut } from "iconoir-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PreviewBackground } from "../../state/store";
import { CardSvg } from "../CardSvg";
import { IconButton } from "../ui/Button";
import { Segmented } from "../ui/fields";

const ZOOM_STEPS = [0.25, 0.33, 0.5, 0.67, 0.75, 1, 1.25, 1.5, 2, 3];
const FRAME_PADDING = 48;

const BACKGROUNDS: Record<PreviewBackground, string> = {
  checker: "checkerboard",
  light: "bg-white",
  dark: "bg-[#0d1117]",
};

export function PreviewPane({
  markup,
  width,
  height,
  background,
  onBackground,
}: {
  markup: string;
  width: number;
  height: number;
  background: PreviewBackground;
  onBackground: (bg: PreviewBackground) => void;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [available, setAvailable] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      setAvailable({ w, h });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // "Fit" never enlarges past 100%, so small cards stay crisp and true to size.
  const fitZoom =
    available.w > 0
      ? Math.min(
          1,
          (available.w - FRAME_PADDING) / width,
          available.h > 0 ? (available.h - FRAME_PADDING) / height : 1,
        )
      : 1;
  const scale = Math.max(0.1, fit ? fitZoom : zoom);

  useEffect(() => {
    if (fit) setZoom(Math.round(fitZoom * 100) / 100);
  }, [fit, fitZoom]);

  const step = (dir: 1 | -1) => {
    const current = scale;
    const next =
      dir > 0
        ? (ZOOM_STEPS.find((z) => z > current + 0.001) ?? ZOOM_STEPS[ZOOM_STEPS.length - 1])
        : ([...ZOOM_STEPS].reverse().find((z) => z < current - 0.001) ?? ZOOM_STEPS[0]);
    setFit(false);
    setZoom(next);
  };

  // No min-h-0 on the section: below xl the export panel shares this column,
  // so the preview must not shrink below its own content.
  return (
    <section aria-label="Live preview" className="flex flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2">
        <fieldset className="m-0 flex items-center gap-1 border-0 p-0">
          <legend className="sr-only">Zoom</legend>
          <IconButton label="Zoom out" onClick={() => step(-1)} disabled={scale <= ZOOM_STEPS[0]}>
            <ZoomOut width={15} height={15} aria-hidden />
          </IconButton>
          <output
            aria-live="polite"
            aria-label="Zoom level"
            className="w-12 text-center font-mono text-[11.5px] text-ink-2 tabular-nums"
          >
            {Math.round(scale * 100)}%
          </output>
          <IconButton
            label="Zoom in"
            onClick={() => step(1)}
            disabled={scale >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
          >
            <ZoomIn width={15} height={15} aria-hidden />
          </IconButton>
          <span className="mx-1 h-4 w-px bg-line" />
          <button
            type="button"
            aria-pressed={fit}
            onClick={() => setFit(true)}
            className={`h-7 rounded-[var(--radius-control)] px-2 text-[12px] ${fit ? "bg-paper-3 text-ink" : "text-ink-2 hover:bg-paper-3"}`}
          >
            Fit
          </button>
          <button
            type="button"
            aria-pressed={!fit && zoom === 1}
            onClick={() => {
              setFit(false);
              setZoom(1);
            }}
            className={`h-7 rounded-[var(--radius-control)] px-2 font-mono text-[11.5px] ${!fit && zoom === 1 ? "bg-paper-3 text-ink" : "text-ink-2 hover:bg-paper-3"}`}
          >
            1:1
          </button>
        </fieldset>
        <div className="w-[230px]">
          <Segmented<PreviewBackground>
            label="Preview background"
            hideLabel
            size="sm"
            value={background}
            onChange={onBackground}
            options={[
              { value: "checker", label: "Transparent" },
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
        </div>
      </div>
      <div
        ref={viewport}
        className={`relative min-h-[260px] flex-1 overflow-auto transition-colors ${BACKGROUNDS[background]}`}
      >
        <div
          className="flex min-h-full min-w-full items-center justify-center p-6"
          style={{ width: "max-content" }}
        >
          <CardSvg
            markup={markup}
            width={Math.round(width * scale)}
            height={Math.round(height * scale)}
            className="shrink-0"
          />
        </div>
      </div>
      <p className="border-t border-line px-4 py-1.5 font-mono text-[10.5px] text-ink-3">
        {background === "checker"
          ? "Checkerboard marks transparent areas."
          : background === "dark"
            ? "Approximates a README in GitHub's dark theme."
            : "Approximates a README in GitHub's light theme."}
      </p>
    </section>
  );
}
