import { describe, expect, it } from "vitest";
import type { InstallContent } from "../types/content";
import { codeFontOf, installTemplate, MAX_INSTALL_LINES, parseCommands } from "./install";

describe("parseCommands", () => {
  it("marks # lines as comments and drops blank lines", () => {
    expect(parseCommands("# Install\n\nnpm i svg-kit\r\n  ## Run  \nnpx svg-kit")).toEqual([
      { kind: "comment", text: "Install" },
      { kind: "command", text: "npm i svg-kit" },
      { kind: "comment", text: "Run" },
      { kind: "command", text: "npx svg-kit" },
    ]);
  });

  it("keeps at most the line limit", () => {
    const many = Array.from({ length: 40 }, (_, i) => `echo ${i}`).join("\n");
    expect(parseCommands(many)).toHaveLength(MAX_INSTALL_LINES);
  });
});

describe("codeFontOf", () => {
  const base = installTemplate.defaultConfig.content;
  it("keeps a monospace font", () => {
    expect(codeFontOf({ ...base, codeFont: "jetbrains-mono" })).toBe("jetbrains-mono");
  });
  it("falls back for other or unknown fonts", () => {
    expect(codeFontOf({ ...base, codeFont: "inter" })).toBe("geist-mono");
    expect(codeFontOf({ ...base, codeFont: "comic" } as unknown as InstallContent)).toBe(
      "geist-mono",
    );
  });
});
