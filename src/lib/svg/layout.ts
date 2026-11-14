import type { CardStyle } from "../../types/card";
import type { RenderContext } from "./context";
import { type SafeSvg, svg } from "./markup";

/** A vertically stacked piece of content with a known height. */
export interface Block {
  height: number;
  render: (top: number) => SafeSvg;
  /** Extra space above this block in addition to the stack gap. */
  marginTop?: number;
}

export function stackHeight(blocks: Block[], gap: number): number {
  return blocks.reduce((sum, b, i) => sum + b.height + (i > 0 ? gap + (b.marginTop ?? 0) : 0), 0);
}

export function renderStack(blocks: Block[], top: number, gap: number): SafeSvg {
  let y = top;
  const out: SafeSvg[] = [];
  blocks.forEach((b, i) => {
    if (i > 0) y += gap + (b.marginTop ?? 0);
    out.push(b.render(y));
    y += b.height;
  });
  return svg`${out}`;
}

export function stackBlock(blocks: Block[], gap: number): Block {
  return { height: stackHeight(blocks, gap), render: (top) => renderStack(blocks, top, gap) };
}

/**
 * Card height and the top of the content box. With auto height the card hugs
 * its content; with a fixed height the content is centred vertically and
 * clipped to the card shape if it overflows.
 */
export function frameMetrics(style: CardStyle, contentHeight: number) {
  const height = style.autoHeight
    ? Math.max(40, Math.ceil(contentHeight + style.padding * 2))
    : Math.max(40, Math.round(style.height));
  const free = height - style.padding * 2 - contentHeight;
  const top = style.padding + (style.autoHeight ? 0 : Math.max(0, free / 2));
  return { height, top };
}

/** Background, border and a clip path matching the card's rounded shape. */
export function cardFrame(ctx: RenderContext, width: number, height: number) {
  const s = ctx.style;
  const bw = s.showBorder ? Math.max(0, s.borderWidth) : 0;
  const radius = Math.max(0, Math.min(s.radius, width / 2, height / 2));
  const clipId = ctx.id("clip");
  ctx.addDef(
    svg`<clipPath id="${clipId}"><rect width="${width}" height="${height}" rx="${radius}"/></clipPath>`,
  );
  const background = s.transparent
    ? svg``
    : svg`<rect width="${width}" height="${height}" rx="${radius}" fill="${s.background}"/>`;
  const border =
    bw > 0
      ? svg`<rect x="${bw / 2}" y="${bw / 2}" width="${width - bw}" height="${height - bw}" rx="${Math.max(0, radius - bw / 2)}" fill="none" stroke="${s.border}" stroke-width="${bw}"/>`
      : svg``;
  return { clipId, background, border };
}

export function divider(ctx: RenderContext, x: number, width: number): Block {
  return {
    height: 1,
    render: (top) =>
      svg`<rect x="${x}" y="${top}" width="${width}" height="1" fill="${ctx.style.border}"/>`,
  };
}

export function spacer(height: number): Block {
  return { height, render: () => svg`` };
}
