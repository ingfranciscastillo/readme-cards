import { FONTS } from "../../../lib/fonts";
import { codeFontOf, MAX_INSTALL_LINES, parseCommands } from "../../../templates/install";
import type { FontId } from "../../../types/card";
import type { InstallContent } from "../../../types/content";
import { Group, SelectField, TextAreaField, TextField, Toggle } from "../../ui/fields";
import { type ContentEditorProps, OptionalInput } from "./common";

const MONO_FONTS = Object.values(FONTS)
  .filter((f) => f.family && f.kind === "mono")
  .map((f) => ({ value: f.id, label: f.label }));

export function InstallEditor({ content, update }: ContentEditorProps<InstallContent>) {
  const count = parseCommands(content.commands).length;
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
      <Group title="Commands">
        <TextAreaField
          label="Commands"
          rows={6}
          maxLength={1200}
          value={content.commands}
          onChange={(commands) => update({ commands })}
          hint={
            count === 0
              ? "Add at least one command, one per line."
              : `One per line (up to ${MAX_INSTALL_LINES}). Lines starting with # are comments; the Steps layout uses them as step titles.`
          }
        />
        <Toggle
          label="Show $ prompt"
          checked={content.showPrompt}
          onChange={(showPrompt) => update({ showPrompt })}
        />
        <TextField
          label="Window title"
          value={content.windowTitle}
          maxLength={40}
          onChange={(windowTitle) => update({ windowTitle })}
          hint="Shown in the title bar of the Terminal layout."
        />
        <SelectField<FontId>
          label="Code font"
          value={codeFontOf(content)}
          options={MONO_FONTS}
          onChange={(codeFont) => update({ codeFont })}
        />
      </Group>
    </>
  );
}
