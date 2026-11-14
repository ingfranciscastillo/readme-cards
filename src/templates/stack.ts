import { ANCHOR, fontAttrs, RenderContext, textLines, typeScale } from "../lib/svg/context";
import { type FlowItem, flow } from "../lib/svg/flow";
import { type Block, divider, renderStack, stackHeight } from "../lib/svg/layout";
import { svg } from "../lib/svg/markup";
import { measureText, truncate, wrapText } from "../lib/svg/text";
import type { CardTemplate } from "../types/card";
import type { StackContent } from "../types/content";
import { finishCard, PAPER_STYLE } from "./shared";

export function parseItems(items: string): string[] {
  return items
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 60);
}

export const stackTemplate: CardTemplate<StackContent> = {
  id: "stack",
  name: "Tech Stack",
  category: "developer",
  description: "The languages, tools and platforms you work with, as tags.",
  defaultFilename: "stack-card",
  variants: [
    { value: "outline", label: "Outlined tags" },
    { value: "solid", label: "Solid tags" },
    { value: "list", label: "Inline list" },
  ],
  defaultConfig: {
    variant: "outline",
    content: {
      title: "Tools of the trade",
      subtitle: "What I reach for when building for the web.",
      showTitle: true,
      showSubtitle: true,
      items: "TypeScript, React, Vite, Node.js, PostgreSQL, Rust, Tailwind CSS, Figma",
    },
    style: { ...PAPER_STYLE, width: 520, gap: 14 },
  },
  altText: (config) => config.content.title || "Tech stack card",
  render: (config, options) => {
    const { content: c, style: s, variant } = config;
    const ctx = new RenderContext(options.idPrefix, s);
    const t = typeScale(s);
    const left = s.padding;
    const width = Math.max(40, s.width - s.padding * 2);
    const anchor = ANCHOR[s.align];
    const x = ctx.alignX(left, width);
    const blocks: Block[] = [];

    if (c.showTitle && c.title.trim()) {
      const style = { font: s.displayFont, size: t.title, weight: s.titleWeight };
      const lh = Math.round(t.title * 1.15);
      const lines = wrapText(c.title.trim(), style, width, 2);
      blocks.push({
        height: lines.length * lh,
        render: (top) =>
          textLines(ctx, { x, top, lines, style, lineHeight: lh, fill: s.text, anchor }),
      });
    }
    if (c.showSubtitle && c.subtitle.trim()) {
      const style = { font: s.bodyFont, size: t.base, weight: 400 };
      const lines = wrapText(c.subtitle.trim(), style, width, 3);
      blocks.push({
        height: lines.length * t.lineHeight,
        marginTop: -Math.round(s.gap * 0.4),
        render: (top) =>
          textLines(ctx, {
            x,
            top,
            lines,
            style,
            lineHeight: t.lineHeight,
            fill: s.text,
            opacity: t.muted,
            anchor,
          }),
      });
    }
    if (blocks.length > 0 && s.showDivider) blocks.push(divider(ctx, left, width));

    const items = parseItems(c.items);
    const tagStyle = { font: s.bodyFont, size: t.small, weight: 500 };
    const resolved = ctx.registerFont(tagStyle);
    const padX = Math.round(t.small * 0.85);
    const tagHeight = Math.round(t.small * 2.1);
    const tagRadius = Math.min(s.radius, tagHeight / 2);

    const tags: FlowItem[] = items.map((raw, i) => {
      if (variant === "list") {
        const label = truncate(raw, tagStyle, width);
        const sep = i < items.length - 1 ? " /" : "";
        const labelWidth = measureText(label, tagStyle);
        return {
          width: labelWidth + (sep ? measureText(sep, tagStyle) : 0),
          render: (ix, top, rowHeight) => {
            const base = top + rowHeight / 2 + resolved.size * 0.35;
            return svg`<text x="${ix}" y="${base}"${fontAttrs(resolved)} fill="${s.text}">${label}</text>${
              sep
                ? svg`<text x="${ix + labelWidth + measureText(" ", tagStyle)}" y="${base}"${fontAttrs(resolved)} fill="${s.accent}">/</text>`
                : ""
            }`;
          },
        };
      }
      const label = truncate(raw, tagStyle, width - padX * 2);
      const w = measureText(label, tagStyle) + padX * 2;
      const solid = variant === "solid";
      return {
        width: w,
        render: (ix, top, rowHeight) => {
          const y = top + (rowHeight - tagHeight) / 2;
          const base = y + tagHeight / 2 + resolved.size * 0.35;
          const rect = solid
            ? svg`<rect x="${ix}" y="${y}" width="${w}" height="${tagHeight}" rx="${tagRadius}" fill="${s.accent}"/>`
            : svg`<rect x="${ix + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${tagHeight - 1}" rx="${tagRadius}" fill="${s.accent}" fill-opacity="0.07" stroke="${s.accent}" stroke-opacity="0.45"/>`;
          const fill = solid ? (s.transparent ? "#ffffff" : s.background) : s.text;
          return svg`${rect}<text x="${ix + padX}" y="${base}"${fontAttrs(resolved)} fill="${fill}">${label}</text>`;
        },
      };
    });

    if (tags.length > 0) {
      blocks.push(
        flow(tags, {
          left,
          width,
          align: s.align,
          gap: variant === "list" ? Math.round(t.small * 0.6) : Math.round(t.small * 0.55),
          rowGap: variant === "list" ? 2 : Math.round(t.small * 0.55),
          rowHeight: variant === "list" ? Math.round(t.small * 1.7) : tagHeight,
        }),
      );
    }

    return finishCard(ctx, {
      contentHeight: stackHeight(blocks, s.gap),
      render: (top) => renderStack(blocks, top, s.gap),
      title: c.title || "Tech stack",
      description: items.join(", "),
    });
  },
};
