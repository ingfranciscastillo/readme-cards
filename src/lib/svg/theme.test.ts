import { describe, expect, it } from "vitest";
import { getTemplate, renderCard } from "../../templates";
import type { CardStyle } from "../../types/card";
import { toSvgDocument } from "./document";
import { darkColorMap, darkModeRules, withDistinctColors } from "./theme";

const base = getTemplate("profile").defaultConfig.style;
const style = (patch: Partial<CardStyle>): CardStyle => ({ ...base, ...patch });

describe("withDistinctColors", () => {
  it("leaves the style alone when dark mode is off", () => {
    const s = style({ darkMode: false, text: "#333333", border: "#333333" });
    expect(withDistinctColors(s)).toBe(s);
  });

  it("lower-cases colours", () => {
    const out = withDistinctColors(style({ darkMode: true, accent: "#ABCDEF" }));
    expect(out.accent).toBe("#abcdef");
  });

  it("separates roles that share a light colour by nudging blue", () => {
    const out = withDistinctColors(
      style({ darkMode: true, text: "#333333", border: "#333333", accent: "#333333" }),
    );
    const colors = [out.background, out.text, out.accent, out.border];
    expect(new Set(colors).size).toBe(4);
    for (const c of [out.text, out.accent, out.border]) expect(c.slice(0, 5)).toBe("#3333");
  });
});

describe("darkColorMap", () => {
  it("is empty when dark mode is off", () => {
    expect(darkColorMap(style({ darkMode: false }))).toEqual([]);
  });

  it("maps every role to its dark colour", () => {
    const pairs = darkColorMap(
      style({
        darkMode: true,
        transparent: false,
        background: "#ffffff",
        text: "#111111",
        accent: "#222222",
        border: "#333333",
        darkBackground: "#000000",
        darkText: "#EEEEEE",
        darkAccent: "#dddddd",
        darkBorder: "#cccccc",
      }),
    );
    expect(pairs).toEqual([
      ["#ffffff", "#000000"],
      ["#111111", "#eeeeee"],
      ["#222222", "#dddddd"],
      ["#333333", "#cccccc"],
    ]);
  });

  it("skips the background when it is transparent, and unchanged colours", () => {
    const pairs = darkColorMap(
      style({ darkMode: true, transparent: true, text: "#111111", darkText: "#111111" }),
    );
    expect(pairs.map(([light]) => light)).not.toContain(base.background);
    expect(pairs.map(([light]) => light)).not.toContain("#111111");
  });
});

describe("darkModeRules", () => {
  it("writes one scoped rule per colour attribute", () => {
    expect(darkModeRules([["#ffffff", "#000000"]], "#rc")).toBe(
      '#rc [fill="#ffffff"]{fill:#000000}' +
        '#rc [stroke="#ffffff"]{stroke:#000000}' +
        '#rc [stop-color="#ffffff"]{stop-color:#000000}' +
        '#rc [color="#ffffff"]{color:#000000}',
    );
  });
});

describe("toSvgDocument scheme", () => {
  const config = structuredClone(getTemplate("profile").defaultConfig);
  config.style.darkMode = true;
  const card = renderCard(getTemplate("profile"), config, { idPrefix: "rc" });

  it("pins light colours for the light preview", () => {
    expect(toSvgDocument(card, { idPrefix: "rc", scheme: "light" })).not.toContain("<style");
  });

  it("applies dark colours unconditionally for the dark preview", () => {
    const doc = toSvgDocument(card, { idPrefix: "rc", scheme: "dark" });
    expect(doc).toContain("<style>#rc [fill=");
    expect(doc).not.toContain("@media");
  });

  it("follows the viewer's theme in the export", () => {
    const doc = toSvgDocument(card, { idPrefix: "rc", scheme: "auto" });
    expect(doc).toContain("<style>@media (prefers-color-scheme:dark){#rc [fill=");
  });

  it("never remaps hard-coded white", () => {
    expect(card.darkColors.map(([light]) => light)).not.toContain("#fff");
  });
});
