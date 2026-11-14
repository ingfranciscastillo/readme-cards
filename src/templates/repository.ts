import { ANCHOR, RenderContext, textLines, typeScale } from "../lib/svg/context";
import { type FlowItem, flow, labelItem, segmentsItem } from "../lib/svg/flow";
import { type Block, divider, renderStack, stackHeight } from "../lib/svg/layout";
import { type SafeSvg, svg } from "../lib/svg/markup";
import { compactNumber, measureText, truncate, wrapText } from "../lib/svg/text";
import type { CardTemplate } from "../types/card";
import type { RepositoryContent } from "../types/content";
import { finishCard, PAPER_STYLE } from "./shared";

function header(ctx: RenderContext, c: RepositoryContent, left: number, width: number): Block {
  const s = ctx.style;
  const t = typeScale(s);
  const size = Math.round(t.title * 0.82);
  const nameStyle = { font: s.displayFont, size, weight: s.titleWeight };
  const ownerStyle = { font: s.displayFont, size, weight: 400 };
  const owner = c.showOwner && c.owner.trim() ? `${c.owner.trim()}/` : "";
  const name = c.name.trim() || "repository";
  // The owner shrinks first; the repository name is the important part.
  const ownerText = owner ? truncate(owner, ownerStyle, width * 0.45) : "";
  const nameText = truncate(
    name,
    nameStyle,
    Math.max(20, width - measureText(ownerText, ownerStyle)),
  );
  const item = segmentsItem(ctx, {
    segments: [
      ...(ownerText ? [{ text: ownerText, style: ownerStyle, color: s.text, opacity: 0.55 }] : []),
      { text: nameText, style: nameStyle, color: s.text },
    ],
  });
  const lh = Math.round(size * 1.25);
  return flow([item], { left, width, align: s.align, gap: 0, rowGap: 0, rowHeight: lh });
}

function description(ctx: RenderContext, c: RepositoryContent, left: number, width: number) {
  const s = ctx.style;
  const t = typeScale(s);
  if (!c.showDescription || !c.description.trim()) return null;
  const style = { font: s.bodyFont, size: t.base, weight: 400 };
  const lines = wrapText(c.description.trim(), style, width, 4);
  const x = ctx.alignX(left, width);
  return {
    height: lines.length * t.lineHeight,
    render: (top: number) =>
      textLines(ctx, {
        x,
        top,
        lines,
        style,
        lineHeight: t.lineHeight,
        fill: s.text,
        opacity: 0.78,
        anchor: ANCHOR[s.align],
      }),
  } satisfies Block;
}

function classic(ctx: RenderContext, c: RepositoryContent) {
  const s = ctx.style;
  const t = typeScale(s);
  const left = s.padding;
  const width = Math.max(40, s.width - s.padding * 2);
  const blocks: Block[] = [header(ctx, c, left, width)];
  const desc = description(ctx, c, left, width);
  if (desc) blocks.push(desc);

  const metaStyle = { font: s.bodyFont, size: t.small, weight: 400 };
  const items: FlowItem[] = [];
  const common = { style: metaStyle, color: s.text, opacity: 0.72, maxWidth: width };
  if (c.showLanguage && c.language.trim()) {
    items.push(labelItem(ctx, { ...common, label: c.language.trim(), dot: c.languageColor }));
  }
  if (c.showStars) {
    items.push(
      labelItem(ctx, {
        ...common,
        label: compactNumber(c.stars),
        icon: "star",
        iconColor: s.accent,
      }),
    );
  }
  if (c.showForks) {
    items.push(
      labelItem(ctx, {
        ...common,
        label: compactNumber(c.forks),
        icon: "fork",
        iconColor: s.accent,
      }),
    );
  }
  if (c.showLicense && c.license.trim()) {
    items.push(
      labelItem(ctx, { ...common, label: c.license.trim(), icon: "page", iconColor: s.accent }),
    );
  }
  if (items.length > 0) {
    if (s.showDivider) blocks.push(divider(ctx, left, width));
    blocks.push(
      flow(items, {
        left,
        width,
        align: s.align,
        gap: Math.round(t.base * 1.3),
        rowGap: 4,
        rowHeight: Math.round(t.small * 1.7),
        maxRows: 2,
      }),
    );
  }
  return blocks;
}

function spotlight(ctx: RenderContext, c: RepositoryContent) {
  const s = ctx.style;
  const t = typeScale(s);
  const left = s.padding;
  const width = Math.max(40, s.width - s.padding * 2);
  const blocks: Block[] = [];
  const anchor = ANCHOR[s.align];
  const x = ctx.alignX(left, width);

  if (c.showOwner && c.owner.trim()) {
    const style = { font: s.bodyFont, size: t.eyebrow, weight: 500, tracking: t.eyebrow * 0.12 };
    const label = truncate(c.owner.trim().toUpperCase(), style, width);
    blocks.push({
      height: Math.round(t.eyebrow * 1.4),
      render: (top) =>
        textLines(ctx, {
          x,
          top,
          lines: [label],
          style,
          lineHeight: Math.round(t.eyebrow * 1.4),
          fill: s.accent,
          anchor,
        }),
    });
  }

  const titleStyle = {
    font: s.displayFont,
    size: Math.round(t.title * 1.25),
    weight: s.titleWeight,
  };
  const titleLines = wrapText(c.name.trim() || "repository", titleStyle, width, 2);
  const titleLh = Math.round(titleStyle.size * 1.1);
  blocks.push({
    height: titleLines.length * titleLh,
    marginTop: -Math.round(s.gap * 0.4),
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
  const desc = description(ctx, c, left, width);
  if (desc) blocks.push(desc);

  // Stats as equal columns: big figure above a small label.
  const cells: { value: string; label: string; dot?: string }[] = [];
  if (c.showStars) cells.push({ value: compactNumber(c.stars), label: "Stars" });
  if (c.showForks) cells.push({ value: compactNumber(c.forks), label: "Forks" });
  if (c.showLanguage && c.language.trim()) {
    cells.push({ value: c.language.trim(), label: "Language", dot: c.languageColor });
  }
  if (c.showLicense && c.license.trim()) cells.push({ value: c.license.trim(), label: "License" });

  if (cells.length > 0) {
    blocks.push(divider(ctx, left, width));
    const valueStyle = {
      font: s.displayFont,
      size: Math.round(t.base * 1.45),
      weight: s.titleWeight,
    };
    const labelStyle = {
      font: s.bodyFont,
      size: t.eyebrow,
      weight: 500,
      tracking: t.eyebrow * 0.1,
    };
    const valueLh = Math.round(valueStyle.size * 1.2);
    const labelLh = Math.round(t.eyebrow * 1.5);
    const cellAlign = s.align === "center" ? "center" : "left";
    // Columns hug their content and share leftover space; equal widths
    // (with truncation) only when the natural widths don't fit.
    const colGap = 16;
    const natural = cells.map((cell) =>
      Math.max(
        measureText(cell.label.toUpperCase(), labelStyle),
        measureText(cell.value, valueStyle) + (cell.dot ? Math.round(valueStyle.size * 0.75) : 0),
      ),
    );
    const naturalTotal = natural.reduce((a, b) => a + b, 0) + colGap * (cells.length - 1);
    const extra = (width - naturalTotal) / cells.length;
    const widths =
      extra >= 0
        ? natural.map((w) => w + extra)
        : cells.map(() => (width - colGap * (cells.length - 1)) / cells.length);
    const lefts = widths.map((_, i) =>
      widths.slice(0, i).reduce((sum, w) => sum + w + colGap, left),
    );
    blocks.push({
      height: labelLh + 2 + valueLh,
      marginTop: -Math.round(s.gap * 0.25),
      render: (top) =>
        svg`${cells.map((cell, i) => {
          const cellLeft = lefts[i];
          const inner = widths[i];
          const cx = ctx.alignX(cellLeft, inner, cellAlign);
          const cellAnchor = ANCHOR[cellAlign];
          const dotSpace = cell.dot ? Math.round(valueStyle.size * 0.75) : 0;
          const value = truncate(cell.value, valueStyle, inner - dotSpace);
          const parts: SafeSvg[] = [
            textLines(ctx, {
              x: cx,
              top,
              lines: [cell.label.toUpperCase()],
              style: labelStyle,
              lineHeight: labelLh,
              fill: s.text,
              opacity: 0.55,
              anchor: cellAnchor,
            }),
          ];
          if (cell.dot && cellAlign === "left") {
            parts.push(
              svg`<circle cx="${cellLeft + valueStyle.size * 0.2}" cy="${top + labelLh + 2 + valueLh / 2}" r="${Math.round(valueStyle.size * 0.2 * 10) / 10}" fill="${cell.dot}"/>`,
            );
          }
          parts.push(
            textLines(ctx, {
              x: cellAlign === "left" ? cx + dotSpace : cx,
              top: top + labelLh + 2,
              lines: [value],
              style: valueStyle,
              lineHeight: valueLh,
              fill: s.text,
              anchor: cellAnchor,
            }),
          );
          return parts;
        })}`,
    });
  }
  return blocks;
}

export const repositoryTemplate: CardTemplate<RepositoryContent> = {
  id: "repository",
  name: "Repository",
  category: "repository",
  description: "Name, description and the numbers that matter for a project.",
  defaultFilename: "repository-card",
  variants: [
    { value: "classic", label: "Classic" },
    { value: "spotlight", label: "Spotlight" },
  ],
  defaultConfig: {
    variant: "classic",
    content: {
      owner: "readme-cards",
      name: "svg-kit",
      description:
        "Small, dependency-free helpers for composing standalone SVG documents that render the same everywhere.",
      language: "TypeScript",
      languageColor: "#3178c6",
      stars: 2481,
      forks: 132,
      license: "MIT",
      showOwner: true,
      showDescription: true,
      showLanguage: true,
      showStars: true,
      showForks: true,
      showLicense: true,
    },
    style: {
      ...PAPER_STYLE,
      width: 480,
      displayFont: "geist",
      fontSize: 13,
      titleWeight: 600,
      padding: 24,
      showDivider: false,
    },
  },
  altText: (config) => `${config.content.name || "Repository"} repository card`,
  render: (config, options) => {
    const ctx = new RenderContext(options.idPrefix, config.style);
    const blocks =
      config.variant === "spotlight"
        ? spotlight(ctx, config.content)
        : classic(ctx, config.content);
    const gap = config.style.gap;
    const c = config.content;
    return finishCard(ctx, {
      contentHeight: stackHeight(blocks, gap),
      render: (top) => renderStack(blocks, top, gap),
      title: [c.owner, c.name].filter(Boolean).join("/") || "Repository card",
      description: c.description,
    });
  },
};
