import { parseItems } from "../../../templates/stack";
import type { BannerContent } from "../../../types/content";
import { Group, TextField } from "../../ui/fields";
import { type ContentEditorProps, OptionalInput } from "./common";

export function BannerEditor({ content, update }: ContentEditorProps<BannerContent>) {
  const count = parseItems(content.tags).length;
  return (
    <>
      <Group title="Heading">
        <OptionalInput
          label="Eyebrow"
          shown={content.showEyebrow}
          onShown={(showEyebrow) => update({ showEyebrow })}
          value={content.eyebrow}
          maxLength={40}
          onChange={(eyebrow) => update({ eyebrow })}
          hint="A short line above the title, shown in capitals."
        />
        <TextField
          label="Title"
          value={content.title}
          maxLength={80}
          onChange={(title) => update({ title })}
        />
        <OptionalInput
          label="Subtitle"
          multiline
          shown={content.showSubtitle}
          onShown={(showSubtitle) => update({ showSubtitle })}
          value={content.subtitle}
          maxLength={280}
          onChange={(subtitle) => update({ subtitle })}
        />
      </Group>
      <Group title="Tags">
        <OptionalInput
          label="Tags"
          multiline
          shown={content.showTags}
          onShown={(showTags) => update({ showTags })}
          value={content.tags}
          maxLength={300}
          onChange={(tags) => update({ tags })}
          hint={
            count === 0
              ? "Separate tags with commas or new lines."
              : `${count} tag${count === 1 ? "" : "s"}, up to two rows are shown. Separate with commas or new lines.`
          }
        />
      </Group>
    </>
  );
}
