import { ANCHOR, fontAttrs, RenderContext, textLines, typeScale } from "../lib/svg/context";
import { flow, labelItem } from "../lib/svg/flow";
import { icon } from "../lib/svg/icons";
import { type Block, divider, renderStack, stackHeight } from "../lib/svg/layout";
import { svg } from "../lib/svg/markup";
import { truncate, wrapText } from "../lib/svg/text";
import type { CardTemplate } from "../types/card";
import type { ContactContent } from "../types/content";
import { finishCard, PAPER_STYLE } from "./shared";
import { socialPlatform } from "./socials";

export const MAX_CONTACT_LINKS = 10;

function visibleLinks(c: ContactContent) {
  return c.links
    .filter((l) => l.handle.trim())
    .slice(0, MAX_CONTACT_LINKS)
    .map((l) => ({ handle: l.handle.trim(), platform: socialPlatform(l.platform) }));
}

export const contactTemplate: CardTemplate<ContactContent> = {
  id: "contact",
  name: "Contact",
  category: "profile",
  description: "Where to find you: social profiles, email and website, with their icons.",
  defaultFilename: "contact-card",
  variants: [
    { value: "rows", label: "Rows" },
    { value: "grid", label: "Grid" },
    { value: "inline", label: "Inline" },
  ],
  defaultConfig: {
    variant: "rows",
    content: {
      title: "Find me online",
      subtitle: "Happy to talk about algorithms, looms and poetry.",
      showTitle: true,
      showSubtitle: true,
      showPlatform: true,
      links: [
        { id: "c1", platform: "github", handle: "ada" },
        { id: "c2", platform: "linkedin", handle: "linkedin.com/in/ada" },
        { id: "c3", platform: "mastodon", handle: "@ada@hachyderm.io" },
        { id: "c4", platform: "email", handle: "ada@example.com" },
        { id: "c5", platform: "link", handle: "example.com" },
      ],
    },
    style: { ...PAPER_STYLE, width: 460, padding: 26, gap: 14 },
  },
  altText: (config) => config.content.title || "Contact card",
  render: (config, options) => {
    const { content: c, style: s, variant } = config;
    const ctx = new RenderContext(options.idPrefix, s);
    const t = typeScale(s);
    const left = s.padding;
    const width = Math.max(40, s.width - s.padding * 2);
    const anchor = ANCHOR[s.align];
    const x = ctx.alignX(left, width);
    const links = visibleLinks(c);
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
    if (blocks.length > 0 && links.length > 0 && s.showDivider && variant !== "rows") {
      blocks.push(divider(ctx, left, width));
    }

    const handleStyle = { font: s.bodyFont, size: t.base, weight: 500 };
    const labelStyle = {
      font: s.bodyFont,
      size: t.eyebrow,
      weight: 500,
      tracking: t.eyebrow * 0.1,
    };

    if (links.length === 0) {
      const style = { font: s.bodyFont, size: t.small, weight: 400 };
      const lh = Math.round(t.small * 1.7);
      blocks.push({
        height: lh,
        render: (top) =>
          textLines(ctx, {
            x,
            top,
            lines: ["Add a link to show it here."],
            style,
            lineHeight: lh,
            fill: s.text,
            opacity: 0.6,
            anchor,
          }),
      });
    } else if (variant === "grid") {
      const columns = width >= 600 ? 3 : 2;
      const colGap = Math.round(s.gap * 1.2);
      const cellWidth = (width - colGap * (columns - 1)) / columns;
      const iconBox = Math.round(t.base * 2.4);
      const textLeft = iconBox + Math.round(t.base * 0.7);
      const textWidth = Math.max(20, cellWidth - textLeft);
      const label = ctx.registerFont(labelStyle);
      const handle = ctx.registerFont(handleStyle);
      const cellHeight = Math.max(iconBox, Math.round(label.size * 1.5 + handle.size * 1.45));
      const rowGap = Math.round(s.gap * 1.1);
      const rows = Math.ceil(links.length / columns);
      blocks.push({
        height: rows * cellHeight + (rows - 1) * rowGap,
        render: (top) =>
          svg`${links.map((l, i) => {
            const cx = left + (i % columns) * (cellWidth + colGap);
            const cy = top + Math.floor(i / columns) * (cellHeight + rowGap);
            const mid = cy + cellHeight / 2;
            const iconSize = Math.round(iconBox * 0.52);
            const text = truncate(l.handle, handleStyle, textWidth);
            const platformText = truncate(l.platform.label.toUpperCase(), labelStyle, textWidth);
            const both = c.showPlatform;
            const handleBase = both ? mid + handle.size * 0.95 : mid + handle.size * 0.35;
            return svg`<rect x="${cx}" y="${mid - iconBox / 2}" width="${iconBox}" height="${iconBox}" rx="${Math.min(s.radius, iconBox / 2)}" fill="${s.accent}" fill-opacity="0.1"/>${icon(
              l.platform.icon,
              cx + (iconBox - iconSize) / 2,
              mid - iconSize / 2,
              iconSize,
              s.accent,
            )}${
              both
                ? svg`<text x="${cx + textLeft}" y="${mid - label.size * 0.35}"${fontAttrs(label)} fill="${s.text}" fill-opacity="0.6">${platformText}</text>`
                : ""
            }<text x="${cx + textLeft}" y="${handleBase}"${fontAttrs(handle)} fill="${s.text}">${text}</text>`;
          })}`,
      });
    } else if (variant === "inline") {
      const style = { font: s.bodyFont, size: t.small, weight: 500 };
      blocks.push(
        flow(
          links.map((l) =>
            labelItem(ctx, {
              label: l.handle,
              icon: l.platform.icon,
              style,
              color: s.text,
              iconColor: s.accent,
              maxWidth: width,
            }),
          ),
          {
            left,
            width,
            align: s.align,
            gap: Math.round(t.base * 1.3),
            rowGap: Math.round(t.small * 0.4),
            rowHeight: Math.round(t.small * 1.8),
          },
        ),
      );
    } else {
      // Rows: icon and handle on the left, platform name on the right, hairlines between.
      const handle = ctx.registerFont(handleStyle);
      const label = ctx.registerFont(labelStyle);
      const rowHeight = Math.round(t.base * 2.6);
      const iconSize = Math.round(t.base * 1.3);
      const textLeft = left + iconSize + Math.round(t.base * 0.8);
      blocks.push({
        height: links.length * rowHeight,
        marginTop: blocks.length > 0 ? -Math.round(s.gap * 0.3) : 0,
        render: (top) =>
          svg`${links.map((l, i) => {
            const rowTop = top + i * rowHeight;
            const mid = rowTop + rowHeight / 2;
            const platformText = c.showPlatform ? l.platform.label.toUpperCase() : "";
            const reserve = platformText ? Math.round(t.base * 6) : 0;
            const text = truncate(
              l.handle,
              handleStyle,
              Math.max(20, left + width - textLeft - reserve),
            );
            return svg`${
              i > 0
                ? svg`<rect x="${left}" y="${rowTop}" width="${width}" height="1" fill="${s.border}"/>`
                : ""
            }${icon(l.platform.icon, left, mid - iconSize / 2, iconSize, s.accent)}<text x="${textLeft}" y="${mid + handle.size * 0.35}"${fontAttrs(handle)} fill="${s.text}">${text}</text>${
              platformText
                ? svg`<text x="${left + width}" y="${mid + label.size * 0.35}"${fontAttrs(label)} fill="${s.text}" fill-opacity="0.55" text-anchor="end">${platformText}</text>`
                : ""
            }`;
          })}`,
      });
    }

    return finishCard(ctx, {
      contentHeight: stackHeight(blocks, s.gap),
      render: (top) => renderStack(blocks, top, s.gap),
      title: c.title || "Contact",
      description: links.map((l) => `${l.platform.label}: ${l.handle}`).join(", "),
    });
  },
};
