import { ANCHOR, fontAttrs, RenderContext, textLines, typeScale } from "../lib/svg/context";
import { type FlowItem, flow } from "../lib/svg/flow";
import { type Block, divider, renderStack, stackHeight } from "../lib/svg/layout";
import { type SafeSvg, svg } from "../lib/svg/markup";
import { measureText, type TextStyle, truncate, wrapText } from "../lib/svg/text";
import type { CardTemplate } from "../types/card";
import type { LanguagesContent } from "../types/content";
import { finishCard, PAPER_STYLE } from "./shared";

export const MAX_LANGUAGES = 10;
const HEX = /^#[0-9a-f]{6}$/i;

interface Share {
  name: string;
  color: string;
  share: number;
  label: string;
}

export function formatShare(share: number): string {
  const pct = share * 100;
  if (pct > 0 && pct < 0.1) return "<0.1%";
  return `${pct.toFixed(1)}%`;
}

/** Valid entries with their share of the total, largest first. */
export function languageShares(c: LanguagesContent): Share[] {
  const valid = c.languages
    .filter((l) => l.name.trim() && Number.isFinite(l.value) && l.value > 0)
    .slice(0, MAX_LANGUAGES);
  const total = valid.reduce((sum, l) => sum + l.value, 0);
  if (total <= 0) return [];
  return valid
    .map((l) => ({
      name: l.name.trim(),
      color: HEX.test(l.color) ? l.color : "#8b8b85",
      share: l.value / total,
      label: formatShare(l.value / total),
    }))
    .sort((a, b) => b.share - a.share);
}

function dot(cx: number, cy: number, r: number, color: string): SafeSvg {
  return svg`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>`;
}

/** Colour dot, language name and (optionally) its share, on one baseline. */
function legendItem(
  ctx: RenderContext,
  lang: Share,
  showPercent: boolean,
  nameStyle: TextStyle,
  pctStyle: TextStyle,
  maxWidth: number,
): FlowItem {
  const s = ctx.style;
  const n = ctx.registerFont(nameStyle);
  const p = ctx.registerFont(pctStyle);
  const lead = Math.round(n.size * 1.15);
  const pctText = showPercent ? lang.label : "";
  const pctWidth = pctText ? measureText(" ", nameStyle) + measureText(pctText, pctStyle) : 0;
  const name = truncate(lang.name, nameStyle, Math.max(10, maxWidth - lead - pctWidth));
  const nameWidth = measureText(name, nameStyle);
  return {
    width: lead + nameWidth + pctWidth,
    render: (x, top, rowHeight) => {
      const mid = top + rowHeight / 2;
      const base = mid + n.size * 0.35;
      return svg`${dot(x + n.size * 0.4, mid, Math.round(n.size * 0.36 * 10) / 10, lang.color)}<text x="${x + lead}" y="${base}"${fontAttrs(n)} fill="${s.text}">${name}</text>${
        pctText
          ? svg`<text x="${x + lead + nameWidth + measureText(" ", nameStyle)}" y="${base}"${fontAttrs(p)} fill="${s.text}" fill-opacity="0.6">${pctText}</text>`
          : ""
      }`;
    },
  };
}

function stackedBar(ctx: RenderContext, shares: Share[], left: number, width: number): Block {
  const height = Math.max(6, Math.round(ctx.style.fontSize * 0.65));
  return {
    height,
    render: (top) => {
      const clipId = ctx.id("bar");
      ctx.addDef(
        svg`<clipPath id="${clipId}"><rect x="${left}" y="${top}" width="${width}" height="${height}" rx="${height / 2}"/></clipPath>`,
      );
      // Segments butt against each other; a background-coloured hairline separates them.
      const gap = shares.length > 1 ? 2 : 0;
      let x = left;
      const segments = shares.map((l, i) => {
        const w = i === shares.length - 1 ? left + width - x : l.share * width;
        const rect = svg`<rect x="${x}" y="${top}" width="${Math.max(0, w - (i < shares.length - 1 ? gap : 0))}" height="${height}" fill="${l.color}"/>`;
        x += w;
        return rect;
      });
      return svg`<g clip-path="url(#${clipId})">${segments}</g>`;
    },
  };
}

function barRows(
  ctx: RenderContext,
  shares: Share[],
  showPercent: boolean,
  left: number,
  width: number,
): Block[] {
  const s = ctx.style;
  const t = typeScale(s);
  const nameStyle = { font: s.bodyFont, size: t.small, weight: 500 };
  const pctStyle = { font: s.bodyFont, size: t.small, weight: 400 };
  const n = ctx.registerFont(nameStyle);
  const p = ctx.registerFont(pctStyle);
  const lineHeight = Math.round(t.small * 1.5);
  const barHeight = Math.max(4, Math.round(t.base * 0.4));
  const barGap = Math.round(t.small * 0.35);
  return shares.map((l) => {
    const pctWidth = showPercent ? measureText(l.label, pctStyle) + t.small : 0;
    const name = truncate(l.name, nameStyle, Math.max(10, width - pctWidth));
    return {
      height: lineHeight + barGap + barHeight,
      render: (top) => {
        const base = top + lineHeight / 2 + n.size * 0.35;
        const barTop = top + lineHeight + barGap;
        const r = barHeight / 2;
        return svg`<text x="${left}" y="${base}"${fontAttrs(n)} fill="${s.text}">${name}</text>${
          showPercent
            ? svg`<text x="${left + width}" y="${base}"${fontAttrs(p)} fill="${s.text}" fill-opacity="0.6" text-anchor="end">${l.label}</text>`
            : ""
        }<rect x="${left}" y="${barTop}" width="${width}" height="${barHeight}" rx="${r}" fill="${s.text}" fill-opacity="0.1"/><rect x="${left}" y="${barTop}" width="${Math.max(barHeight, l.share * width)}" height="${barHeight}" rx="${r}" fill="${l.color}"/>`;
      },
    };
  });
}

function donut(ctx: RenderContext, shares: Share[], cx: number, cy: number, size: number): SafeSvg {
  const s = ctx.style;
  const stroke = Math.round(size * 0.16);
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const gap = shares.length > 1 ? Math.min(2, circumference * 0.004) : 0;
  let offset = 0;
  const arcs = shares.map((l) => {
    const length = l.share * circumference;
    const visible = Math.max(0.01, length - gap);
    const arc = svg`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${l.color}" stroke-width="${stroke}" stroke-dasharray="${visible} ${circumference - visible}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})"/>`;
    offset += length;
    return arc;
  });
  return svg`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.text}" stroke-opacity="0.08" stroke-width="${stroke}"/>${arcs}`;
}

export const languagesTemplate: CardTemplate<LanguagesContent> = {
  id: "languages",
  name: "Languages",
  category: "developer",
  description: "How your code splits across languages, as a bar, bars or a donut.",
  defaultFilename: "languages-card",
  variants: [
    { value: "bar", label: "Stacked bar" },
    { value: "bars", label: "Bars" },
    { value: "donut", label: "Donut" },
  ],
  defaultConfig: {
    variant: "bar",
    content: {
      title: "Most used languages",
      showTitle: true,
      showPercent: true,
      languages: [
        { id: "l1", name: "TypeScript", value: 58.2, color: "#3178c6" },
        { id: "l2", name: "CSS", value: 14.6, color: "#663399" },
        { id: "l3", name: "JavaScript", value: 11.3, color: "#f1e05a" },
        { id: "l4", name: "Rust", value: 9.4, color: "#dea584" },
        { id: "l5", name: "Shell", value: 6.5, color: "#89e051" },
      ],
    },
    style: { ...PAPER_STYLE, width: 480, padding: 26, gap: 14 },
  },
  altText: (config) => config.content.title || "Languages card",
  render: (config, options) => {
    const { content: c, style: s, variant } = config;
    const ctx = new RenderContext(options.idPrefix, s);
    const t = typeScale(s);
    const left = s.padding;
    const width = Math.max(40, s.width - s.padding * 2);
    const shares = languageShares(c);
    const blocks: Block[] = [];

    if (c.showTitle && c.title.trim()) {
      const style = { font: s.displayFont, size: t.title, weight: s.titleWeight };
      const lh = Math.round(t.title * 1.15);
      const lines = wrapText(c.title.trim(), style, width, 2);
      const anchor = variant === "donut" ? "start" : ANCHOR[s.align];
      const x = variant === "donut" ? left : ctx.alignX(left, width);
      blocks.push({
        height: lines.length * lh,
        render: (top) =>
          textLines(ctx, { x, top, lines, style, lineHeight: lh, fill: s.text, anchor }),
      });
      if (s.showDivider) blocks.push(divider(ctx, left, width));
    }

    const nameStyle = { font: s.bodyFont, size: t.small, weight: 500 };
    const pctStyle = { font: s.bodyFont, size: t.small, weight: 400 };
    const rowHeight = Math.round(t.small * 1.7);

    if (shares.length === 0) {
      const style = { font: s.bodyFont, size: t.small, weight: 400 };
      blocks.push({
        height: rowHeight,
        render: (top) =>
          textLines(ctx, {
            x: left,
            top,
            lines: ["Add a language with a value above zero."],
            style,
            lineHeight: rowHeight,
            fill: s.text,
            opacity: 0.6,
          }),
      });
    } else if (variant === "bars") {
      const rows = barRows(ctx, shares, c.showPercent, left, width);
      blocks.push({
        height: stackHeight(rows, Math.round(s.gap * 0.7)),
        render: (top) => renderStack(rows, top, Math.round(s.gap * 0.7)),
      });
    } else if (variant === "donut") {
      const size = Math.round(t.base * 7.4);
      const colGap = Math.round(s.gap * 2);
      const legendLeft = left + size + colGap;
      const legendWidth = Math.max(40, width - size - colGap);
      const items = shares.map((l) =>
        legendItem(ctx, l, false, nameStyle, pctStyle, legendWidth - t.small * 4),
      );
      const p = ctx.registerFont(pctStyle);
      const legendHeight = items.length * rowHeight;
      const height = Math.max(size, legendHeight);
      blocks.push({
        height,
        render: (top) => {
          const legendTop = top + (height - legendHeight) / 2;
          return svg`${donut(ctx, shares, left + size / 2, top + height / 2, size)}${items.map(
            (it, i) => {
              const rowTop = legendTop + i * rowHeight;
              const pct = c.showPercent
                ? svg`<text x="${legendLeft + legendWidth}" y="${rowTop + rowHeight / 2 + p.size * 0.35}"${fontAttrs(p)} fill="${s.text}" fill-opacity="0.6" text-anchor="end">${shares[i].label}</text>`
                : "";
              return svg`${it.render(legendLeft, rowTop, rowHeight)}${pct}`;
            },
          )}`;
        },
      });
    } else {
      blocks.push(stackedBar(ctx, shares, left, width));
      blocks.push(
        flow(
          shares.map((l) => legendItem(ctx, l, c.showPercent, nameStyle, pctStyle, width)),
          {
            left,
            width,
            align: s.align,
            gap: Math.round(t.base * 1.15),
            rowGap: 2,
            rowHeight,
          },
        ),
      );
    }

    return finishCard(ctx, {
      contentHeight: stackHeight(blocks, s.gap),
      render: (top) => renderStack(blocks, top, s.gap),
      title: c.title || "Languages",
      description: shares.map((l) => `${l.name} ${l.label}`).join(", "),
    });
  },
};
