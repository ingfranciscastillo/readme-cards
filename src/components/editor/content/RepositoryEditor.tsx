import { mapRepo } from "../../../lib/github/map";
import { LANGUAGE_COLORS, languageColor } from "../../../lib/languages";
import type { RepositoryContent } from "../../../types/content";
import { ColorField, Group, TextField } from "../../ui/fields";
import { GithubImport } from "../GithubImport";
import { type ContentEditorProps, NumberInput, OptionalField, OptionalInput } from "./common";

export function RepositoryEditor({ content, update }: ContentEditorProps<RepositoryContent>) {
  return (
    <>
      <Group title="GitHub">
        <GithubImport
          mode="repo"
          onImport={async (repo) => {
            update(mapRepo(repo, content));
            return undefined;
          }}
        />
      </Group>
      <Group title="Repository">
        <OptionalInput
          label="Owner"
          shown={content.showOwner}
          onShown={(showOwner) => update({ showOwner })}
          value={content.owner}
          maxLength={60}
          onChange={(owner) => update({ owner })}
        />
        <TextField
          label="Name"
          value={content.name}
          maxLength={100}
          onChange={(name) => update({ name })}
        />
        <OptionalInput
          label="Description"
          multiline
          shown={content.showDescription}
          onShown={(showDescription) => update({ showDescription })}
          value={content.description}
          maxLength={350}
          onChange={(description) => update({ description })}
        />
      </Group>
      <Group title="Details">
        <OptionalField
          label="Primary language"
          shown={content.showLanguage}
          onShown={(showLanguage) => update({ showLanguage })}
        >
          {(id) => (
            <>
              <input
                id={id}
                className="control"
                list={`${id}-languages`}
                value={content.language}
                maxLength={40}
                onChange={(e) =>
                  update({
                    language: e.target.value,
                    languageColor:
                      e.target.value in LANGUAGE_COLORS
                        ? languageColor(e.target.value)
                        : content.languageColor,
                  })
                }
              />
              <datalist id={`${id}-languages`}>
                {Object.keys(LANGUAGE_COLORS).map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </>
          )}
        </OptionalField>
        <ColorField
          label="Language colour"
          value={content.languageColor}
          onChange={(languageColor) => update({ languageColor })}
        />
        <div className="grid grid-cols-2 gap-3">
          <OptionalField
            label="Stars"
            shown={content.showStars}
            onShown={(showStars) => update({ showStars })}
          >
            {(id) => (
              <NumberInput id={id} value={content.stars} onChange={(stars) => update({ stars })} />
            )}
          </OptionalField>
          <OptionalField
            label="Forks"
            shown={content.showForks}
            onShown={(showForks) => update({ showForks })}
          >
            {(id) => (
              <NumberInput id={id} value={content.forks} onChange={(forks) => update({ forks })} />
            )}
          </OptionalField>
        </div>
        <OptionalInput
          label="License"
          shown={content.showLicense}
          onShown={(showLicense) => update({ showLicense })}
          value={content.license}
          maxLength={40}
          onChange={(license) => update({ license })}
          hint="Counts are a snapshot taken when you export; the file won't update itself."
        />
      </Group>
    </>
  );
}
