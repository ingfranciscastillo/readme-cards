// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { type FontFaceUse, faceFile, fontBytes } from "../fonts";
import { buildFontCss } from "./fontEmbed";

const face = (font: FontFaceUse["font"]): FontFaceUse => ({ font, weight: 400, italic: false });
const bytes = () => new Response(new Uint8Array([1, 2, 3]));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("font embedding", () => {
  it("inlines the font file as base64 woff2", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => bytes()),
    );
    const { css, embedded } = await buildFontCss([face("inter")]);
    expect(embedded).toHaveLength(1);
    expect(css).toContain("font-family:'Inter';font-style:normal;font-weight:400");
    expect(css).toContain("url(data:font/woff2;base64,AQID)");
  });

  it("reuses the bytes the preview already downloaded", async () => {
    const fetch = vi.fn(async () => bytes());
    vi.stubGlobal("fetch", fetch);
    const url = faceFile(face("lora"));
    expect(url).toBeTruthy();
    await fontBytes(url as string);
    // The network is gone, but the export still has the font.
    fetch.mockImplementation(async () => {
      throw new TypeError("Failed to fetch");
    });
    const { css } = await buildFontCss([face("lora")]);
    expect(css).toContain("base64,AQID");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("retries a download that failed", async () => {
    const fetch = vi.fn(async (): Promise<Response> => {
      throw new TypeError("Failed to fetch");
    });
    vi.stubGlobal("fetch", fetch);
    await expect(buildFontCss([face("fraunces")])).rejects.toThrow(TypeError);
    fetch.mockImplementation(async () => bytes());
    const { css } = await buildFontCss([face("fraunces")]);
    expect(css).toContain("base64,AQID");
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("reports HTTP errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 404 })),
    );
    await expect(buildFontCss([face("manrope")])).rejects.toThrow("Font request failed (404)");
  });

  it("leaves system fonts to the viewer", async () => {
    const fetch = vi.fn(async () => bytes());
    vi.stubGlobal("fetch", fetch);
    const { css, system } = await buildFontCss([face("system-sans")]);
    expect(css).toBe("");
    expect(system).toHaveLength(1);
    expect(fetch).not.toHaveBeenCalled();
  });
});
