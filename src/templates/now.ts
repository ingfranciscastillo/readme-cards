import { ANCHOR, fontAttrs, opacityAttr, RenderContext, typeScale } from "../lib/svg/context";
import { type FlowItem, flow } from "../lib/svg/flow";
import { type IconName, icon } from "../lib/svg/icons";
import { type Block, divider, renderStack, stackHeight } from "../lib/svg/layout";
import { type SafeSvg, svg } from "../lib/svg/markup";
import { measureText, truncate, wrapText } from "../lib/svg/text";
import type { CardTemplate } from "../types/card";
import type { NowContent, NowIcon } from "../types/content";
import { emptyHint, finishCard, headingBlocks, PAPER_STYLE } from "./shared";

export const MAX_NOW_ITEMS = 6;

export const NOW_ICONS: { value: NowIcon; label: string; icon: IconName }[] = [
  { value: "building", label: "Building", icon: "code" },
  { value: "learning", label: "Learning", icon: "graduationCap" },
  { value: "reading", label: "Reading", icon: "openBook" },
  { value: "listening", label: "Listening", icon: "headset" },
  { value: "playing", label: "Playing", icon: "gamepad" },
  { value: "location", label: "Location", icon: "pin" },
  { value: "idea", label: "Idea", icon: "lightBulb" },
  { value: "other", label: "Other", icon: "sparks" },
];

function iconFor(value: string): IconName {
  return (NOW_ICONS.find((i) => i.value === value) ?? NOW_ICONS[NOW_ICONS.length - 1]).icon;
}

function visibleItems(c: NowContent) {
  return c.items
    .filter((item) => item.text.trim() || item.label.trim())
    .slice(0, MAX_NOW_ITEMS)
    .map((item) => ({
      label: item.label.trim(),
      text: item.text.trim(),
      icon: iconFor(item.icon),
    }));
}

export const nowTemplate: CardTemplate<NowContent> = {
  id: "now",
  name: "Now",
  category: "profile",
  description: "What you're building, learning and reading at the moment.",
  defaultFilename: "now-card",
  variants: [
    { value: "rows", label: "Rows" },
    { value: "columns", label: "Two columns" },
    { value: "compact", label: "Compact" },
  ],
  defaultConfig: {
    variant: "rows",
    content: {
      title: "Right now",
      subtitle: "What has my attention this season.",
      showTitle: true,
      showSubtitle: true,
      showIcons: true,
      items: [
        {
          id: "n1",
          icon: "building",
          label: "Building",
          text: "A compiler for the Analytical Engine",
        },
        { id: "n2", icon: "learning", label: "Learning", text: "Rust, slowly and with care" },
        { id: "n3", icon: "reading", label: "Reading", text: "Sketch of the Analytical Engine" },
        { id: "n4", icon: "location", label: "Based in", text: "London" },
      ],
    },
    style: { ...PAPER_STYLE, width: 480, padding: 26, gap: 14 },
  },
  altText: (config) => config.content.title || "Now card",
  render: (config, options) => {
    const { content: c, style: s, variant } = config;
    const ctx = new RenderContext(options.idPrefix, s);
    const t = typeScale(s);
    const left = s.padding;
    const width = Math.max(40, s.width - s.padding * 2);
    const anchor = ANCHOR[s.align];
    const x = ctx.alignX(left, width);
    const items = visibleItems(c);
    const blocks: Block[] = headingBlocks(ctx, c, { x, width, anchor });

    const labelStyle = { font: s.bodyFont, size: t.small, weight: 500 };
    const textStyle = { font: s.bodyFont, size: t.base, weight: 500 };
    const label = ctx.registerFont(labelStyle);
    const text = ctx.registerFont(textStyle);
    const iconSize = Math.round(t.base * 1.3);
    const iconGap = Math.round(t.base * 0.8);
    const lead = c.showIcons ? iconSize + iconGap : 0;

    if (blocks.length > 0 && items.length > 0 && s.showDivider && variant === "compact") {
      blocks.push(divider(ctx, left, width));
    }

    if (items.length === 0) {
      blocks.push(emptyHint(ctx, "Add an item to show it here.", x, anchor));
    } else if (variant === "compact") {
      // One line per item: icon, muted label, then the text, cut to fit.
      const rowHeight = Math.round(t.base * 1.9);
      const space = measureText(" ", textStyle);
      const rows: FlowItem[] = items.map((item) => {
        const labelText = item.label ? truncate(item.label, labelStyle, width * 0.4) : "";
        const labelWidth = labelText ? measureText(labelText, labelStyle) + space : 0;
        const body = truncate(item.text, textStyle, Math.max(20, width - lead - labelWidth));
        return {
          width: lead + labelWidth + measureText(body, textStyle),
          render: (ix, top, h) => {
            const mid = top + h / 2;
            const base = mid + text.size * 0.35;
            return svg`${c.showIcons ? icon(item.icon, ix, mid - iconSize / 2, iconSize, s.accent) : ""}${
              labelText
                ? svg`<text x="${ix + lead}" y="${base}"${fontAttrs(label)} fill="${s.text}"${opacityAttr(t.muted)}>${labelText}</text>`
                : ""
            }<text x="${ix + lead + labelWidth}" y="${base}"${fontAttrs(text)} fill="${s.text}">${body}</text>`;
          },
        };
      });
      blocks.push({
        height: rows.length * rowHeight,
        render: (top) =>
          svg`${rows.map((row, i) =>
            flow([row], { left, width, align: s.align, gap: 0, rowGap: 0, rowHeight }).render(
              top + i * rowHeight,
            ),
          )}`,
      });
    } else {
      // Rows (label above text) or two columns (label beside text), hairlines between.
      const columns = variant === "columns";
      const labelLh = Math.round(label.size * 1.5);
      const textLh = Math.round(text.size * s.lineHeight);
      const padY = Math.round(t.base * 0.85);
      const labelColumn = columns
        ? Math.min(
            Math.round(width * 0.38),
            Math.max(...items.map((i) => measureText(i.label, labelStyle))) + lead,
          ) + Math.round(t.base * 1.2)
        : 0;
      const textLeft = columns ? labelColumn : lead;
      const textWidth = Math.max(40, width - textLeft);

      const rows = items.map((item) => {
        const lines = wrapText(item.text || " ", textStyle, textWidth, columns ? 3 : 2);
        const labelText = truncate(
          item.label,
          labelStyle,
          Math.max(20, (columns ? labelColumn - Math.round(t.base * 1.2) : width) - lead),
        );
        const showLabel = !columns && labelText ? labelLh : 0;
        const height = padY * 2 + showLabel + lines.length * textLh;
        const render = (top: number): SafeSvg => {
          const contentTop = top + padY;
          const textTop = contentTop + showLabel;
          const first = (lineTop: number, lh: number, size: number) =>
            lineTop + (lh - size) / 2 + size * 0.8;
          const iconTop = columns
            ? textTop + (textLh - iconSize) / 2
            : contentTop + (showLabel + textLh - iconSize) / 2;
          const labelBase = columns
            ? first(textTop, textLh, text.size)
            : first(contentTop, labelLh, label.size);
          return svg`${c.showIcons ? icon(item.icon, left, iconTop, iconSize, s.accent) : ""}${
            labelText && (columns || showLabel)
              ? svg`<text x="${left + lead}" y="${labelBase}"${fontAttrs(label)} fill="${s.text}"${opacityAttr(t.muted)}>${labelText}</text>`
              : ""
          }<text${fontAttrs(text)} fill="${s.text}">${lines.map(
            (line, i) =>
              svg`<tspan x="${left + textLeft}" y="${first(textTop + i * textLh, textLh, text.size)}">${line}</tspan>`,
          )}</text>`;
        };
        return { height, render };
      });

      const topRule = blocks.length > 0 && s.showDivider;
      blocks.push({
        height: rows.reduce((sum, r) => sum + r.height, 0),
        marginTop: blocks.length > 0 ? -Math.round(s.gap * 0.3) : 0,
        render: (top) => {
          let y = top;
          return svg`${rows.map((row, i) => {
            const out = svg`${
              i > 0 || topRule
                ? svg`<rect x="${left}" y="${y}" width="${width}" height="1" fill="${s.border}"/>`
                : ""
            }${row.render(y)}`;
            y += row.height;
            return out;
          })}`;
        },
      });
    }

    return finishCard(ctx, {
      contentHeight: stackHeight(blocks, s.gap),
      render: (top) => renderStack(blocks, top, s.gap),
      title: c.title || "Now",
      description: items.map((i) => (i.label ? `${i.label}: ${i.text}` : i.text)).join(", "),
    });
  },
};
