// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { toSvgDocument } from "../lib/svg/document";
import { validateSvg } from "../lib/svg/validate";
import type { FeaturesContent } from "../types/content";
import { FEATURE_ICONS, featuresTemplate, MAX_FEATURES } from "./features";

describe("feature icons", () => {
  it("have unique values", () => {
    const values = FEATURE_ICONS.map((i) => i.value);
    expect(new Set(values).size).toBe(values.length);
  });

  it("keep the original choices, so saved cards still match", () => {
    const values = FEATURE_ICONS.map((i) => i.value);
    for (const old of [
      "fast",
      "secure",
      "plugins",
      "code",
      "design",
      "global",
      "data",
      "cloud",
      "mobile",
      "package",
      "accessible",
      "check",
    ]) {
      expect(values).toContain(old);
    }
  });

  it("all render into a valid SVG", () => {
    for (let i = 0; i < FEATURE_ICONS.length; i += MAX_FEATURES) {
      const config = structuredClone(featuresTemplate.defaultConfig);
      config.content = {
        ...config.content,
        items: FEATURE_ICONS.slice(i, i + MAX_FEATURES).map((icon) => ({
          id: icon.value,
          icon: icon.value,
          title: icon.label,
          text: "",
        })),
      } satisfies FeaturesContent;
      const card = featuresTemplate.render(config, { idPrefix: "f" });
      const doc = toSvgDocument(card, { idPrefix: "f" });
      expect(validateSvg(doc)).toEqual({ valid: true, issues: [] });
      expect(card.body.value.match(/<g transform/g)?.length).toBe(config.content.items.length);
    }
  });
});
