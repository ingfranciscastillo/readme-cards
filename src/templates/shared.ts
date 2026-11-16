import { type Anchor, type RenderContext, textLines, typeScale } from "../lib/svg/context";
import { type Block, cardFrame, frameMetrics } from "../lib/svg/layout";
import { type SafeSvg, svg } from "../lib/svg/markup";
import { wrapText } from "../lib/svg/text";
import { darkColorMap } from "../lib/svg/theme";
import type { CardStyle, RenderedCard } from "../types/card";

export const PAPER_STYLE: CardStyle = {
  background: "#f6f6f2",
  transparent: false,
  text: "#202124",
  accent: "#246b68",
  border: "#dcdcd3",
  showBorder: true,
  borderWidth: 1,
  radius: 10,
  darkMode: false,
  darkBackground: "#18191b",
  darkText: "#ecece6",
  darkAccent: "#7cc2bc",
  darkBorder: "#2e3033",
  displayFont: "instrument-serif",
  bodyFont: "geist",
  fontSize: 14,
  titleWeight: 600,
  lineHeight: 1.45,
  width: 520,
  height: 220,
  autoHeight: true,
  padding: 28,
  align: "left",
  gap: 12,
  showDivider: false,
};

/** Wrap measured content in the card frame and produce a RenderedCard. */
export function finishCard(
  ctx: RenderContext,
  opts: {
    contentHeight: number;
    render: (top: number, height: number) => SafeSvg;
    title: string;
    description: string;
  },
): RenderedCard {
  const width = Math.round(ctx.style.width);
  const { height, top } = frameMetrics(ctx.style, opts.contentHeight);
  const frame = cardFrame(ctx, width, height);
  const content = opts.render(top, height);
  return {
    width,
    height,
    title: opts.title,
    description: opts.description,
    defs: ctx.getDefs(),
    body: svg`${frame.background}<g clip-path="url(#${frame.clipId})">${content}</g>${frame.border}`,
    faces: ctx.getFaces(),
    darkColors: darkColorMap(ctx.style),
    overflow: !ctx.style.autoHeight && opts.contentHeight + ctx.style.padding * 2 > height + 0.5,
  };
}

export function isDataImage(value: string): boolean {
  return /^data:image\/(png|jpeg|gif|webp);base64,[a-z0-9+/=\s]+$/i.test(value);
}

export function initials(name: string): string {
  const parts = name
    .replace(/^@/, "")
    .split(/[\s._-]+/)
    .filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

/** Title and subtitle blocks, laid out the way every titled card does it. */
export function headingBlocks(
  ctx: RenderContext,
  heading: { title: string; subtitle: string; showTitle: boolean; showSubtitle: boolean },
  box: { x: number; width: number; anchor: Anchor },
): Block[] {
  const s = ctx.style;
  const t = typeScale(s);
  const { x, width, anchor } = box;
  const blocks: Block[] = [];
  if (heading.showTitle && heading.title.trim()) {
    const style = { font: s.displayFont, size: t.title, weight: s.titleWeight };
    const lh = Math.round(t.title * 1.15);
    const lines = wrapText(heading.title.trim(), style, width, 2);
    blocks.push({
      height: lines.length * lh,
      render: (top) =>
        textLines(ctx, { x, top, lines, style, lineHeight: lh, fill: s.text, anchor }),
    });
  }
  if (heading.showSubtitle && heading.subtitle.trim()) {
    const style = { font: s.bodyFont, size: t.base, weight: 400 };
    const lines = wrapText(heading.subtitle.trim(), style, width, 3);
    blocks.push({
      height: lines.length * t.lineHeight,
      marginTop: blocks.length > 0 ? -Math.round(s.gap * 0.4) : 0,
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
  return blocks;
}

/** A muted one-line hint shown when a card has nothing to list yet. */
export function emptyHint(ctx: RenderContext, text: string, x: number, anchor: Anchor): Block {
  const s = ctx.style;
  const t = typeScale(s);
  const style = { font: s.bodyFont, size: t.small, weight: 400 };
  const lh = Math.round(t.small * 1.7);
  return {
    height: lh,
    render: (top) =>
      textLines(ctx, {
        x,
        top,
        lines: [text],
        style,
        lineHeight: lh,
        fill: s.text,
        opacity: 0.6,
        anchor,
      }),
  };
}
