import type { RenderContext } from "../lib/svg/context";
import { cardFrame, frameMetrics } from "../lib/svg/layout";
import { type SafeSvg, svg } from "../lib/svg/markup";
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
