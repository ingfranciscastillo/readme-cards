import { memo } from "react";

/**
 * Inline rendering of a generated SVG document. The markup comes from the
 * template renderers, which escape all user text, so injecting it is safe.
 */
export const CardSvg = memo(function CardSvg({
  markup,
  width,
  height,
  className = "",
}: {
  markup: string;
  width: number;
  height: number;
  className?: string;
}) {
  return (
    <div
      className={`card-svg ${className}`}
      style={{ width, height }}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: markup is produced by the escaping SVG builder.
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
});
