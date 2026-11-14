/**
 * Turn a remote URL or a local file into a small square data: URI so the
 * exported SVG carries the image itself instead of a link GitHub would block.
 */
export async function imageToDataUri(
  source: string | Blob,
  size = 160,
  signal?: AbortSignal,
): Promise<string> {
  let blob: Blob;
  if (typeof source === "string") {
    const res = await fetch(source, { signal, mode: "cors" });
    if (!res.ok) throw new Error(`Image request failed (${res.status})`);
    blob = await res.blob();
  } else {
    blob = source;
  }
  if (!blob.type.startsWith("image/")) throw new Error("That file is not an image.");
  const bitmap = await createImageBitmap(blob);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available.");
    // Centre-crop to a square ("cover").
    const side = Math.min(bitmap.width, bitmap.height);
    const sx = (bitmap.width - side) / 2;
    const sy = (bitmap.height - side) / 2;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);
    let transparent = false;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) {
        transparent = true;
        break;
      }
    }
    // JPEG is far smaller for photos; keep PNG when transparency matters.
    return transparent ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.86);
  } finally {
    bitmap.close();
  }
}
