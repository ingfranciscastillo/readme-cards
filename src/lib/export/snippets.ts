function escapeMarkdownAlt(text: string): string {
  return text
    .replace(/[[\]\\]/g, "\\$&")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeAttr(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/** A relative reference: commit the downloaded file next to your README. */
export function markdownSnippet(alt: string, filename: string): string {
  return `![${escapeMarkdownAlt(alt)}](./${filename})`;
}

export function htmlSnippet(alt: string, filename: string, width: number): string {
  return `<img src="./${filename}" alt="${escapeAttr(alt)}" width="${Math.round(width)}" />`;
}
