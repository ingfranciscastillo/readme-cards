import { ANCHOR, RenderContext, textLines, typeScale } from "../lib/svg/context";
import { type Block, renderStack, stackHeight } from "../lib/svg/layout";
import { svg } from "../lib/svg/markup";
import { measureText, truncate, wrapText } from "../lib/svg/text";
import type { CardTemplate } from "../types/card";
import type { SectionContent } from "../types/content";
import { finishCard, PAPER_STYLE } from "./shared";

export const sectionTemplate: CardTemplate<SectionContent> = {
  id: "section",
  name: "Section title",
  category: "creative",
  description: "A heading in your card style, to split a long README into parts.",
  defaultFilename: "section-title",
  variants: [
    { value: "rule", label: "Rule below" },
    { value: "bar", label: "Side bar" },
    { value: "centered", label: "Centred lines" },
  ],
  defaultConfig: {
    variant: "rule",
    content: {
      title: "Projects",
      subtitle: "Things I've built and still look after.",
      showSubtitle: true,
    },
    // Transparent, so it sits on the README page; dark colours follow GitHub's dark theme.
    style: {
      ...PAPER_STYLE,
      transparent: true,
      showBorder: false,
      darkMode: true,
      darkBackground: "#0d1117",
      darkText: "#e6edf3",
      darkBorder: "#30363d",
      width: 840,
      padding: 12,
      gap: 10,
    },
  },
  altText: (config) => config.content.title || "Section title",
  render: (config, options) => {
    const { content: c, style: s, variant } = config;
    const ctx = new RenderContext(options.idPrefix, s);
    const t = typeScale(s);
    const left = s.padding;
    const width = Math.max(60, s.width - s.padding * 2);
    const blocks: Block[] = [];
    const titleText = c.title.trim() || "Section";
    const titleStyle = {
      font: s.displayFont,
      size: Math.round(t.title * 1.15),
      weight: s.titleWeight,
    };
    const titleLh = Math.round(titleStyle.size * 1.15);
    const subStyle = { font: s.bodyFont, size: t.base, weight: 400 };
    const subtitle = c.showSubtitle ? c.subtitle.trim() : "";

    if (variant === "centered") {
      // Title between two hairlines, subtitle centred beneath.
      const mid = left + width / 2;
      const space = Math.round(t.base * 1.2);
      const label = truncate(titleText, titleStyle, width - space * 2 - 40);
      const half = measureText(label, titleStyle) / 2 + space;
      blocks.push({
        height: titleLh,
        render: (top) => {
          const y = Math.round(top + titleLh / 2);
          const ruleWidth = Math.max(0, width / 2 - half);
          return svg`${
            ruleWidth > 0
              ? svg`<rect x="${left}" y="${y}" width="${ruleWidth}" height="1" fill="${s.border}"/><rect x="${mid + half}" y="${y}" width="${ruleWidth}" height="1" fill="${s.border}"/>`
              : ""
          }${textLines(ctx, { x: mid, top, lines: [label], style: titleStyle, lineHeight: titleLh, fill: s.text, anchor: "middle" })}`;
        },
      });
      if (subtitle) {
        const lines = wrapText(subtitle, subStyle, width * 0.8, 2);
        blocks.push({
          height: lines.length * t.lineHeight,
          render: (top) =>
            textLines(ctx, {
              x: mid,
              top,
              lines,
              style: subStyle,
              lineHeight: t.lineHeight,
              fill: s.text,
              opacity: t.muted,
              anchor: "middle",
            }),
        });
      }
    } else if (variant === "bar") {
      // A thick accent bar beside the title and subtitle.
      const barWidth = Math.max(3, Math.round(t.base * 0.3));
      const textLeft = left + barWidth + Math.round(t.base * 1.1);
      const textWidth = width - (textLeft - left);
      const titleLines = wrapText(titleText, titleStyle, textWidth, 2);
      const subLines = subtitle ? wrapText(subtitle, subStyle, textWidth, 2) : [];
      const between = subLines.length > 0 ? Math.round(s.gap * 0.5) : 0;
      const height = titleLines.length * titleLh + between + subLines.length * t.lineHeight;
      blocks.push({
        height,
        render: (top) =>
          svg`<rect x="${left}" y="${top}" width="${barWidth}" height="${height}" rx="${barWidth / 2}" fill="${s.accent}"/>${textLines(
            ctx,
            {
              x: textLeft,
              top,
              lines: titleLines,
              style: titleStyle,
              lineHeight: titleLh,
              fill: s.text,
            },
          )}${textLines(ctx, {
            x: textLeft,
            top: top + titleLines.length * titleLh + between,
            lines: subLines,
            style: subStyle,
            lineHeight: t.lineHeight,
            fill: s.text,
            opacity: t.muted,
          })}`,
      });
    } else {
      // Title and subtitle, then a hairline with a short accent run at the start.
      const anchor = ANCHOR[s.align];
      const x = ctx.alignX(left, width);
      const titleLines = wrapText(titleText, titleStyle, width, 2);
      blocks.push({
        height: titleLines.length * titleLh,
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
      if (subtitle) {
        const lines = wrapText(subtitle, subStyle, width, 2);
        blocks.push({
          height: lines.length * t.lineHeight,
          marginTop: -Math.round(s.gap * 0.4),
          render: (top) =>
            textLines(ctx, {
              x,
              top,
              lines,
              style: subStyle,
              lineHeight: t.lineHeight,
              fill: s.text,
              opacity: t.muted,
              anchor,
            }),
        });
      }
      const accentWidth = Math.min(width, Math.round(t.base * 4));
      const accentX =
        s.align === "center"
          ? left + (width - accentWidth) / 2
          : s.align === "right"
            ? left + width - accentWidth
            : left;
      blocks.push({
        height: 3,
        marginTop: Math.round(s.gap * 0.4),
        render: (top) =>
          svg`<rect x="${left}" y="${top + 1}" width="${width}" height="1" fill="${s.border}"/><rect x="${accentX}" y="${top}" width="${accentWidth}" height="3" rx="1.5" fill="${s.accent}"/>`,
      });
    }

    return finishCard(ctx, {
      contentHeight: stackHeight(blocks, s.gap),
      render: (top) => renderStack(blocks, top, s.gap),
      title: titleText,
      description: subtitle || titleText,
    });
  },
};
