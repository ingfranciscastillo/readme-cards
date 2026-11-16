import { ANCHOR, fontAttrs, opacityAttr, RenderContext, typeScale } from "../lib/svg/context";
import { type IconName, icon } from "../lib/svg/icons";
import { type Block, divider, renderStack, stackHeight } from "../lib/svg/layout";
import { type SafeSvg, svg } from "../lib/svg/markup";
import { measureText, truncate, wrapText } from "../lib/svg/text";
import type { CardTemplate } from "../types/card";
import type { FeatureIcon, FeaturesContent } from "../types/content";
import { emptyHint, finishCard, headingBlocks, PAPER_STYLE } from "./shared";

export const MAX_FEATURES = 6;

export const FEATURE_ICONS: { value: FeatureIcon; label: string; icon: IconName }[] = [
  { value: "fast", label: "Fast", icon: "flash" },
  { value: "secure", label: "Secure", icon: "shieldCheck" },
  { value: "plugins", label: "Plugins", icon: "puzzle" },
  { value: "code", label: "Code", icon: "code" },
  { value: "design", label: "Design", icon: "palette" },
  { value: "global", label: "Global", icon: "globe" },
  { value: "data", label: "Data", icon: "database" },
  { value: "cloud", label: "Cloud", icon: "cloud" },
  { value: "mobile", label: "Mobile", icon: "phone" },
  { value: "package", label: "Package", icon: "package" },
  { value: "accessible", label: "Accessible", icon: "accessibility" },
  { value: "check", label: "Check", icon: "checkCircle" },
];

function iconFor(value: string): IconName {
  return (FEATURE_ICONS.find((i) => i.value === value) ?? FEATURE_ICONS[0]).icon;
}

function visibleFeatures(c: FeaturesContent) {
  return c.items
    .filter((item) => item.title.trim() || item.text.trim())
    .slice(0, MAX_FEATURES)
    .map((item) => ({
      title: item.title.trim(),
      text: item.text.trim(),
      icon: iconFor(item.icon),
    }));
}

const first = (top: number, lh: number, size: number) => top + (lh - size) / 2 + size * 0.8;

export const featuresTemplate: CardTemplate<FeaturesContent> = {
  id: "features",
  name: "Features",
  category: "repository",
  description: "What a project does well, as icons with a title and a line each.",
  defaultFilename: "features-card",
  variants: [
    { value: "grid", label: "Grid" },
    { value: "list", label: "List" },
    { value: "checks", label: "Checklist" },
  ],
  defaultConfig: {
    variant: "grid",
    content: {
      title: "Why svg-kit",
      subtitle: "Small on purpose, and it renders the same everywhere.",
      showTitle: true,
      showSubtitle: true,
      items: [
        { id: "f1", icon: "fast", title: "Fast", text: "Renders a card in under a millisecond." },
        { id: "f2", icon: "package", title: "No dependencies", text: "One small file to ship." },
        { id: "f3", icon: "secure", title: "Escaped", text: "User text can never break the SVG." },
        {
          id: "f4",
          icon: "accessible",
          title: "Accessible",
          text: "Every card has a title and description.",
        },
      ],
    },
    style: { ...PAPER_STYLE, width: 560, padding: 26, gap: 16 },
  },
  altText: (config) => config.content.title || "Features card",
  render: (config, options) => {
    const { content: c, style: s, variant } = config;
    const ctx = new RenderContext(options.idPrefix, s);
    const t = typeScale(s);
    const left = s.padding;
    const width = Math.max(60, s.width - s.padding * 2);
    const anchor = ANCHOR[s.align];
    const x = ctx.alignX(left, width);
    const items = visibleFeatures(c);
    const blocks: Block[] = headingBlocks(ctx, c, { x, width, anchor });
    if (blocks.length > 0 && items.length > 0 && s.showDivider) {
      blocks.push(divider(ctx, left, width));
    }

    const titleStyle = { font: s.bodyFont, size: t.base, weight: 600 };
    const textStyle = { font: s.bodyFont, size: t.small, weight: 400 };
    const title = ctx.registerFont(titleStyle);
    const text = ctx.registerFont(textStyle);
    const titleLh = Math.round(title.size * 1.4);
    const textLh = Math.round(text.size * s.lineHeight);
    const box = Math.round(t.base * 2.3);
    const iconSize = Math.round(box * 0.55);
    const tile = (ix: number, iy: number, name: IconName) =>
      svg`<rect x="${ix}" y="${iy}" width="${box}" height="${box}" rx="${Math.min(s.radius, box / 2)}" fill="${s.accent}" fill-opacity="0.1"/>${icon(name, ix + (box - iconSize) / 2, iy + (box - iconSize) / 2, iconSize, s.accent)}`;

    if (items.length === 0) {
      blocks.push(emptyHint(ctx, "Add a feature to show it here.", x, anchor));
    } else if (variant === "checks") {
      // One line each: check, title, then the description cut to fit.
      const rowHeight = Math.round(t.base * 1.95);
      const checkSize = Math.round(t.base * 1.2);
      const lead = checkSize + Math.round(t.base * 0.6);
      const space = measureText(" ", textStyle);
      blocks.push({
        height: items.length * rowHeight,
        render: (top) =>
          svg`${items.map((item, i) => {
            const mid = top + i * rowHeight + rowHeight / 2;
            const name = truncate(item.title, titleStyle, width - lead);
            const nameWidth = measureText(name, titleStyle);
            const room = width - lead - nameWidth - space * 2;
            const body = item.text && room > 30 ? truncate(item.text, textStyle, room) : "";
            return svg`${icon("checkCircle", left, mid - checkSize / 2, checkSize, s.accent)}<text x="${left + lead}" y="${mid + title.size * 0.35}"${fontAttrs(title)} fill="${s.text}">${name}</text>${
              body
                ? svg`<text x="${left + lead + nameWidth + space * 2}" y="${mid + title.size * 0.35}"${fontAttrs(text)} fill="${s.text}"${opacityAttr(t.muted)}>${body}</text>`
                : ""
            }`;
          })}`,
      });
    } else {
      const grid = variant === "grid";
      const columns = grid ? (width >= 600 ? 3 : 2) : 1;
      const colGap = Math.round(s.gap * 1.4);
      const cellWidth = (width - colGap * (columns - 1)) / columns;
      // Grid: icon above the text. List: icon beside it.
      const textLeft = grid ? 0 : box + Math.round(t.base * 0.9);
      const textWidth = Math.max(30, cellWidth - textLeft);
      const cells = items.map((item) => {
        const nameLines = item.title ? wrapText(item.title, titleStyle, textWidth, 2) : [];
        const bodyLines = item.text ? wrapText(item.text, textStyle, textWidth, 3) : [];
        const iconPart = grid ? box + Math.round(t.base * 0.75) : 0;
        const textHeight = nameLines.length * titleLh + bodyLines.length * textLh;
        const height = Math.max(grid ? 0 : box, iconPart + textHeight);
        const render = (cx: number, cy: number): SafeSvg => {
          const textTop = cy + iconPart;
          const bodyTop = textTop + nameLines.length * titleLh;
          return svg`${tile(cx, cy, item.icon)}<text${fontAttrs(title)} fill="${s.text}">${nameLines.map(
            (line, i) =>
              svg`<tspan x="${cx + textLeft}" y="${first(textTop + i * titleLh, titleLh, title.size)}">${line}</tspan>`,
          )}</text><text${fontAttrs(text)} fill="${s.text}"${opacityAttr(t.muted)}>${bodyLines.map(
            (line, i) =>
              svg`<tspan x="${cx + textLeft}" y="${first(bodyTop + i * textLh, textLh, text.size)}">${line}</tspan>`,
          )}</text>`;
        };
        return { height, render };
      });

      const rows: (typeof cells)[] = [];
      for (let i = 0; i < cells.length; i += columns) rows.push(cells.slice(i, i + columns));
      const rowHeights = rows.map((row) => Math.max(...row.map((cell) => cell.height)));
      const rowGap = grid ? Math.round(s.gap * 1.5) : Math.round(s.gap * 1.1);
      blocks.push({
        height: rowHeights.reduce((a, b) => a + b, 0) + rowGap * (rows.length - 1),
        render: (top) => {
          let y = top;
          return svg`${rows.map((row, r) => {
            const out = row.map((cell, col) => cell.render(left + col * (cellWidth + colGap), y));
            y += rowHeights[r] + rowGap;
            return out;
          })}`;
        },
      });
    }

    return finishCard(ctx, {
      contentHeight: stackHeight(blocks, s.gap),
      render: (top) => renderStack(blocks, top, s.gap),
      title: c.title || "Features",
      description: items.map((i) => (i.text ? `${i.title}: ${i.text}` : i.title)).join(", "),
    });
  },
};
