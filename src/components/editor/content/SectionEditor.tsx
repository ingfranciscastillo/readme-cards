import type { SectionContent } from "../../../types/content";
import { Group, TextField } from "../../ui/fields";
import { type ContentEditorProps, OptionalInput } from "./common";

export function SectionEditor({ content, update }: ContentEditorProps<SectionContent>) {
  return (
    <Group title="Heading">
      <TextField
        label="Title"
        value={content.title}
        maxLength={60}
        onChange={(title) => update({ title })}
        hint="Make one per section, such as About, Projects or Contact."
      />
      <OptionalInput
        label="Subtitle"
        shown={content.showSubtitle}
        onShown={(showSubtitle) => update({ showSubtitle })}
        value={content.subtitle}
        maxLength={140}
        onChange={(subtitle) => update({ subtitle })}
      />
    </Group>
  );
}
