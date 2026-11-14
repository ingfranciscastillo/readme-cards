/** Normalise a user-entered filename to a safe `name.svg`. */
export function sanitizeFilename(input: string, fallback: string): string {
  const base = input
    .trim()
    .replace(/\.svg$/i, "")
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 80);
  return `${base || fallback}.svg`;
}

export function downloadSvg(source: string, filename: string): void {
  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
  // Give the browser time to start the download before revoking.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function byteSize(source: string): number {
  return new Blob([source]).size;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
}
