import type { Align } from "../../types/card";
import { fontAttrs, opacityAttr, type RenderContext } from "./context";
import { type IconName, icon } from "./icons";
import type { Block } from "./layout";
import { type SafeSvg, svg } from "./markup";
import { measureText, type TextStyle, truncate } from "./text";

/** An inline item that flows left-to-right and wraps onto new rows. */
export interface FlowItem {
  width: number;
  render: (x: number, top: number, rowHeight: number) => SafeSvg;
}

export interface FlowOptions {
  left: number;
  width: number;
  align: Align;
  gap: number;
  rowGap: number;
  rowHeight: number;
  maxRows?: number;
}

export function flow(items: FlowItem[], o: FlowOptions): Block {
  const rows: FlowItem[][] = [];
  let row: FlowItem[] = [];
  let rowWidth = 0;
  for (const item of items) {
    const next = row.length === 0 ? item.width : rowWidth + o.gap + item.width;
    if (row.length > 0 && next > o.width) {
      rows.push(row);
      row = [item];
      rowWidth = item.width;
    } else {
      row.push(item);
      rowWidth = next;
    }
  }
  if (row.length > 0) rows.push(row);
  const visible = rows.slice(0, o.maxRows ?? rows.length);
  const height = visible.length * o.rowHeight + Math.max(0, visible.length - 1) * o.rowGap;

  return {
    height,
    render: (top) =>
      svg`${visible.map((r, i) => {
        const total = r.reduce((sum, it, j) => sum + it.width + (j > 0 ? o.gap : 0), 0);
        let x =
          o.align === "center"
            ? o.left + (o.width - total) / 2
            : o.align === "right"
              ? o.left + o.width - total
              : o.left;
        const rowTop = top + i * (o.rowHeight + o.rowGap);
        return r.map((it) => {
          const out = it.render(x, rowTop, o.rowHeight);
          x += it.width + o.gap;
          return out;
        });
      })}`,
  };
}

export interface LabelItemOptions {
  label: string;
  style: TextStyle;
  color: string;
  opacity?: number;
  icon?: IconName;
  iconColor?: string;
  iconOpacity?: number;
  /** A filled dot instead of an icon (e.g. repository language colour). */
  dot?: string;
  maxWidth: number;
}

/** Icon (or dot) followed by a label, vertically centred within the row. */
export function labelItem(ctx: RenderContext, o: LabelItemOptions): FlowItem {
  const s = ctx.registerFont(o.style);
  const iconSize = Math.round(s.size * 1.15);
  const lead = o.icon || o.dot ? iconSize + Math.round(s.size * 0.4) : 0;
  const label = truncate(o.label, o.style, Math.max(10, o.maxWidth - lead));
  const width = lead + measureText(label, o.style);
  return {
    width,
    render: (x, top, rowHeight) => {
      const mid = top + rowHeight / 2;
      const base = mid + s.size * 0.35;
      let lead_ = svg``;
      if (o.icon) {
        lead_ = icon(
          o.icon,
          x,
          mid - iconSize / 2,
          iconSize,
          o.iconColor ?? o.color,
          o.iconOpacity ?? o.opacity ?? 1,
        );
      } else if (o.dot) {
        lead_ = svg`<circle cx="${x + iconSize / 2}" cy="${mid}" r="${Math.round(s.size * 0.36 * 10) / 10}" fill="${o.dot}"/>`;
      }
      return svg`${lead_}<text x="${x + lead}" y="${base}"${fontAttrs(s)} fill="${o.color}"${opacityAttr(o.opacity)}>${label}</text>`;
    },
  };
}

export interface SegmentsItemOptions {
  segments: { text: string; style: TextStyle; color: string; opacity?: number }[];
}

/** Several differently styled runs on one baseline, e.g. "1.2k followers". */
export function segmentsItem(ctx: RenderContext, o: SegmentsItemOptions): FlowItem {
  // Leading spaces become an explicit offset: SVG collapses whitespace.
  const runs = o.segments.map((seg) => {
    const text = seg.text.trimStart();
    const lead = seg.text.length > text.length ? measureText(" ", seg.style) : 0;
    return {
      ...seg,
      text,
      lead,
      resolved: ctx.registerFont(seg.style),
      width: lead + measureText(text, seg.style),
    };
  });
  const width = runs.reduce((sum, r) => sum + r.width, 0);
  const size = Math.max(...runs.map((r) => r.resolved.size));
  return {
    width,
    render: (x, top, rowHeight) => {
      const base = top + rowHeight / 2 + size * 0.35;
      let cursor = x;
      return svg`${runs.map((r) => {
        const out = svg`<text x="${cursor + r.lead}" y="${base}"${fontAttrs(r.resolved)} fill="${r.color}"${opacityAttr(r.opacity)}>${r.text}</text>`;
        cursor += r.width;
        return out;
      })}`;
    },
  };
}
