import { parseItems } from "../../../templates/stack";
import type { StackContent } from "../../../types/content";
import { Group, TextAreaField } from "../../ui/fields";
import { type ContentEditorProps, OptionalInput } from "./common";

export function StackEditor({ content, update }: ContentEditorProps<StackContent>) {
  const count = parseItems(content.items).length;
  return (
    <>
      <Group title="Heading">
        <OptionalInput
          label="Title"
          shown={content.showTitle}
          onShown={(showTitle) => update({ showTitle })}
          value={content.title}
          maxLength={80}
          onChange={(title) => update({ title })}
        />
        <OptionalInput
          label="Subtitle"
          shown={content.showSubtitle}
          onShown={(showSubtitle) => update({ showSubtitle })}
          value={content.subtitle}
          maxLength={160}
          onChange={(subtitle) => update({ subtitle })}
        />
      </Group>
      <Group title="Items">
        <TextAreaField
          label="Technologies"
          rows={5}
          maxLength={900}
          value={content.items}
          onChange={(items) => update({ items })}
          hint={
            count === 0
              ? "Add at least one item, separated by commas or new lines."
              : `${count} item${count === 1 ? "" : "s"}. Separate with commas or new lines (up to 60).`
          }
        />
      </Group>
    </>
  );
}
