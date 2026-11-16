import { FONTS, isFontId } from "../lib/fonts";
import { ANCHOR, fontAttrs, opacityAttr, RenderContext, typeScale } from "../lib/svg/context";
import { type Block, renderStack, stackHeight } from "../lib/svg/layout";
import { type SafeSvg, svg } from "../lib/svg/markup";
import { measureText, wrapText } from "../lib/svg/text";
import type { CardTemplate, FontId } from "../types/card";
import type { InstallContent } from "../types/content";
import { emptyHint, finishCard, headingBlocks, PAPER_STYLE } from "./shared";

export const MAX_INSTALL_LINES = 14;

export interface InstallLine {
  kind: "command" | "comment";
  text: string;
}

/** Non-empty lines, with `#` lines marked as comments (their `#` removed). */
export function parseCommands(commands: string): InstallLine[] {
  return commands
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, MAX_INSTALL_LINES)
    .map((line) =>
      line.startsWith("#")
        ? { kind: "comment" as const, text: line.replace(/^#+\s*/, "") }
        : { kind: "command" as const, text: line },
    );
}

export function codeFontOf(c: InstallContent): FontId {
  return isFontId(c.codeFont) && FONTS[c.codeFont].kind === "mono" ? c.codeFont : "geist-mono";
}

interface Palette {
  text: string;
  /** Opacity of comments and the prompt. */
  dim: number;
  prompt: string;
  promptOpacity: number;
}

export const installTemplate: CardTemplate<InstallContent> = {
  id: "install",
  name: "Install",
  category: "repository",
  description: "Install or setup commands for a project README, in a terminal window.",
  defaultFilename: "install-card",
  variants: [
    { value: "terminal", label: "Terminal" },
    { value: "block", label: "Code block" },
    { value: "steps", label: "Steps" },
  ],
  defaultConfig: {
    variant: "terminal",
    content: {
      title: "Get started",
      subtitle: "Add svg-kit to any JavaScript project.",
      showTitle: true,
      showSubtitle: true,
      windowTitle: "bash",
      showPrompt: true,
      codeFont: "geist-mono",
      commands:
        "# Install the package\nnpm install svg-kit\n# Create a config file\nnpx svg-kit init",
    },
    style: { ...PAPER_STYLE, width: 540, padding: 26, gap: 16 },
  },
  altText: (config) => config.content.title || "Install card",
  render: (config, options) => {
    const { content: c, style: s, variant } = config;
    const ctx = new RenderContext(options.idPrefix, s);
    const t = typeScale(s);
    const left = s.padding;
    const width = Math.max(80, s.width - s.padding * 2);
    const anchor = ANCHOR[s.align];
    const x = ctx.alignX(left, width);
    const lines = parseCommands(c.commands);
    const blocks: Block[] = headingBlocks(ctx, c, { x, width, anchor });

    const codeStyle = { font: codeFontOf(c), size: t.small, weight: 400 };
    const code = ctx.registerFont(codeStyle);
    const lh = Math.round(code.size * 1.7);
    const promptText = c.showPrompt ? "$" : "";
    const promptWidth = promptText ? measureText(`${promptText} `, codeStyle) : 0;
    const panelRadius = Math.min(s.radius, 10);

    /** Commands and comments as wrapped, coloured lines starting at (cx, top). */
    const codeLines = (items: InstallLine[], innerWidth: number, palette: Palette) => {
      const rendered = items.flatMap((item) => {
        const indent = item.kind === "command" ? promptWidth : 0;
        const text = item.kind === "comment" ? `# ${item.text}` : item.text;
        return wrapText(text, codeStyle, Math.max(20, innerWidth - indent), 3).map((line, i) => ({
          ...item,
          line,
          indent,
          first: i === 0,
        }));
      });
      return {
        height: rendered.length * lh,
        render: (cx: number, top: number): SafeSvg =>
          svg`${rendered.map((r, i) => {
            const base = top + i * lh + (lh - code.size) / 2 + code.size * 0.8;
            const dim = r.kind === "comment" ? palette.dim : undefined;
            return svg`${
              r.kind === "command" && r.first && promptText
                ? svg`<text x="${cx}" y="${base}"${fontAttrs(code)} fill="${palette.prompt}"${opacityAttr(palette.promptOpacity)}>${promptText}</text>`
                : ""
            }<text x="${cx + r.indent}" y="${base}"${fontAttrs(code)} fill="${palette.text}"${opacityAttr(dim)}>${r.line}</text>`;
          })}`,
      };
    };

    if (lines.length === 0) {
      blocks.push(emptyHint(ctx, "Add a command to show it here.", x, anchor));
    } else if (variant === "steps") {
      // A `#` comment starts a numbered step and becomes its caption.
      const steps: { caption: string; commands: InstallLine[] }[] = [];
      for (const line of lines) {
        if (line.kind === "comment" || steps.length === 0) {
          steps.push({ caption: line.kind === "comment" ? line.text : "", commands: [] });
        }
        if (line.kind === "command") steps[steps.length - 1].commands.push(line);
      }
      const numberStyle = { font: s.bodyFont, size: t.small, weight: 600 };
      const captionStyle = { font: s.bodyFont, size: t.base, weight: 500 };
      const num = ctx.registerFont(numberStyle);
      const caption = ctx.registerFont(captionStyle);
      const badge = Math.round(t.base * 1.75);
      const textLeft = badge + Math.round(t.base * 0.85);
      const innerWidth = width - textLeft;
      const boxPad = Math.round(code.size * 0.9);
      const captionLh = Math.round(caption.size * 1.4);
      const stepGap = Math.round(s.gap * 1.1);
      const palette: Palette = { text: s.text, dim: 0.55, prompt: s.accent, promptOpacity: 1 };

      const rendered = steps.map((step, index) => {
        const captionLines = step.caption
          ? wrapText(step.caption, captionStyle, innerWidth, 2)
          : [];
        const captionHeight = captionLines.length * captionLh;
        const body = codeLines(step.commands, innerWidth - boxPad * 2, palette);
        const boxHeight = step.commands.length > 0 ? body.height + boxPad * 1.2 : 0;
        const between = captionHeight && boxHeight ? Math.round(t.base * 0.5) : 0;
        const height = Math.max(badge, captionHeight + between + boxHeight);
        const render = (top: number): SafeSvg => {
          const boxTop = top + captionHeight + between;
          return svg`<circle cx="${left + badge / 2}" cy="${top + badge / 2}" r="${badge / 2}" fill="${s.accent}" fill-opacity="0.12"/><text x="${left + badge / 2}" y="${top + badge / 2 + num.size * 0.35}"${fontAttrs(num)} fill="${s.accent}" text-anchor="middle">${index + 1}</text><text${fontAttrs(caption)} fill="${s.text}">${captionLines.map(
            (line, i) =>
              svg`<tspan x="${left + textLeft}" y="${top + i * captionLh + (captionLh - caption.size) / 2 + caption.size * 0.8 + (badge - captionLh) / 2}">${line}</tspan>`,
          )}</text>${
            boxHeight
              ? svg`<rect x="${left + textLeft}" y="${boxTop}" width="${innerWidth}" height="${boxHeight}" rx="${Math.min(panelRadius, 8)}" fill="${s.accent}" fill-opacity="0.07"/>${body.render(left + textLeft + boxPad, boxTop + boxPad * 0.6)}`
              : ""
          }`;
        };
        return { height, render };
      });
      blocks.push({
        height: rendered.reduce((sum, r) => sum + r.height, 0) + stepGap * (rendered.length - 1),
        render: (top) => {
          let y = top;
          return svg`${rendered.map((r) => {
            const out = r.render(y);
            y += r.height + stepGap;
            return out;
          })}`;
        },
      });
    } else {
      const terminal = variant === "terminal";
      const padX = Math.round(code.size * 1.35);
      const padY = Math.round(code.size * 1.1);
      const bar = terminal ? Math.round(code.size * 2.5) : 0;
      // The terminal inverts the card colours, so dark mode inverts it back.
      const palette: Palette = terminal
        ? { text: s.background, dim: 0.55, prompt: s.background, promptOpacity: 0.55 }
        : { text: s.text, dim: 0.55, prompt: s.accent, promptOpacity: 1 };
      const body = codeLines(lines, width - padX * 2, palette);
      const titleStyle = { font: s.bodyFont, size: t.eyebrow, weight: 500 };
      const titleFont = ctx.registerFont(titleStyle);
      blocks.push({
        height: bar + padY * 2 + body.height,
        render: (top) => {
          const height = bar + padY * 2 + body.height;
          const panel = terminal
            ? svg`<rect x="${left}" y="${top}" width="${width}" height="${height}" rx="${panelRadius}" fill="${s.text}"/>`
            : svg`<rect x="${left + 0.5}" y="${top + 0.5}" width="${width - 1}" height="${height - 1}" rx="${panelRadius}" fill="${s.accent}" fill-opacity="0.06" stroke="${s.border}"/>`;
          const dotR = Math.round(code.size * 0.3 * 10) / 10;
          const chrome = terminal
            ? svg`${[0, 1, 2].map(
                (i) =>
                  svg`<circle cx="${left + padX + dotR + i * dotR * 3.4}" cy="${top + bar / 2}" r="${dotR}" fill="${s.background}" fill-opacity="0.28"/>`,
              )}${
                c.windowTitle.trim()
                  ? svg`<text x="${left + width / 2}" y="${top + bar / 2 + titleFont.size * 0.35}"${fontAttrs(titleFont)} fill="${s.background}" fill-opacity="0.55" text-anchor="middle">${c.windowTitle.trim().slice(0, 40)}</text>`
                  : ""
              }<rect x="${left}" y="${top + bar}" width="${width}" height="1" fill="${s.background}" fill-opacity="0.12"/>`
            : svg``;
          return svg`${panel}${chrome}${body.render(left + padX, top + bar + padY)}`;
        },
      });
    }

    return finishCard(ctx, {
      contentHeight: stackHeight(blocks, s.gap),
      render: (top) => renderStack(blocks, top, s.gap),
      title: c.title || "Install",
      description: lines
        .filter((l) => l.kind === "command")
        .map((l) => l.text)
        .join("; "),
    });
  },
};
