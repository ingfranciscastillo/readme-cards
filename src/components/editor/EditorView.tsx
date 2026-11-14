import { Download, NavArrowLeft, Undo } from "iconoir-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AppState, PreviewBackground } from "../../state/store";
import { useExportedSvg, useRenderedCard } from "../../state/useCardRender";
import { useMediaQuery } from "../../state/useMediaQuery";
import { getTemplate } from "../../templates";
import type { CardConfig, CardStyle, TemplateId } from "../../types/card";
import { CATEGORIES } from "../../types/card";
import { ExportPanel } from "../export/ExportPanel";
import { PreviewPane } from "../preview/PreviewPane";
import { Button } from "../ui/Button";
import { Wordmark } from "../Wordmark";
import { AppearancePanel } from "./AppearancePanel";
import { ContentEditor } from "./content/ContentEditor";
import { type EditorTab, EditorTabs } from "./EditorTabs";
import { LayoutPanel } from "./LayoutPanel";
import { TypographyPanel } from "./TypographyPanel";

export function EditorView({
  templateId,
  config,
  state,
  fontsVersion,
  saveError,
  onBack,
  setConfig,
  resetConfig,
  setFilename,
  setEmbedFonts,
  setPreviewBackground,
}: {
  templateId: TemplateId;
  config: CardConfig<unknown>;
  state: AppState;
  fontsVersion: number;
  saveError: boolean;
  onBack: () => void;
  setConfig: (id: TemplateId, update: (c: CardConfig<unknown>) => CardConfig<unknown>) => void;
  resetConfig: (id: TemplateId) => void;
  setFilename: (id: TemplateId, name: string) => void;
  setEmbedFonts: (embed: boolean) => void;
  setPreviewBackground: (bg: PreviewBackground) => void;
}) {
  const template = getTemplate(templateId);
  const [tab, setTab] = useState<EditorTab>("content");
  const [confirmReset, setConfirmReset] = useState(false);
  const resetTimer = useRef<number | undefined>(undefined);
  const exportRef = useRef<HTMLElement>(null);
  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const { card, markup } = useRenderedCard(template, config, fontsVersion);
  const exported = useExportedSvg(card, state.embedFonts);
  const edited = state.configs[templateId] !== undefined;

  const updateStyle = useCallback(
    (patch: Partial<CardStyle>) =>
      setConfig(templateId, (c) => ({ ...c, style: { ...c.style, ...patch } })),
    [setConfig, templateId],
  );
  const updateContent = useCallback(
    (patch: Record<string, unknown>) =>
      setConfig(templateId, (c) => ({ ...c, content: { ...(c.content as object), ...patch } })),
    [setConfig, templateId],
  );
  const setVariant = useCallback(
    (variant: string) => setConfig(templateId, (c) => ({ ...c, variant })),
    [setConfig, templateId],
  );

  const onReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      resetTimer.current = window.setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    window.clearTimeout(resetTimer.current);
    setConfirmReset(false);
    resetConfig(templateId);
  };

  // xl: export gets its own rail; lg: below the preview; small: after the controls.
  const wide = useMediaQuery("(min-width: 1280px)");
  const twoColumn = useMediaQuery("(min-width: 1024px)");
  const exportPanel = (
    <ExportPanel
      exported={exported}
      width={card.width}
      height={card.height}
      filename={state.filenames[templateId] ?? template.defaultFilename}
      defaultFilename={template.defaultFilename}
      onFilename={(name) => setFilename(templateId, name)}
      altText={template.altText(config)}
      embedFonts={state.embedFonts}
      onEmbedFonts={setEmbedFonts}
    />
  );

  const category = CATEGORIES.find((c) => c.id === template.category)?.label;

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line px-4">
        <Button
          variant="ghost"
          size="sm"
          icon={<NavArrowLeft width={15} height={15} aria-hidden />}
          onClick={onBack}
        >
          <span className="hidden sm:inline">Templates</span>
        </Button>
        <span className="h-5 w-px bg-line" />
        <div className="hidden md:block">
          <Wordmark />
        </div>
        <div className="flex min-w-0 items-baseline gap-2 md:ml-3 md:border-l md:border-line md:pl-4">
          <h1 className="truncate text-[13px] font-medium">{template.name} card</h1>
          <span className="eyebrow hidden sm:inline">{category}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {saveError ? (
            <span className="hidden text-[11.5px] text-danger sm:inline">
              Couldn't save locally (storage full?)
            </span>
          ) : (
            <span className="hidden font-mono text-[10.5px] text-ink-3 sm:inline">
              {edited ? "Saved in this browser" : "Template defaults"}
            </span>
          )}
          {twoColumn ? null : (
            <Button
              size="sm"
              variant="primary"
              icon={<Download width={13} height={13} aria-hidden />}
              onClick={() => {
                exportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                exportRef.current?.focus({ preventScroll: true });
              }}
            >
              Export
            </Button>
          )}
          <Button
            size="sm"
            variant={confirmReset ? "danger" : "ghost"}
            icon={<Undo width={13} height={13} aria-hidden />}
            disabled={!edited}
            onClick={onReset}
          >
            {confirmReset ? "Click again to reset" : "Reset"}
          </Button>
          <span className="sr-only" aria-live="polite">
            {confirmReset ? "Press reset again to restore the template defaults." : ""}
          </span>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(320px,360px)_1fr] xl:grid-cols-[360px_1fr_320px]">
        <aside
          aria-label="Card settings"
          className="order-2 border-line lg:order-1 lg:min-h-0 lg:overflow-y-auto lg:border-r"
        >
          <EditorTabs active={tab} onChange={setTab}>
            {tab === "content" ? (
              <ContentEditor templateId={templateId} config={config} update={updateContent} />
            ) : null}
            {tab === "appearance" ? (
              <AppearancePanel style={config.style} update={updateStyle} />
            ) : null}
            {tab === "typography" ? (
              <TypographyPanel style={config.style} update={updateStyle} />
            ) : null}
            {tab === "layout" ? (
              <LayoutPanel
                style={config.style}
                update={updateStyle}
                variant={config.variant}
                variants={template.variants}
                onVariant={setVariant}
                overflow={card.overflow}
              />
            ) : null}
          </EditorTabs>
        </aside>

        <main className="order-1 flex min-h-[48vh] flex-col border-b border-line lg:order-2 lg:min-h-0 lg:border-b-0 lg:overflow-y-auto">
          <PreviewPane
            markup={markup}
            width={card.width}
            height={card.height}
            background={state.previewBackground}
            onBackground={setPreviewBackground}
          />
          {twoColumn && !wide ? <div className="border-t border-line">{exportPanel}</div> : null}
        </main>

        {twoColumn ? null : (
          <aside
            ref={exportRef}
            tabIndex={-1}
            aria-label="Export"
            className="order-3 border-t border-line focus:outline-none"
          >
            {exportPanel}
          </aside>
        )}
        {wide ? (
          <aside
            aria-label="Export"
            className="order-3 min-h-0 overflow-y-auto border-l border-line"
          >
            {exportPanel}
          </aside>
        ) : null}
      </div>
    </div>
  );
}
