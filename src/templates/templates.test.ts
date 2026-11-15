// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { COLOR_PRESETS, DARK_PRESETS } from "../components/editor/presets";
import { toSvgDocument } from "../lib/svg/document";
import { validateSvg } from "../lib/svg/validate";
import { sanitizeConfig } from "../state/sanitize";
import type { CardConfig, CardStyle } from "../types/card";
import { renderCard, TEMPLATES } from "./index";

const preset = (id: string) => COLOR_PRESETS.find((p) => p.id === id)?.colors;
const dark = (id: string) => DARK_PRESETS.find((p) => p.id === id)?.colors;

const SETUPS: Record<string, Partial<CardStyle>> = {
  light: { darkMode: false },
  adaptive: { ...preset("paper"), ...dark("ink"), darkMode: true },
  transparent: { ...preset("clear"), ...dark("github"), darkMode: true },
};

const cases = TEMPLATES.flatMap((template) =>
  template.variants.flatMap((variant) =>
    Object.entries(SETUPS).map(([setup, patch]) => ({ template, variant, setup, patch })),
  ),
);

function exportCard(config: CardConfig<unknown>, template = TEMPLATES[0]) {
  const card = renderCard(template, config, { idPrefix: "rc" });
  return { card, doc: toSvgDocument(card, { idPrefix: "rc", scheme: "auto" }) };
}

describe("template registry", () => {
  it("has unique ids", () => {
    const ids = TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(TEMPLATES.map((t) => [t.id, t] as const))(
    "%s defaults to one of its variants",
    (_, t) => {
      expect(t.variants.map((v) => v.value)).toContain(t.defaultConfig.variant);
    },
  );
});

describe.each(cases)("$template.id / $variant.value / $setup", ({ template, variant, patch }) => {
  const config = structuredClone(template.defaultConfig);
  config.variant = variant.value;
  Object.assign(config.style, patch);
  const { card, doc } = exportCard(config, template);

  it("exports a valid standalone SVG", () => {
    expect(validateSvg(doc)).toEqual({ valid: true, issues: [] });
    expect(card.width).toBeGreaterThan(0);
    expect(card.height).toBeGreaterThan(0);
  });

  it("includes dark-mode CSS only when dark mode is on", () => {
    if (config.style.darkMode) {
      expect(doc).toContain("@media (prefers-color-scheme:dark)");
      expect(doc).toContain('id="rc"');
    } else {
      expect(doc).not.toContain("<style");
      expect(doc).not.toContain('id="rc"');
    }
  });
});

describe("robustness", () => {
  it.each(TEMPLATES.map((t) => [t.id, t] as const))(
    "%s renders from empty or broken saved data",
    (_, template) => {
      for (const saved of [undefined, {}, { variant: "nope", style: { text: "red" } }]) {
        const config = sanitizeConfig(template, saved);
        expect(validateSvg(exportCard(config, template).doc).valid).toBe(true);
      }
    },
  );

  it.each(TEMPLATES.map((t) => [t.id, t] as const))(
    "%s escapes markup in text content",
    (_, template) => {
      const config = structuredClone(template.defaultConfig);
      const hostile = '<script>alert("x")</script> & </text>';
      const content = config.content as Record<string, unknown>;
      for (const [key, value] of Object.entries(content)) {
        if (typeof value === "string") content[key] = hostile;
      }
      const { doc } = exportCard(config, template);
      expect(validateSvg(doc)).toEqual({ valid: true, issues: [] });
      expect(doc).not.toContain("<script>");
    },
  );
});
