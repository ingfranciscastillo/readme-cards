function copyWithSelection(text: string): boolean {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.append(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}

/**
 * Copy text with the async Clipboard API, falling back to a hidden textarea
 * where that API is missing or the browser denies it.
 */
export async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Permission denied or not focused: try the older route below.
    }
  }
  if (!copyWithSelection(text)) {
    throw new Error("This browser blocked the clipboard. Select the text and copy it yourself.");
  }
}
