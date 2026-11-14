import { FONTS } from "../../../lib/fonts";
import type { FontId } from "../../../types/card";
import type { QuoteContent } from "../../../types/content";
import { Group, TextAreaField, Toggle } from "../../ui/fields";
import { type ContentEditorProps, OptionalInput } from "./common";

export function QuoteEditor({
  content,
  update,
  displayFont,
}: ContentEditorProps<QuoteContent> & { displayFont: FontId }) {
  const italicAvailable = FONTS[displayFont].italic;
  return (
    <>
      <Group title="Quote">
        <TextAreaField
          label="Quote"
          rows={4}
          maxLength={400}
          value={content.quote}
          onChange={(quote) => update({ quote })}
          hint="Line breaks are kept. Long quotes are cut off with an ellipsis after nine lines."
        />
        <Toggle
          label="Italic"
          checked={content.italic && italicAvailable}
          disabled={!italicAvailable}
          description={
            italicAvailable
              ? undefined
              : `${FONTS[displayFont].label} has no italic. Pick Instrument Serif or a system font in Typography.`
          }
          onChange={(italic) => update({ italic })}
        />
      </Group>
      <Group title="Byline">
        <OptionalInput
          label="Author"
          shown={content.showAuthor}
          onShown={(showAuthor) => update({ showAuthor })}
          value={content.author}
          maxLength={80}
          onChange={(author) => update({ author })}
        />
        <OptionalInput
          label="Attribution"
          shown={content.showAttribution}
          onShown={(showAttribution) => update({ showAttribution })}
          value={content.attribution}
          maxLength={120}
          onChange={(attribution) => update({ attribution })}
          hint="A source, role or date, set smaller beneath the author."
        />
      </Group>
    </>
  );
}
