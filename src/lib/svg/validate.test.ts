// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { validateSvg } from "./validate";

const svg = (body: string, attrs = 'width="10" height="10" viewBox="0 0 10 10"') =>
  `<svg xmlns="http://www.w3.org/2000/svg" ${attrs}>${body}</svg>`;

describe("validateSvg", () => {
  it("accepts a minimal standalone SVG", () => {
    expect(validateSvg(svg("<rect width='1' height='1'/>")).valid).toBe(true);
  });

  it.each([
    ["malformed XML", svg("<g>"), /well-formed/],
    ["missing dimensions", svg("", 'viewBox="0 0 10 10"'), /Missing width/],
    ["wrong namespace", '<svg width="1" height="1" viewBox="0 0 1 1"/>', /namespace/],
    ["foreignObject", svg("<foreignObject/>"), /foreignObject/],
    ["script", svg("<script>1</script>"), /script/],
    ["remote image", svg('<image href="https://example.com/a.png"/>'), /external URL/],
  ])("rejects %s", (_, source, message) => {
    const result = validateSvg(source);
    expect(result.valid).toBe(false);
    expect(result.issues.join(" ")).toMatch(message);
  });

  it("allows embedded data: images", () => {
    expect(validateSvg(svg('<image href="data:image/png;base64,AAAA"/>')).valid).toBe(true);
  });
});
