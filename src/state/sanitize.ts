import { isFontId } from "../lib/fonts";
import type { CardConfig, CardStyle, CardTemplate } from "../types/card";
import { clamp, STYLE_LIMITS } from "./limits";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Take values from `saved` only where they match the type of the default, so
 * stale or hand-edited storage can never crash a template.
 */
function mergeShape<T extends object>(defaults: T, saved: unknown): T {
  if (!isRecord(saved)) return structuredClone(defaults);
  const out = structuredClone(defaults) as Record<string, unknown>;
  for (const [key, fallback] of Object.entries(defaults)) {
    const value = saved[key];
    if (Array.isArray(fallback)) {
      if (!Array.isArray(value)) continue;
      const shape = fallback[0];
      out[key] = isRecord(shape)
        ? value.filter(isRecord).map((item) => mergeShape(shape, item))
        : value.filter((item) => typeof item === typeof shape);
    } else if (typeof fallback === "number") {
      if (typeof value === "number" && Number.isFinite(value)) out[key] = value;
    } else if (typeof value === typeof fallback) {
      out[key] = value;
    }
  }
  return out as T;
}

const HEX = /^#[0-9a-f]{6}$/i;

export function sanitizeStyle(defaults: CardStyle, saved: unknown): CardStyle {
  const style = mergeShape(defaults, saved);
  for (const [key, limit] of Object.entries(STYLE_LIMITS)) {
    const k = key as keyof typeof STYLE_LIMITS;
    style[k] = clamp(style[k], limit.min, limit.max);
  }
  for (const key of [
    "background",
    "text",
    "accent",
    "border",
    "darkBackground",
    "darkText",
    "darkAccent",
    "darkBorder",
  ] as const) {
    if (!HEX.test(style[key])) style[key] = defaults[key];
  }
  if (!isFontId(style.displayFont)) style.displayFont = defaults.displayFont;
  if (!isFontId(style.bodyFont)) style.bodyFont = defaults.bodyFont;
  if (!["left", "center", "right"].includes(style.align)) style.align = defaults.align;
  return style;
}

export function sanitizeConfig(
  template: CardTemplate<unknown>,
  saved: unknown,
): CardConfig<unknown> {
  const defaults = template.defaultConfig;
  if (!isRecord(saved)) return structuredClone(defaults);
  const variant =
    typeof saved.variant === "string" && template.variants.some((v) => v.value === saved.variant)
      ? saved.variant
      : defaults.variant;
  return {
    variant,
    content: mergeShape(defaults.content as object, saved.content),
    style: sanitizeStyle(defaults.style, saved.style),
  };
}
