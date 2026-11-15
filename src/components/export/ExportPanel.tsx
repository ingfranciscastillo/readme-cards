import { Check, Code, Copy, Download, WarningTriangle } from "iconoir-react";
import { useEffect, useId, useRef, useState } from "react";
import { copyText } from "../../lib/export/clipboard";
import { downloadSvg, formatBytes, sanitizeFilename } from "../../lib/export/download";
import { htmlSnippet, markdownSnippet } from "../../lib/export/snippets";
import { FONTS } from "../../lib/fonts";
import type { ExportState } from "../../state/useCardRender";
import { Button } from "../ui/Button";
import { Segmented, Toggle } from "../ui/fields";

type Feedback = { key: string; ok: boolean; message: string } | null;

export function ExportPanel({
  exported,
  width,
  height,
  filename,
  defaultFilename,
  onFilename,
  altText,
  embedFonts,
  onEmbedFonts,
  adaptive,
}: {
  exported: ExportState;
  width: number;
  height: number;
  filename: string;
  defaultFilename: string;
  onFilename: (name: string) => void;
  altText: string;
  embedFonts: boolean;
  onEmbedFonts: (embed: boolean) => void;
  /** The card carries dark-mode colours. */
  adaptive: boolean;
}) {
  const id = useId();
  const [snippetKind, setSnippetKind] = useState<"markdown" | "html">("markdown");
  const [showSource, setShowSource] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const file = sanitizeFilename(filename, defaultFilename);
  const snippet =
    snippetKind === "markdown" ? markdownSnippet(altText, file) : htmlSnippet(altText, file, width);
  const ready = exported.status !== "building";
  const blocked = !exported.validation.valid;

  const flash = (key: string, ok: boolean, message: string) => {
    window.clearTimeout(timer.current);
    setFeedback({ key, ok, message });
    timer.current = window.setTimeout(() => setFeedback(null), 2200);
  };

  const copy = async (key: string, text: string, what: string) => {
    try {
      await copyText(text);
      flash(key, true, `${what} copied to the clipboard.`);
    } catch (error) {
      flash(key, false, (error as Error).message || "Copy failed.");
    }
  };

  const systemFonts = [...new Set(exported.systemFaces.map((f) => FONTS[f.font].label))];

  return (
    <section aria-labelledby={`${id}-title`} className="flex flex-col">
      <div className="flex items-baseline justify-between border-b border-line px-5 py-3">
        <h2 id={`${id}-title`} className="font-serif text-[22px] leading-none">
          Export
        </h2>
        <span className="font-mono text-[11px] text-ink-3 tabular-nums">
          {width} × {height} px · {ready ? formatBytes(exported.bytes) : "…"}
        </span>
      </div>

      <div className="flex flex-col gap-4 px-5 py-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-file`} className="text-[12px] font-medium text-ink-2">
            Filename
          </label>
          <div className="flex items-center rounded-[var(--radius-control)] border border-control bg-white/80 focus-within:border-accent">
            <input
              id={`${id}-file`}
              className="h-8 min-w-0 flex-1 bg-transparent px-2.5 font-mono text-[12px] outline-none"
              value={filename}
              placeholder={defaultFilename}
              maxLength={80}
              spellCheck={false}
              onChange={(e) => onFilename(e.target.value)}
              onBlur={() => onFilename(file.replace(/\.svg$/, ""))}
            />
            <span className="pr-2.5 font-mono text-[12px] text-ink-3">.svg</span>
          </div>
        </div>

        <Toggle
          label="Embed fonts"
          checked={embedFonts}
          onChange={onEmbedFonts}
          description={
            embedFonts
              ? "Typography survives GitHub's image proxy. Adds roughly 15–45 KB per face."
              : "Smaller file; viewers without these fonts see fallbacks and text may overflow."
          }
        />
        {systemFonts.length > 0 && embedFonts ? (
          <p className="-mt-2 text-[11.5px] text-ink-3">
            {systemFonts.join(", ")}{" "}
            {systemFonts.length === 1 ? "is a system font" : "are system fonts"} and can't be
            embedded.
          </p>
        ) : null}
        {adaptive ? (
          <p className="-mt-2 text-[11.5px] text-ink-3">
            Includes dark colours: one file follows the viewer's light or dark theme.
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="primary"
            className="col-span-2"
            icon={<Download width={15} height={15} aria-hidden />}
            disabled={!ready || blocked}
            onClick={() => {
              downloadSvg(exported.source, file);
              flash("download", true, `Downloaded ${file}.`);
            }}
          >
            {exported.status === "building" ? "Preparing…" : `Download ${file}`}
          </Button>
          <Button
            icon={
              feedback?.key === "svg" && feedback.ok ? (
                <Check width={14} height={14} aria-hidden />
              ) : (
                <Copy width={14} height={14} aria-hidden />
              )
            }
            disabled={!ready || blocked}
            onClick={() => copy("svg", exported.source, "SVG source")}
          >
            {feedback?.key === "svg" && feedback.ok ? "Copied" : "Copy SVG"}
          </Button>
          <Button
            icon={<Code width={14} height={14} aria-hidden />}
            aria-expanded={showSource}
            aria-controls={`${id}-source`}
            onClick={() => setShowSource((v) => !v)}
          >
            {showSource ? "Hide source" : "View source"}
          </Button>
        </div>

        <p aria-live="polite" className="min-h-[1.25em] text-[11.5px]">
          {feedback ? (
            <span className={feedback.ok ? "text-accent" : "text-danger"}>{feedback.message}</span>
          ) : exported.error ? (
            <span className="text-danger">{exported.error}</span>
          ) : blocked ? (
            <span className="flex gap-1.5 text-danger">
              <WarningTriangle width={13} height={13} className="mt-px shrink-0" aria-hidden />
              {exported.validation.issues.join(" ")}
            </span>
          ) : ready ? (
            <span className="text-ink-3">Valid standalone SVG · no external requests.</span>
          ) : null}
        </p>

        {showSource ? (
          <div id={`${id}-source`} className="flex flex-col gap-1.5">
            <span className="eyebrow">Raw SVG</span>
            <textarea
              readOnly
              aria-label="SVG source"
              rows={10}
              spellCheck={false}
              className="h-64 resize-y rounded-[var(--radius-control)] border border-control bg-white/80 p-2.5 font-mono text-[10.5px] leading-relaxed break-all text-ink-2 focus:border-accent focus:outline-none"
              value={
                exported.source.length > 60000
                  ? `${exported.source.slice(0, 60000)}\n\n… ${formatBytes(exported.bytes)} total. Copy or download for the full file.`
                  : exported.source
              }
            />
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 border-t border-line px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <span className="eyebrow">Use in a README</span>
          <div className="w-[150px]">
            <Segmented
              label="Snippet format"
              hideLabel
              size="sm"
              value={snippetKind}
              onChange={setSnippetKind}
              options={[
                { value: "markdown", label: "Markdown" },
                { value: "html", label: "HTML" },
              ]}
            />
          </div>
        </div>
        <code className="block rounded-[var(--radius-control)] border border-line bg-white/70 px-2.5 py-2 font-mono text-[11.5px] break-all text-ink">
          {snippet}
        </code>
        <Button
          icon={
            feedback?.key === "snippet" && feedback.ok ? (
              <Check width={14} height={14} aria-hidden />
            ) : (
              <Copy width={14} height={14} aria-hidden />
            )
          }
          onClick={() =>
            copy(
              "snippet",
              snippet,
              snippetKind === "markdown" ? "Markdown snippet" : "HTML snippet",
            )
          }
        >
          {feedback?.key === "snippet" && feedback.ok
            ? "Copied"
            : `Copy ${snippetKind === "markdown" ? "Markdown" : "HTML"}`}
        </Button>
        <p className="text-[11.5px] leading-snug text-ink-3">
          The path is relative. Commit <span className="font-mono text-ink-2">{file}</span> next to
          your README.md (or adjust the path) — nothing is hosted for you.
        </p>
      </div>
    </section>
  );
}
