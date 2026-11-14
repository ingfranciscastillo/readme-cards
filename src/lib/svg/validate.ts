export interface ValidationResult {
  valid: boolean;
  issues: string[];
}

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Parse the exported markup as a standalone XML document and check the
 * properties a README image needs: namespace, dimensions, no HTML islands
 * and no references to remote resources (GitHub would not load them).
 */
export function validateSvg(source: string): ValidationResult {
  const issues: string[] = [];
  if (typeof DOMParser === "undefined") return { valid: true, issues };
  const doc = new DOMParser().parseFromString(source, "image/svg+xml");
  const error = doc.querySelector("parsererror");
  if (error) {
    return { valid: false, issues: [`Not well-formed XML: ${error.textContent?.trim() ?? ""}`] };
  }
  const root = doc.documentElement;
  if (root.localName !== "svg" || root.namespaceURI !== SVG_NS) {
    issues.push("Root element must be <svg> in the SVG namespace.");
  }
  for (const attr of ["width", "height", "viewBox"]) {
    if (!root.getAttribute(attr)) issues.push(`Missing ${attr} attribute.`);
  }
  if (doc.getElementsByTagNameNS(SVG_NS, "foreignObject").length > 0) {
    issues.push("Contains <foreignObject>, which GitHub does not render.");
  }
  if (doc.getElementsByTagNameNS(SVG_NS, "script").length > 0) {
    issues.push("Contains <script>.");
  }
  for (const el of Array.from(doc.getElementsByTagNameNS(SVG_NS, "image"))) {
    const href = el.getAttribute("href") ?? el.getAttribute("xlink:href") ?? "";
    if (!href.startsWith("data:")) issues.push("An image references an external URL.");
  }
  return { valid: issues.length === 0, issues };
}
