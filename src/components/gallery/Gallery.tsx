import { ArrowRight } from "iconoir-react";
import { useMemo, useState } from "react";
import { toSvgDocument } from "../../lib/svg/document";
import type { AppState } from "../../state/store";
import { TEMPLATES } from "../../templates";
import { CATEGORIES, type CardConfig, type CategoryId, type TemplateId } from "../../types/card";
import { CardSvg } from "../CardSvg";
import { GithubLink } from "../GithubLink";
import { Wordmark } from "../Wordmark";

const THUMB_MAX_WIDTH = 440;
const THUMB_MAX_HEIGHT = 230;

function Thumbnail({
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
    const card = template.render(config, { idPrefix: prefix });
    return { card, markup: toSvgDocument(card, { idPrefix: prefix }) };
  }, [template, templateId, config, fontsVersion]);
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
          <h1 className="font-serif text-[42px] leading-[1.02] tracking-[-0.015em] text-balance md:text-[56px]">
            Cards for the top of your README.
          </h1>
          <p className="max-w-[44ch] text-[14px] leading-relaxed text-ink-2">
            Pick a template, fill it in by hand or from GitHub, tune type and spacing, then download
            an SVG you commit next to your README. What you see in the preview is the exact file you
            get.
          </p>
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
                <li key={template.id}>
                  <button
                    type="button"
                    onClick={() => onOpen(template.id)}
                    className="group flex w-full flex-col overflow-hidden rounded-[6px] border border-line bg-white/40 text-left transition-colors hover:border-ink-3"
                    aria-label={`${saved ? "Continue editing" : "Open"} the ${template.name} template`}
                  >
                    <div className="dot-grid flex h-[290px] items-center justify-center border-b border-line bg-paper-2 p-6">
                      <Thumbnail
                        templateId={template.id}
                        config={config}
                        fontsVersion={fontsVersion}
                      />
                    </div>
                    <div className="flex items-end justify-between gap-4 px-5 py-4">
                      <div className="flex min-w-0 flex-col gap-1">
                        <div className="flex items-baseline gap-2.5">
                          <h2 className="font-serif text-[24px] leading-none">{template.name}</h2>
                          <span className="eyebrow">{category}</span>
                          {saved ? (
                            <span className="rounded-[3px] bg-accent-soft px-1.5 py-px font-mono text-[10px] text-accent">
                              Edited
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[12.5px] text-ink-2">{template.description}</p>
                      </div>
                      <span className="flex shrink-0 items-center gap-1 text-[12px] font-medium text-ink-2 transition-colors group-hover:text-ink">
                        {saved ? "Continue" : "Customize"}
                        <ArrowRight
                          width={14}
                          height={14}
                          aria-hidden
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>
                  </button>
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
