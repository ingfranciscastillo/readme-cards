import { ANCHOR, RenderContext, textLines, typeScale } from "../lib/svg/context";
import { type FlowItem, flow, labelItem, segmentsItem } from "../lib/svg/flow";
import type { IconName } from "../lib/svg/icons";
import { type Block, divider, renderStack, stackHeight } from "../lib/svg/layout";
import { type SafeSvg, svg } from "../lib/svg/markup";
import { compactNumber, truncate, wrapText } from "../lib/svg/text";
import type { CardTemplate } from "../types/card";
import type { ProfileContent } from "../types/content";
import { finishCard, initials, isDataImage, PAPER_STYLE } from "./shared";
import { socialPlatform } from "./socials";

function avatarBlock(ctx: RenderContext, c: ProfileContent, x: number, size: number): Block {
  const s = ctx.style;
  const radius =
    c.avatarShape === "circle" ? size / 2 : c.avatarShape === "rounded" ? size * 0.2 : 0;
  return {
    height: size,
    render: (top) => {
      if (isDataImage(c.avatar)) {
        const clipId = ctx.id("avatar");
        ctx.addDef(
          svg`<clipPath id="${clipId}"><rect x="${x}" y="${top}" width="${size}" height="${size}" rx="${radius}"/></clipPath>`,
        );
        return svg`<image x="${x}" y="${top}" width="${size}" height="${size}" href="${c.avatar}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})"/><rect x="${x + 0.5}" y="${top + 0.5}" width="${size - 1}" height="${size - 1}" rx="${Math.max(0, radius - 0.5)}" fill="none" stroke="${s.text}" stroke-opacity="0.12"/>`;
      }
      // No image: a monogram drawn with vectors and text, always exportable.
      const font = ctx.registerFont({
        font: s.displayFont,
        size: size * 0.4,
        weight: s.titleWeight,
      });
      const label = initials(c.displayName || c.username || "?");
      return svg`<rect x="${x}" y="${top}" width="${size}" height="${size}" rx="${radius}" fill="${s.accent}"/>${textLines(
        ctx,
        {
          x: x + size / 2,
          top: top + size / 2 - font.size * 0.6,
          lines: [label],
          style: { font: s.displayFont, size: font.size, weight: s.titleWeight },
          lineHeight: font.size * 1.2,
          // "#fff", not "#ffffff": never one of the card colours that dark mode remaps.
          fill: s.transparent ? "#fff" : s.background,
          anchor: "middle",
        },
      )}`;
    },
  };
}

function textColumn(ctx: RenderContext, c: ProfileContent, left: number, width: number): Block[] {
  const s = ctx.style;
  const t = typeScale(s);
  const anchor = ANCHOR[s.align];
  const x = ctx.alignX(left, width);
  const blocks: Block[] = [];

  const name = c.displayName.trim() || c.username.trim();
  if (name) {
    const style = { font: s.displayFont, size: t.title, weight: s.titleWeight };
    const lines = wrapText(name, style, width, 2);
    const lh = Math.round(t.title * 1.15);
    blocks.push({
      height: lines.length * lh,
      render: (top) =>
        textLines(ctx, { x, top, lines, style, lineHeight: lh, fill: s.text, anchor }),
    });
  }

  if (c.showUsername && c.username.trim()) {
    const style = { font: s.bodyFont, size: t.base, weight: 500 };
    const label = truncate(`@${c.username.trim().replace(/^@/, "")}`, style, width);
    blocks.push({
      height: t.lineHeight,
      marginTop: -Math.round(s.gap * 0.5),
      render: (top) =>
        textLines(ctx, {
          x,
          top,
          lines: [label],
          style,
          lineHeight: t.lineHeight,
          fill: s.accent,
          anchor,
        }),
    });
  }

  if (c.showBio && c.bio.trim()) {
    const style = { font: s.bodyFont, size: t.base, weight: 400 };
    const lines = wrapText(c.bio.trim(), style, width, 5);
    blocks.push({
      height: lines.length * t.lineHeight,
      render: (top) =>
        textLines(ctx, {
          x,
          top,
          lines,
          style,
          lineHeight: t.lineHeight,
          fill: s.text,
          opacity: 0.86,
          anchor,
        }),
    });
  }

  const meta: FlowItem[] = [];
  const metaStyle = { font: s.bodyFont, size: t.small, weight: 400 };
  const item = (iconName: IconName, label: string) =>
    labelItem(ctx, {
      label,
      icon: iconName,
      style: metaStyle,
      color: s.text,
      opacity: t.muted,
      iconColor: s.accent,
      iconOpacity: 1,
      maxWidth: width,
    });
  if (c.showLocation && c.location.trim()) meta.push(item("pin", c.location.trim()));
  if (c.showWebsite && c.website.trim()) {
    meta.push(
      item(
        "link",
        c.website
          .trim()
          .replace(/^https?:\/\//, "")
          .replace(/\/$/, ""),
      ),
    );
  }
  if (c.showSocials) {
    for (const social of c.socials) {
      const handle = social.handle.trim();
      if (!handle) continue;
      meta.push(item(socialPlatform(social.platform).icon, handle));
    }
  }

  const stats: FlowItem[] = [];
  if (c.showStats) {
    const numStyle = { font: s.bodyFont, size: t.small, weight: 600 };
    const labelStyle = { font: s.bodyFont, size: t.small, weight: 400 };
    const entries: [number, string][] = [
      [c.followers, "followers"],
      [c.following, "following"],
      [c.repos, "repositories"],
    ];
    for (const [value, label] of entries) {
      stats.push(
        segmentsItem(ctx, {
          segments: [
            { text: compactNumber(value), style: numStyle, color: s.text },
            { text: ` ${label}`, style: labelStyle, color: s.text, opacity: t.muted },
          ],
        }),
      );
    }
  }

  const rowHeight = Math.round(t.small * 1.7);
  const footer: Block[] = [];
  if (meta.length > 0) {
    footer.push(
      flow(meta, {
        left,
        width,
        align: s.align,
        gap: Math.round(t.base * 1.1),
        rowGap: Math.round(s.gap * 0.35),
        rowHeight,
        maxRows: 3,
      }),
    );
  }
  if (stats.length > 0) {
    footer.push(
      flow(stats, {
        left,
        width,
        align: s.align,
        gap: Math.round(t.base * 1.1),
        rowGap: Math.round(s.gap * 0.35),
        rowHeight,
      }),
    );
  }
  if (footer.length > 0 && blocks.length > 0 && s.showDivider) {
    blocks.push(divider(ctx, left, width));
  }
  blocks.push(...footer);
  return blocks;
}

function render(config: Parameters<CardTemplate<ProfileContent>["render"]>[0], idPrefix: string) {
  const { content: c, style: s, variant } = config;
  const ctx = new RenderContext(idPrefix, s);
  const t = typeScale(s);
  const inner = Math.max(40, s.width - s.padding * 2);
  const showAvatar = c.showAvatar;

  if (variant === "stacked") {
    const size = Math.round(t.base * 5.4);
    const avatarX =
      s.align === "center"
        ? s.padding + (inner - size) / 2
        : s.align === "right"
          ? s.padding + inner - size
          : s.padding;
    const blocks = [
      ...(showAvatar ? [avatarBlock(ctx, c, avatarX, size)] : []),
      ...textColumn(ctx, c, s.padding, inner),
    ];
    const contentHeight = stackHeight(blocks, s.gap);
    return finishCard(ctx, {
      contentHeight,
      render: (top) => renderStack(blocks, top, s.gap),
      title: c.displayName || c.username || "Profile card",
      description: c.bio,
    });
  }

  // Side by side: the avatar sits in its own column; right alignment mirrors it.
  const size = Math.round(t.base * 5.6);
  const columnGap = Math.round(s.gap * 1.75);
  const textWidth = showAvatar ? Math.max(40, inner - size - columnGap) : inner;
  const mirrored = s.align === "right";
  const avatarX = mirrored ? s.padding + inner - size : s.padding;
  const textLeft = showAvatar && !mirrored ? s.padding + size + columnGap : s.padding;
  const column = textColumn(ctx, c, textLeft, textWidth);
  const columnHeight = stackHeight(column, s.gap);
  const avatar = showAvatar ? avatarBlock(ctx, c, avatarX, size) : null;
  const contentHeight = Math.max(columnHeight, avatar?.height ?? 0);

  return finishCard(ctx, {
    contentHeight,
    render: (top) => {
      const parts: SafeSvg[] = [];
      if (avatar) parts.push(avatar.render(top));
      // Centre short text columns against the avatar.
      const offset = avatar ? Math.max(0, (avatar.height - columnHeight) / 2) : 0;
      parts.push(renderStack(column, top + offset, s.gap));
      return svg`${parts}`;
    },
    title: c.displayName || c.username || "Profile card",
    description: c.bio,
  });
}

export const profileTemplate: CardTemplate<ProfileContent> = {
  id: "profile",
  name: "Profile",
  category: "profile",
  description: "Avatar, name, bio and the places people can find you.",
  defaultFilename: "profile-card",
  variants: [
    { value: "horizontal", label: "Side by side" },
    { value: "stacked", label: "Stacked" },
  ],
  defaultConfig: {
    variant: "horizontal",
    content: {
      displayName: "Ada Lovelace",
      username: "ada",
      bio: "Writing notes on the analytical engine. Interested in poetical science, looms and the first algorithms.",
      location: "London",
      website: "https://example.com",
      showAvatar: true,
      avatar: "",
      avatarShape: "circle",
      showUsername: true,
      showBio: true,
      showLocation: true,
      showWebsite: true,
      showSocials: true,
      socials: [{ id: "s1", platform: "github", handle: "ada" }],
      showStats: false,
      followers: 1840,
      following: 12,
      repos: 42,
    },
    style: { ...PAPER_STYLE, width: 540 },
  },
  altText: (config) =>
    `${config.content.displayName || config.content.username || "Profile"} profile card`,
  render: (config, options) => render(config, options.idPrefix),
};
