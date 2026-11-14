import { ANCHOR, RenderContext, textLines, typeScale } from "../lib/svg/context";
import { icon } from "../lib/svg/icons";
import { type Block, divider, renderStack, stackHeight } from "../lib/svg/layout";
import { svg } from "../lib/svg/markup";
import { wrapText } from "../lib/svg/text";
import type { CardTemplate } from "../types/card";
import type { QuoteContent } from "../types/content";
import { finishCard, PAPER_STYLE } from "./shared";

export const quoteTemplate: CardTemplate<QuoteContent> = {
  id: "quote",
  name: "Quote",
  category: "creative",
  description: "A line worth repeating, set in large editorial type.",
  defaultFilename: "quote-card",
  variants: [
    { value: "mark", label: "Quotation mark" },
    { value: "rule", label: "Side rule" },
    { value: "plain", label: "Plain" },
  ],
  defaultConfig: {
    variant: "mark",
    content: {
      quote:
        "The Analytical Engine weaves algebraic patterns just as the Jacquard loom weaves flowers and leaves.",
      author: "Ada Lovelace",
      attribution: "Notes on the Analytical Engine, 1843",
      showAuthor: true,
      showAttribution: true,
      italic: false,
    },
    style: {
      ...PAPER_STYLE,
      width: 560,
      padding: 36,
      fontSize: 14,
      lineHeight: 1.25,
      gap: 16,
    },
  },
  altText: (config) => (config.content.author ? `Quote by ${config.content.author}` : "Quote card"),
  render: (config, options) => {
    const { content: c, style: s, variant } = config;
    const ctx = new RenderContext(options.idPrefix, s);
    const t = typeScale(s);
    const inner = Math.max(40, s.width - s.padding * 2);
    // Side rule beside left/right aligned text; centred text gets a short rule above instead.
    const ruled = variant === "rule" && s.align !== "center";
    const topRule = variant === "rule" && s.align === "center";
    const ruleSpace = ruled ? Math.round(t.base * 1.4) : 0;
    const ruleOnRight = ruled && s.align === "right";
    const left = s.padding + (ruled && !ruleOnRight ? ruleSpace : 0);
    const width = inner - ruleSpace;
    const anchor = ANCHOR[s.align];
    const x = ctx.alignX(left, width);

    const quoteSize = Math.round(t.title * 1.05);
    const quoteStyle = {
      font: s.displayFont,
      size: quoteSize,
      weight: s.titleWeight,
      italic: c.italic,
    };
    const quoteLh = Math.round(quoteSize * s.lineHeight * 10) / 10;
    const lines = wrapText(c.quote.trim() || "…", quoteStyle, width, 9);

    const quoteBlocks: Block[] = [];
    if (topRule) {
      quoteBlocks.push({
        height: 3,
        render: (top) =>
          svg`<rect x="${left + width / 2 - 16}" y="${top}" width="32" height="3" fill="${s.accent}"/>`,
      });
    }
    if (variant === "mark") {
      const markSize = Math.round(quoteSize * 1.5);
      const markX =
        s.align === "center"
          ? left + (width - markSize) / 2
          : s.align === "right"
            ? left + width - markSize
            : left - markSize * 0.12;
      quoteBlocks.push({
        height: Math.round(markSize * 0.62),
        render: (top) => icon("quote", markX, top - markSize * 0.22, markSize, s.accent),
      });
    }
    quoteBlocks.push({
      height: lines.length * quoteLh,
      render: (top) =>
        textLines(ctx, {
          x,
          top,
          lines,
          style: quoteStyle,
          lineHeight: quoteLh,
          fill: s.text,
          anchor,
        }),
    });

    const byline: Block[] = [];
    if (c.showAuthor && c.author.trim()) {
      const style = { font: s.bodyFont, size: t.base, weight: 600 };
      const authorLines = wrapText(`— ${c.author.trim()}`, style, width, 2);
      byline.push({
        height: authorLines.length * t.lineHeight,
        render: (top) =>
          textLines(ctx, {
            x,
            top,
            lines: authorLines,
            style,
            lineHeight: Math.round(t.base * 1.45),
            fill: s.text,
            anchor,
          }),
      });
    }
    if (c.showAttribution && c.attribution.trim()) {
      const style = { font: s.bodyFont, size: t.small, weight: 400 };
      const lh = Math.round(t.small * 1.45);
      const attrLines = wrapText(c.attribution.trim(), style, width, 2);
      byline.push({
        height: attrLines.length * lh,
        render: (top) =>
          textLines(ctx, {
            x,
            top,
            lines: attrLines,
            style,
            lineHeight: lh,
            fill: s.text,
            opacity: t.muted,
            anchor,
          }),
      });
    }

    const blocks: Block[] = [...quoteBlocks];
    if (byline.length > 0) {
      if (s.showDivider) {
        blocks.push(divider(ctx, left, width));
      }
      blocks.push({
        height: stackHeight(byline, 2),
        marginTop: Math.round(s.gap * 0.25),
        render: (top) => renderStack(byline, top, 2),
      });
    }
    const quoteHeight = stackHeight(quoteBlocks, s.gap);
    return finishCard(ctx, {
      contentHeight: stackHeight(blocks, s.gap),
      render: (top) => {
        const rule = ruled
          ? svg`<rect x="${ruleOnRight ? s.padding + inner - 3 : s.padding}" y="${top}" width="3" height="${quoteHeight}" fill="${s.accent}"/>`
          : svg``;
        return svg`${rule}${renderStack(blocks, top, s.gap)}`;
      },
      title: c.author ? `Quote by ${c.author}` : "Quote card",
      description: c.quote,
    });
  },
};
