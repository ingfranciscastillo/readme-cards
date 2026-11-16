import { describe, expect, it } from "vitest";
import { getTemplate, TEMPLATES } from "../templates";
import { decodeShare, encodeShare, readSharePayload, shareUrl, withoutImages } from "./share";

const profile = getTemplate("profile");
const PNG = "data:image/png;base64,iVBORw0KGgo=";

async function deflateRaw(text: string): Promise<string> {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("deflate-raw"));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

describe("share links", () => {
  it.each(TEMPLATES.map((t) => [t.id, t] as const))(
    "round-trips the %s defaults in a short, URL-safe payload",
    async (_, template) => {
      const { payload, droppedImages } = await encodeShare(template.defaultConfig);
      expect(droppedImages).toBe(false);
      expect(payload).toMatch(/^1\.[\w-]+$/);
      expect(payload.length).toBeLessThan(1500);
      expect(await decodeShare(template, payload)).toEqual({
        config: template.defaultConfig,
        droppedImages: false,
      });
    },
  );

  it("keeps edits, including dark-mode colours", async () => {
    const config = structuredClone(profile.defaultConfig);
    config.variant = "stacked";
    Object.assign(config.style, { darkMode: true, darkAccent: "#4493f8", radius: 20 });
    (config.content as { displayName: string }).displayName = "Grace Hopper ✨";
    const shared = await decodeShare(profile, (await encodeShare(config)).payload);
    expect(shared?.config).toEqual(config);
  });

  it("leaves uploaded images out and says so", async () => {
    const config = structuredClone(profile.defaultConfig);
    (config.content as { avatar: string }).avatar = PNG;
    const { payload, droppedImages } = await encodeShare(config);
    expect(droppedImages).toBe(true);
    const shared = await decodeShare(profile, payload);
    expect(shared?.droppedImages).toBe(true);
    const content = shared?.config.content as { avatar: string } | undefined;
    expect(content?.avatar).toBe("");
  });

  it("strips data: URLs anywhere in the config without touching the input", () => {
    const input = { a: PNG, list: [{ icon: PNG, name: "x" }], keep: "https://example.com" };
    const { value, dropped } = withoutImages(input);
    expect(dropped).toBe(true);
    expect(value).toEqual({ a: "", list: [{ icon: "", name: "x" }], keep: "https://example.com" });
    expect(input.a).toBe(PNG);
  });

  it("sanitises what it decodes", async () => {
    const payload = `1.${await deflateRaw(
      JSON.stringify({ c: { variant: "nope", style: { text: "red", radius: 9999 } } }),
    )}`;
    const shared = await decodeShare(profile, payload);
    expect(shared?.config.variant).toBe(profile.defaultConfig.variant);
    expect(shared?.config.style.text).toBe(profile.defaultConfig.style.text);
    expect(shared?.config.style.radius).toBe(48);
  });

  it.each([
    ["no version", "abc"],
    ["unknown version", "2.abc"],
    ["not base64url", "1.a+b/c="],
    ["not deflate data", "1.aGVsbG8"],
    ["empty", "1."],
  ])("rejects a payload with %s", async (_, payload) => {
    expect(await decodeShare(profile, payload)).toBeNull();
  });

  it.each([
    ["JSON that is not an object", "[1,2]"],
    ["no config", '{"x":1}'],
    ["a config that is an array", '{"c":[]}'],
    ["invalid JSON", "{"],
  ])("rejects %s", async (_, json) => {
    expect(await decodeShare(profile, `1.${await deflateRaw(json)}`)).toBeNull();
  });

  it("refuses payloads that inflate past the size limit", async () => {
    const bomb = `1.${await deflateRaw(JSON.stringify({ c: { pad: "x".repeat(400_000) } }))}`;
    expect(bomb.length).toBeLessThan(2000);
    expect(await decodeShare(profile, bomb)).toBeNull();
  });

  it("reads the payload from an editor hash", () => {
    expect(readSharePayload("#/edit/profile?c=1.abc")).toBe("1.abc");
    expect(readSharePayload("#/edit/profile")).toBeNull();
    expect(readSharePayload("#/edit/profile?x=1")).toBeNull();
    expect(readSharePayload("#/?c=1.abc")).toBeNull();
  });

  it("builds an absolute link from the current page", () => {
    expect(shareUrl("banner", "1.abc", "https://example.github.io/readme-cards/?q=1#/edit/x")).toBe(
      "https://example.github.io/readme-cards/#/edit/banner?c=1.abc",
    );
  });
});
