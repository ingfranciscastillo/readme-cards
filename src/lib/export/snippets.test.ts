import { describe, expect, it } from "vitest";
import { htmlSnippet, markdownSnippet } from "./snippets";

describe("snippets", () => {
  it("escapes brackets in Markdown alt text", () => {
    expect(markdownSnippet("Ada [dev]\n card", "profile.svg")).toBe(
      "![Ada \\[dev\\] card](./profile.svg)",
    );
  });

  it("escapes attributes and rounds width in HTML", () => {
    expect(htmlSnippet('Ada "<dev>" & co', "profile.svg", 479.6)).toBe(
      '<img src="./profile.svg" alt="Ada &quot;&lt;dev>&quot; &amp; co" width="480" />',
    );
  });
});
