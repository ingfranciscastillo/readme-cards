import { describe, expect, it } from "vitest";
import { getTemplate } from "../templates";
import { STYLE_LIMITS } from "./limits";
import { sanitizeConfig, sanitizeStyle } from "./sanitize";

const template = getTemplate("profile");
const defaults = template.defaultConfig.style;

describe("sanitizeStyle", () => {
  it("returns the defaults for non-object input", () => {
    expect(sanitizeStyle(defaults, null)).toEqual(defaults);
    expect(sanitizeStyle(defaults, "oops")).toEqual(defaults);
  });

  it("keeps valid saved values", () => {
    const out = sanitizeStyle(defaults, { text: "#123456", darkText: "#abcdef", radius: 12 });
    expect(out).toMatchObject({ text: "#123456", darkText: "#abcdef", radius: 12 });
  });

  it("drops colours that are not six-digit hex, dark ones included", () => {
    const out = sanitizeStyle(defaults, {
      text: "red",
      accent: "#fff",
      darkBackground: "url(x)",
      darkBorder: "#12345g",
    });
    expect(out.text).toBe(defaults.text);
    expect(out.accent).toBe(defaults.accent);
    expect(out.darkBackground).toBe(defaults.darkBackground);
    expect(out.darkBorder).toBe(defaults.darkBorder);
  });

  it("clamps numbers to their limits and ignores wrong types", () => {
    const out = sanitizeStyle(defaults, { radius: 9999, padding: -5, width: "wide" });
    expect(out.radius).toBe(STYLE_LIMITS.radius.max);
    expect(out.padding).toBe(STYLE_LIMITS.padding.min);
    expect(out.width).toBe(defaults.width);
  });

  it("rejects unknown fonts and alignments", () => {
    const out = sanitizeStyle(defaults, { displayFont: "comic-sans", align: "justify" });
    expect(out.displayFont).toBe(defaults.displayFont);
    expect(out.align).toBe(defaults.align);
  });
});

describe("sanitizeConfig", () => {
  it("falls back to the default variant when the saved one is unknown", () => {
    expect(sanitizeConfig(template, { variant: "nope" }).variant).toBe(
      template.defaultConfig.variant,
    );
  });

  it("keeps a known variant", () => {
    expect(sanitizeConfig(template, { variant: "stacked" }).variant).toBe("stacked");
  });

  it("does not share objects with the defaults", () => {
    const out = sanitizeConfig(template, undefined);
    expect(out).toEqual(template.defaultConfig);
    expect(out.style).not.toBe(template.defaultConfig.style);
  });
});
