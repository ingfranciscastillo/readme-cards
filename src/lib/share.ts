import { sanitizeConfig } from "../state/sanitize";
import type { CardConfig, CardTemplate, TemplateId } from "../types/card";

/**
 * Share links carry a card's settings in the URL: JSON, deflated with the
 * browser's CompressionStream and written as base64url, behind a version tag
 * (`#/edit/profile?c=1.<data>`). Nothing is uploaded anywhere.
 */

const VERSION = "1";
/** Decompressed size limit, far above any real card, to stop zip bombs. */
const MAX_JSON_BYTES = 256 * 1024;

export interface SharedCard {
  config: CardConfig<unknown>;
  /** Uploaded images were left out of the link. */
  droppedImages: boolean;
}

/** Replace embedded images (data: URLs) with "", which image fields treat as empty. */
export function withoutImages(value: unknown): { value: unknown; dropped: boolean } {
  let dropped = false;
  const walk = (v: unknown): unknown => {
    if (typeof v === "string" && v.startsWith("data:")) {
      dropped = true;
      return "";
    }
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") {
      return Object.fromEntries(Object.entries(v).map(([k, item]) => [k, walk(item)]));
    }
    return v;
  };
  const out = walk(value);
  return { value: out, dropped };
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): Uint8Array {
  if (!/^[\w-]*$/.test(text)) throw new Error("Not base64url");
  const binary = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function deflate(text: string): Promise<Uint8Array> {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function inflate(bytes: Uint8Array, limit: number): Promise<string> {
  const stream = new Blob([bytes as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream("deflate-raw"));
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw new Error("Share link is too large");
    }
    chunks.push(value);
  }
  const all = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    all.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(all);
}

/** Encode a card's settings for a share link, leaving out uploaded images. */
export async function encodeShare(
  config: CardConfig<unknown>,
): Promise<{ payload: string; droppedImages: boolean }> {
  const { value, dropped } = withoutImages(config);
  const json = JSON.stringify(dropped ? { c: value, i: 1 } : { c: value });
  return { payload: `${VERSION}.${toBase64Url(await deflate(json))}`, droppedImages: dropped };
}

/**
 * Decode a share payload into a config for `template`, passed through the same
 * sanitiser as saved work. Returns null for anything malformed.
 */
export async function decodeShare(
  template: CardTemplate<unknown>,
  payload: string,
): Promise<SharedCard | null> {
  const dot = payload.indexOf(".");
  if (dot < 0 || payload.slice(0, dot) !== VERSION) return null;
  try {
    const json = await inflate(fromBase64Url(payload.slice(dot + 1)), MAX_JSON_BYTES);
    const data: unknown = JSON.parse(json);
    if (!data || typeof data !== "object" || !("c" in data)) return null;
    const { c, i } = data as { c: unknown; i?: unknown };
    if (!c || typeof c !== "object" || Array.isArray(c)) return null;
    return { config: sanitizeConfig(template, c), droppedImages: i === 1 };
  } catch {
    return null;
  }
}

/** The share payload in an editor hash (`#/edit/<id>?c=...`), if any. */
export function readSharePayload(hash: string): string | null {
  const match = /^#\/edit\/[\w-]+\?(.*)$/.exec(hash);
  return match ? new URLSearchParams(match[1]).get("c") : null;
}

/** An absolute link to this app that opens `templateId` with the payload. */
export function shareUrl(templateId: TemplateId, payload: string, base: string): string {
  const url = new URL(base);
  url.search = "";
  url.hash = `#/edit/${templateId}?c=${payload}`;
  return url.toString();
}
