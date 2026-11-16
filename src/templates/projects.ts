import { ANCHOR, fontAttrs, opacityAttr, RenderContext, typeScale } from "../lib/svg/context";
import { icon } from "../lib/svg/icons";
import { type Block, divider, renderStack, stackHeight } from "../lib/svg/layout";
import { type SafeSvg, svg } from "../lib/svg/markup";
import { compactNumber, measureText, truncate, wrapText } from "../lib/svg/text";
import type { CardTemplate } from "../types/card";
import type { ProjectsContent } from "../types/content";
import { emptyHint, finishCard, headingBlocks, PAPER_STYLE } from "./shared";

export const MAX_PROJECTS = 6;

const HEX = /^#[0-9a-f]{6}$/i;

function visibleProjects(c: ProjectsContent) {
  return c.projects
    .filter((p) => p.name.trim())
    .slice(0, MAX_PROJECTS)
    .map((p) => ({
      name: p.name.trim(),
      description: p.description.trim(),
      language: p.language.trim(),
      color: HEX.test(p.languageColor) ? p.languageColor : "#8b8b85",
      stars: Math.max(0, Math.round(p.stars || 0)),
    }));
}

const first = (top: number, lh: number, size: number) => top + (lh - size) / 2 + size * 0.8;

export const projectsTemplate: CardTemplate<ProjectsContent> = {
  id: "projects",
  name: "Projects",
  category: "profile",
  description: "A few repositories side by side, like pinned projects on a profile.",
  defaultFilename: "projects-card",
  variants: [
    { value: "grid", label: "Grid" },
    { value: "list", label: "List" },
  ],
  defaultConfig: {
    variant: "grid",
    content: {
      title: "Things I've built",
      subtitle: "Small tools I still maintain.",
      showTitle: true,
      showSubtitle: false,
      showDescription: true,
      showLanguage: true,
      showStars: true,
      projects: [
        {
          id: "p1",
          name: "svg-kit",
          description: "Dependency-free helpers for standalone SVG documents.",
          language: "TypeScript",
          languageColor: "#3178c6",
          stars: 2480,
        },
        {
          id: "p2",
          name: "loom",
          description: "A pattern language for Jacquard looms.",
          language: "Rust",
          languageColor: "#dea584",
          stars: 912,
        },
        {
          id: "p3",
          name: "engine-notes",
          description: "Annotated notes on the Analytical Engine.",
          language: "Python",
          languageColor: "#3572a5",
          stars: 341,
        },
        {
          id: "p4",
          name: "bernoulli",
          description: "The first published algorithm, runnable.",
          language: "Go",
          languageColor: "#00add8",
          stars: 128,
        },
      ],
    },
    style: { ...PAPER_STYLE, width: 640, padding: 26, gap: 16 },
  },
  altText: (config) => config.content.title || "Projects card",
  render: (config, options) => {
    const { content: c, style: s, variant } = config;
    const ctx = new RenderContext(options.idPrefix, s);
    const t = typeScale(s);
    const left = s.padding;
    const width = Math.max(80, s.width - s.padding * 2);
    const anchor = ANCHOR[s.align];
    const x = ctx.alignX(left, width);
    const projects = visibleProjects(c);
    const blocks: Block[] = headingBlocks(ctx, c, { x, width, anchor });
    if (blocks.length > 0 && projects.length > 0 && s.showDivider && variant === "grid") {
      blocks.push(divider(ctx, left, width));
    }

    const nameStyle = { font: s.bodyFont, size: t.base, weight: 600 };
    const descStyle = { font: s.bodyFont, size: t.small, weight: 400 };
    const metaStyle = { font: s.bodyFont, size: t.eyebrow + 0.6, weight: 400 };
    const name = ctx.registerFont(nameStyle);
    const desc = ctx.registerFont(descStyle);
    const meta = ctx.registerFont(metaStyle);
    const nameLh = Math.round(name.size * 1.45);
    const descLh = Math.round(desc.size * s.lineHeight);
    const metaLh = Math.round(meta.size * 1.8);
    const iconSize = Math.round(name.size * 1.1);
    const iconGap = Math.round(name.size * 0.45);

    /** Language dot and star count; returns null when neither is shown. */
    const metaRow = (p: (typeof projects)[number], mx: number, base: number): SafeSvg | null => {
      const parts: SafeSvg[] = [];
      let cursor = mx;
      if (c.showLanguage && p.language) {
        const r = Math.round(meta.size * 0.36 * 10) / 10;
        parts.push(
          svg`<circle cx="${cursor + r}" cy="${base - meta.size * 0.35}" r="${r}" fill="${p.color}"/><text x="${cursor + r * 2 + 5}" y="${base}"${fontAttrs(meta)} fill="${s.text}"${opacityAttr(0.72)}>${p.language}</text>`,
        );
        cursor += r * 2 + 5 + measureText(p.language, metaStyle) + Math.round(meta.size * 1.2);
      }
      if (c.showStars) {
        const size = Math.round(meta.size * 1.15);
        parts.push(
          svg`${icon("star", cursor, base - meta.size * 0.35 - size / 2, size, s.text, 0.72)}<text x="${cursor + size + 4}" y="${base}"${fontAttrs(meta)} fill="${s.text}"${opacityAttr(0.72)}>${compactNumber(p.stars)}</text>`,
        );
      }
      return parts.length > 0 ? svg`${parts}` : null;
    };
    const hasMeta = (p: (typeof projects)[number]) =>
      (c.showLanguage && Boolean(p.language)) || c.showStars;

    if (projects.length === 0) {
      blocks.push(emptyHint(ctx, "Add a project to show it here.", x, anchor));
    } else if (variant === "list") {
      // Rows: name, description, then language and stars, hairlines between.
      const padY = Math.round(t.base * 0.85);
      const rows = projects.map((p) => {
        const label = truncate(p.name, nameStyle, width - iconSize - iconGap);
        const lines =
          c.showDescription && p.description ? wrapText(p.description, descStyle, width, 2) : [];
        const metaHeight = hasMeta(p) ? metaLh : 0;
        const height = padY * 2 + nameLh + lines.length * descLh + metaHeight;
        const render = (top: number): SafeSvg => {
          const nameTop = top + padY;
          const descTop = nameTop + nameLh;
          const metaTop = descTop + lines.length * descLh;
          return svg`${icon("book", left, nameTop + (nameLh - iconSize) / 2, iconSize, s.accent)}<text x="${left + iconSize + iconGap}" y="${first(nameTop, nameLh, name.size)}"${fontAttrs(name)} fill="${s.accent}">${label}</text><text${fontAttrs(desc)} fill="${s.text}"${opacityAttr(t.muted)}>${lines.map(
            (line, i) =>
              svg`<tspan x="${left}" y="${first(descTop + i * descLh, descLh, desc.size)}">${line}</tspan>`,
          )}</text>${metaRow(p, left, first(metaTop, metaLh, meta.size))}`;
        };
        return { height, render };
      });
      blocks.push({
        height: rows.reduce((sum, r) => sum + r.height, 0),
        marginTop: blocks.length > 0 ? -Math.round(s.gap * 0.3) : 0,
        render: (top) => {
          let y = top;
          return svg`${rows.map((row, i) => {
            const out = svg`${
              i > 0
                ? svg`<rect x="${left}" y="${y}" width="${width}" height="1" fill="${s.border}"/>`
                : ""
            }${row.render(y)}`;
            y += row.height;
            return out;
          })}`;
        },
      });
    } else {
      // Grid: bordered tiles like pinned repositories, two or three per row.
      const columns = width >= 760 ? 3 : 2;
      const colGap = Math.round(s.gap * 0.9);
      const cellWidth = (width - colGap * (columns - 1)) / columns;
      const pad = Math.round(t.base * 1.05);
      const inner = Math.max(30, cellWidth - pad * 2);
      const descLines = projects.map((p) =>
        c.showDescription && p.description ? wrapText(p.description, descStyle, inner, 2) : [],
      );
      // Tiles in a row share a height, so the meta rows line up.
      const tiles = projects.map((p, i) => ({
        p,
        label: truncate(p.name, nameStyle, inner - iconSize - iconGap),
        lines: descLines[i],
      }));
      const rows: (typeof tiles)[] = [];
      for (let i = 0; i < tiles.length; i += columns) rows.push(tiles.slice(i, i + columns));
      const rowHeights = rows.map((row) => {
        const anyMeta = row.some((tile) => hasMeta(tile.p));
        const maxDesc = Math.max(...row.map((tile) => tile.lines.length));
        return pad * 2 + nameLh + maxDesc * descLh + (anyMeta ? metaLh + 4 : 0);
      });
      const radius = Math.min(s.radius, 8);
      blocks.push({
        height: rowHeights.reduce((a, b) => a + b, 0) + colGap * (rows.length - 1),
        render: (top) => {
          let y = top;
          return svg`${rows.map((row, r) => {
            const h = rowHeights[r];
            const out = row.map((tile, col) => {
              const cx = left + col * (cellWidth + colGap);
              const nameTop = y + pad;
              const descTop = nameTop + nameLh;
              const metaTop = y + h - pad - metaLh;
              return svg`<rect x="${cx + 0.5}" y="${y + 0.5}" width="${cellWidth - 1}" height="${h - 1}" rx="${radius}" fill="none" stroke="${s.border}"/>${icon("book", cx + pad, nameTop + (nameLh - iconSize) / 2, iconSize, s.accent)}<text x="${cx + pad + iconSize + iconGap}" y="${first(nameTop, nameLh, name.size)}"${fontAttrs(name)} fill="${s.accent}">${tile.label}</text><text${fontAttrs(desc)} fill="${s.text}"${opacityAttr(t.muted)}>${tile.lines.map(
                (line, i) =>
                  svg`<tspan x="${cx + pad}" y="${first(descTop + i * descLh, descLh, desc.size)}">${line}</tspan>`,
              )}</text>${metaRow(tile.p, cx + pad, first(metaTop, metaLh, meta.size))}`;
            });
            y += h + colGap;
            return out;
          })}`;
        },
      });
    }

    return finishCard(ctx, {
      contentHeight: stackHeight(blocks, s.gap),
      render: (top) => renderStack(blocks, top, s.gap),
      title: c.title || "Projects",
      description: projects
        .map((p) => (p.description ? `${p.name}: ${p.description}` : p.name))
        .join(", "),
    });
  },
};
