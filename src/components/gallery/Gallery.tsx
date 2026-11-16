import { ArrowRight } from "iconoir-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toSvgDocument } from "../../lib/svg/document";
import type { AppState } from "../../state/store";
import { requestFaces } from "../../state/useFontsVersion";
import { renderCard, TEMPLATES } from "../../templates";
import { CATEGORIES, type CardConfig, type CategoryId, type TemplateId } from "../../types/card";
import { CardSvg } from "../CardSvg";
import { GithubLink } from "../GithubLink";
import { Wordmark } from "../Wordmark";

const THUMB_MAX_WIDTH = 440;
const THUMB_MAX_HEIGHT = 230;

/**
 * True once the element comes near the viewport. Rendering a card measures
 * its text, which is the costliest work on load, so off-screen cards wait.
 */
function useNearViewport<T extends Element>() {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(() => typeof IntersectionObserver === "undefined");
  useEffect(() => {
    const el = ref.current;
    if (near || !el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setNear(true);
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [near]);
  return [ref, near] as const;
}

function Thumbnail(props: {
  templateId: TemplateId;
  config: CardConfig<unknown>;
  fontsVersion: number;
}) {
  const [ref, near] = useNearViewport<HTMLDivElement>();
  return (
    <div ref={ref} className="flex size-full items-center justify-center">
      {near ? <ThumbnailCard {...props} /> : null}
    </div>
  );
}

function ThumbnailCard({
  templateId,
  config,
  fontsVersion,
}: {
  templateId: TemplateId;
  config: CardConfig<unknown>;
  fontsVersion: number;
}) {
  const template = TEMPLATES.find((t) => t.id === templateId);
  const rendered = useMemo(() => {
    void fontsVersion;
    if (!template) return null;
    // Unique id prefix: several cards share this page's id namespace.
    const prefix = `g-${templateId}`;
    const card = renderCard(template, config, { idPrefix: prefix });
    return { card, markup: toSvgDocument(card, { idPrefix: prefix }) };
  }, [template, templateId, config, fontsVersion]);
  useEffect(() => {
    if (rendered) requestFaces(rendered.card.faces);
  }, [rendered]);
  if (!rendered) return null;
  const { card, markup } = rendered;
  const scale = Math.min(1, THUMB_MAX_WIDTH / card.width, THUMB_MAX_HEIGHT / card.height);
  return (
    <CardSvg
      markup={markup}
      width={Math.round(card.width * scale)}
      height={Math.round(card.height * scale)}
      className="drop-shadow-[0_1px_0_rgb(32_33_36/0.04)]"
    />
  );
}

export function Gallery({
  state,
  fontsVersion,
  onOpen,
}: {
  state: AppState;
  fontsVersion: number;
  onOpen: (id: TemplateId) => void;
}) {
  const [filter, setFilter] = useState<CategoryId | "all">("all");
  const visible = TEMPLATES.filter((t) => filter === "all" || t.category === filter);
  const counts = useMemo(() => {
    const out: Record<string, number> = { all: TEMPLATES.length };
    for (const t of TEMPLATES) out[t.category] = (out[t.category] ?? 0) + 1;
    return out;
  }, []);

  return (
    <div className="min-h-dvh">
      <header className="border-b border-line">
        <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between px-5">
          <Wordmark />
          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-[11px] text-ink-3 sm:block">
              Runs in your browser · no account · exports standalone SVG
            </span>
            <GithubLink />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1120px] px-5 pb-16">
        <section className="grid gap-6 border-b border-line py-10 md:grid-cols-[1.3fr_1fr] md:items-end md:py-14">
          <h1 className="font-display text-[46px] leading-[0.95] font-extrabold font-stretch-condensed tracking-[-0.005em] text-balance md:text-[66px]">
            Cards for the top of your README.
          </h1>
          <div className="flex max-w-[46ch] flex-col items-start gap-3">
            <p className="text-[14.5px] leading-relaxed text-pretty text-ink-2">
              Pick a template, fill it in by hand or from GitHub, tune type and spacing, then
              download an SVG you commit next to your README and add with one line:
            </p>
            <code className="rounded-[var(--radius-control)] border border-line bg-white px-2.5 py-1.5 font-mono text-[12px] text-ink-2">
              ![Ada's profile](./<span className="text-accent">profile-card.svg</span>)
            </code>
          </div>
        </section>

        <nav aria-label="Template categories" className="flex flex-wrap gap-x-6 gap-y-2 py-5">
          {[{ id: "all" as const, label: "All" }, ...CATEGORIES].map((cat) => {
            const selected = filter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setFilter(cat.id)}
                className={`flex items-baseline gap-1.5 border-b py-1 text-[13px] transition-colors ${
                  selected ? "border-ink text-ink" : "border-transparent text-ink-2 hover:text-ink"
                }`}
              >
                {cat.label}
                <span className="font-mono text-[10.5px] text-ink-3 tabular-nums">
                  {counts[cat.id] ?? 0}
                </span>
              </button>
            );
          })}
        </nav>

        {visible.length === 0 ? (
          <p className="border border-dashed border-line-strong px-6 py-12 text-center text-ink-2">
            No templates in this category yet.
          </p>
        ) : (
          <ul className="grid gap-5 md:grid-cols-2">
            {visible.map((template) => {
              const saved = state.configs[template.id];
              const config = saved ?? template.defaultConfig;
              const category = CATEGORIES.find((c) => c.id === template.category)?.label;
              return (
                // The title's button stretches over the whole card (::after), so
                // the card is one click target while its name stays short and
                // the heading is not nested inside a button.
                <li
                  key={template.id}
                  className="group relative flex flex-col overflow-hidden rounded-[6px] border border-line bg-white/40 transition-colors hover:border-ink-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent"
                >
                  <div
                    aria-hidden="true"
                    className="dot-grid flex h-[290px] items-center justify-center border-b border-line bg-paper-2 p-6"
                  >
                    <Thumbnail
                      templateId={template.id}
                      config={config}
                      fontsVersion={fontsVersion}
                    />
                  </div>
                  <div className="flex items-end justify-between gap-4 px-5 py-4">
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex items-baseline gap-2.5">
                        <h2 className="font-display text-[24px] leading-none font-bold font-stretch-[80%] tracking-[-0.02em]">
                          <button
                            type="button"
                            onClick={() => onOpen(template.id)}
                            aria-describedby={`card-${template.id}-desc`}
                            className="cursor-pointer text-left after:absolute after:inset-0 focus-visible:outline-none"
                          >
                            {template.name}
                          </button>
                        </h2>
                        <span className="eyebrow">{category}</span>
                        {saved ? (
                          <span className="rounded-[3px] bg-accent-soft px-1.5 py-px font-mono text-[10px] text-accent">
                            Edited
                          </span>
                        ) : null}
                      </div>
                      <p id={`card-${template.id}-desc`} className="text-[12.5px] text-ink-2">
                        {template.description}
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="flex shrink-0 items-center gap-1 text-[12px] font-medium text-ink-2 transition-colors group-hover:text-ink"
                    >
                      {saved ? "Continue" : "Customize"}
                      <ArrowRight
                        width={14}
                        height={14}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <section
          aria-label="How it works"
          className="mt-14 grid gap-8 border-t border-line pt-8 text-[12.5px] leading-relaxed text-ink-2 md:grid-cols-3"
        >
          <div>
            <h2 className="eyebrow mb-2">01 · Fill it in</h2>
            <p>
              Type your own content or import a public GitHub profile or repository. No token
              needed.
            </p>
          </div>
          <div>
            <h2 className="eyebrow mb-2">02 · Shape it</h2>
            <p>
              Colours, typefaces, spacing and layout update the preview instantly. Work is kept in
              this browser.
            </p>
          </div>
          <div>
            <h2 className="eyebrow mb-2">03 · Ship it</h2>
            <p>
              Download a vector SVG with fonts and avatar embedded, commit it, and reference it with
              the generated Markdown.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
