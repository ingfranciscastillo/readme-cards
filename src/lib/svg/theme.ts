import type { CardStyle } from "../../types/card";

/**
 * Dark mode works by recolouring, not re-rendering: templates draw with the
 * light colours, and a stylesheet maps each one to its dark counterpart by
 * matching the attribute value (`[fill="#f6f6f2"]{fill:#18191b}`). CSS beats
 * presentation attributes, so the same markup serves both themes and the
 * templates need no changes.
 */

const ROLES = ["background", "text", "accent", "border"] as const;
type Role = (typeof ROLES)[number];

const DARK_KEY = {
  background: "darkBackground",
  text: "darkText",
  accent: "darkAccent",
  border: "darkBorder",
} as const satisfies Record<Role, keyof CardStyle>;

/** Attributes that carry the card's colours, each matched by its CSS property. */
const COLOR_ATTRIBUTES = ["fill", "stroke", "stop-color", "color"];

function shiftBlue(hex: string, step: number): string {
  const blue = (Number.parseInt(hex.slice(5, 7), 16) + step) % 256;
  return `${hex.slice(0, 5)}${blue.toString(16).padStart(2, "0")}`;
}

/**
 * With dark mode on, lower-case the light colours and make them distinct: two
 * roles sharing a light colour could not map to different dark colours. A
 * clash moves one colour by a step of blue, which is invisible.
 */
export function withDistinctColors(style: CardStyle): CardStyle {
  if (!style.darkMode) return style;
  const out = { ...style };
  const used = new Set<string>();
  for (const role of ROLES) {
    const base = style[role].toLowerCase();
    let color = base;
    for (let step = 1; used.has(color); step += 1) color = shiftBlue(base, step);
    used.add(color);
    out[role] = color;
  }
  return out;
}

/** Light-to-dark colour pairs a card needs; empty when dark mode is off. */
export function darkColorMap(style: CardStyle): [string, string][] {
  if (!style.darkMode) return [];
  return ROLES.filter((role) => !(role === "background" && style.transparent))
    .map((role): [string, string] => [style[role], style[DARK_KEY[role]].toLowerCase()])
    .filter(([light, dark]) => light !== dark);
}

/** CSS rules recolouring elements inside `scope` (colours are validated hex). */
export function darkModeRules(pairs: [string, string][], scope: string): string {
  return pairs
    .flatMap(([light, dark]) =>
      COLOR_ATTRIBUTES.map((attr) => `${scope} [${attr}="${light}"]{${attr}:${dark}}`),
    )
    .join("");
}
