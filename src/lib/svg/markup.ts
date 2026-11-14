/**
 * Minimal, escape-by-default SVG markup builder.
 *
 * Every interpolated value is XML-escaped unless it is already `SafeSvg`
 * (the output of another `svg` call or an explicit `raw`). Arrays are joined,
 * and `false`, `null` and `undefined` render nothing, so conditional markup
 * reads naturally: svg`${show && svg`<rect/>`}`.
 */
export class SafeSvg {
  readonly value: string;
  constructor(value: string) {
    this.value = value;
  }
  toString(): string {
    return this.value;
  }
}

export type SvgValue = SafeSvg | string | number | boolean | null | undefined | SvgValue[];

const XML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

// Characters that are not allowed anywhere in an XML 1.0 document.
// biome-ignore lint/suspicious/noControlCharactersInRegex: stripping them is the point.
const INVALID_XML_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g;

export function escapeXml(input: string): string {
  return input.replace(INVALID_XML_CHARS, "").replace(/[&<>"']/g, (c) => XML_ESCAPES[c]);
}

/** Round to two decimals so output stays compact and deterministic. */
export function num(n: number): string {
  if (!Number.isFinite(n)) return "0";
  const rounded = Math.round(n * 100) / 100;
  return Object.is(rounded, -0) ? "0" : String(rounded);
}

function serialize(value: SvgValue): string {
  if (value === null || value === undefined || value === false || value === true) return "";
  if (value instanceof SafeSvg) return value.value;
  if (Array.isArray(value)) return value.map(serialize).join("");
  if (typeof value === "number") return num(value);
  return escapeXml(value);
}

export function svg(strings: TemplateStringsArray, ...values: SvgValue[]): SafeSvg {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) {
    out += serialize(values[i]) + strings[i + 1];
  }
  return new SafeSvg(out);
}

/** Mark trusted, already-valid markup (e.g. bundled icon paths) as safe. */
export function raw(markup: string): SafeSvg {
  return new SafeSvg(markup);
}

/** Build an attribute list from an object, skipping empty values. */
export function attrs(record: Record<string, string | number | null | undefined | false>): SafeSvg {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(record)) {
    if (value === null || value === undefined || value === false || value === "") continue;
    parts.push(` ${key}="${typeof value === "number" ? num(value) : escapeXml(value)}"`);
  }
  return new SafeSvg(parts.join(""));
}
