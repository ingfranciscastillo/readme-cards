import { ANCHOR, RenderContext, textLines, typeScale } from "../lib/svg/context";
import { flow, labelItem } from "../lib/svg/flow";
import { type Block, renderStack, stackHeight } from "../lib/svg/layout";
import { type SafeSvg, svg } from "../lib/svg/markup";
import { truncate, wrapText } from "../lib/svg/text";
import type { Align, CardTemplate } from "../types/card";
import type { BannerContent } from "../types/content";
import { finishCard, PAPER_STYLE } from "./shared";
import { parseItems } from "./stack";

/** Below this inner width the split variant falls back to a single column. */
const SPLIT_MIN_WIDTH = 520;

function headingBlocks(
  ctx: RenderContext,
  c: BannerContent,
  left: number,
  width: number,
  align: Align,
  underline: boolean,
): Block[] {
  const s = ctx.style;
  const t = typeScale(s);
  const anchor = ANCHOR[align];
  const x = ctx.alignX(left, width, align);
  const blocks: Block[] = [];

  if (c.showEyebrow && c.eyebrow.trim()) {
    const style = { font: s.bodyFont, size: t.eyebrow, weight: 600, tracking: t.eyebrow * 0.12 };
    const label = truncate(c.eyebrow.trim().toUpperCase(), style, width);
    const lh = Math.round(t.eyebrow * 1.4);
    blocks.push({
      height: lh,
      render: (top) =>
        textLines(ctx, { x, top, lines: [label], style, lineHeight: lh, fill: s.accent, anchor }),
    });
  }

  const titleStyle = {
    font: s.displayFont,
    size: Math.round(t.title * 1.85),
    weight: s.titleWeight,
  };
  const titleLh = Math.round(titleStyle.size * 1.05);
  const titleLines = wrapText(c.title.trim() || "Your name", titleStyle, width, 2);
  blocks.push({
    height: titleLines.length * titleLh,
    marginTop: blocks.length > 0 ? -Math.round(s.gap * 0.35) : 0,
    render: (top) =>
      textLines(ctx, {
        x,
        top,
        lines: titleLines,
        style: titleStyle,
        lineHeight: titleLh,
        fill: s.text,
        anchor,
      }),
  });

  if (underline) {
    const ruleWidth = Math.round(t.base * 3.4);
    const ruleX =
      align === "center"
        ? left + (width - ruleWidth) / 2
        : align === "right"
          ? left + width - ruleWidth
          : left;
    blocks.push({
      height: 3,
      render: (top) =>
        svg`<rect x="${ruleX}" y="${top}" width="${ruleWidth}" height="3" rx="1.5" fill="${s.accent}"/>`,
    });
  }
  return blocks;
}

function detailBlocks(
  ctx: RenderContext,
  c: BannerContent,
  left: number,
  width: number,
  align: Align,
): Block[] {
  const s = ctx.style;
  const t = typeScale(s);
  const anchor = ANCHOR[align];
  const x = ctx.alignX(left, width, align);
  const blocks: Block[] = [];

  if (c.showSubtitle && c.subtitle.trim()) {
    const size = Math.round(t.base * 1.12 * 10) / 10;
    const style = { font: s.bodyFont, size, weight: 400 };
    const lh = Math.round(size * s.lineHeight * 10) / 10;
    const lines = wrapText(c.subtitle.trim(), style, width, 4);
    blocks.push({
      height: lines.length * lh,
      render: (top) =>
        textLines(ctx, {
          x,
          top,
          lines,
          style,
          lineHeight: lh,
          fill: s.text,
          opacity: 0.8,
          anchor,
        }),
    });
  }

  const tags = c.showTags ? parseItems(c.tags).slice(0, 16) : [];
  if (tags.length > 0) {
    const style = { font: s.bodyFont, size: t.small, weight: 500 };
    blocks.push(
      flow(
        tags.map((label) =>
          labelItem(ctx, {
            label,
            style,
            color: s.text,
            opacity: 0.86,
            dot: s.accent,
            maxWidth: width,
          }),
        ),
        {
          left,
          width,
          align,
          gap: Math.round(t.base * 1.2),
          rowGap: Math.round(t.small * 0.3),
          rowHeight: Math.round(t.small * 1.8),
          maxRows: 2,
        },
      ),
    );
  }
  return blocks;
}

export const bannerTemplate: CardTemplate<BannerContent> = {
  id: "banner",
  name: "Banner",
  category: "profile",
  description: "A wide header for the top of your README: name, a line about you and tags.",
  defaultFilename: "banner",
  variants: [
    { value: "classic", label: "Classic" },
    { value: "underline", label: "Accent rule" },
    { value: "split", label: "Split" },
  ],
  defaultConfig: {
    variant: "classic",
    content: {
      eyebrow: "Hi, I'm",
      title: "Ada Lovelace",
      subtitle:
        "Mathematician and writer. Working on notes for the Analytical Engine and the first published algorithm.",
      tags: "Mathematics, Algorithms, Poetical science, London",
      showEyebrow: true,
      showSubtitle: true,
      showTags: true,
    },
    style: { ...PAPER_STYLE, width: 840, padding: 44, fontSize: 15, gap: 16 },
  },
  altText: (config) => config.content.title || "Banner",
  render: (config, options) => {
    const { content: c, style: s, variant } = config;
    const ctx = new RenderContext(options.idPrefix, s);
    const inner = Math.max(40, s.width - s.padding * 2);
    const title = c.title.trim() || "Banner";
    const description = [c.subtitle, c.tags].filter(Boolean).join(" · ");

    if (variant === "split" && inner >= SPLIT_MIN_WIDTH) {
      // Heading on the left, details on the right, split by a hairline.
      const colGap = Math.round(s.gap * 2.5);
      const leftWidth = Math.round((inner - colGap) * 0.52);
      const rightWidth = inner - colGap - leftWidth;
      const rightLeft = s.padding + leftWidth + colGap;
      const heading = headingBlocks(ctx, c, s.padding, leftWidth, "left", false);
      const details = detailBlocks(ctx, c, rightLeft, rightWidth, "left");
      const headingHeight = stackHeight(heading, s.gap);
      const detailsHeight = stackHeight(details, s.gap);
      const contentHeight = Math.max(headingHeight, detailsHeight);
      return finishCard(ctx, {
        contentHeight,
        render: (top) => {
          const parts: SafeSvg[] = [
            renderStack(heading, top + (contentHeight - headingHeight) / 2, s.gap),
          ];
          if (details.length > 0) {
            const ruleX = s.padding + leftWidth + colGap / 2;
            parts.push(
              svg`<rect x="${ruleX}" y="${top}" width="1" height="${contentHeight}" fill="${s.border}"/>`,
              renderStack(details, top + (contentHeight - detailsHeight) / 2, s.gap),
            );
          }
          return svg`${parts}`;
        },
        title,
        description,
      });
    }

    const blocks = [
      ...headingBlocks(ctx, c, s.padding, inner, s.align, variant === "underline"),
      ...detailBlocks(ctx, c, s.padding, inner, s.align),
    ];
    return finishCard(ctx, {
      contentHeight: stackHeight(blocks, s.gap),
      render: (top) => renderStack(blocks, top, s.gap),
      title,
      description,
    });
  },
};
