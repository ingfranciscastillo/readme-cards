import { Plus, Trash } from "iconoir-react";
import { useId } from "react";
import { mapLanguages } from "../../../lib/github/map";
import { LANGUAGE_COLORS, languageColor } from "../../../lib/languages";
import { languageShares, MAX_LANGUAGES } from "../../../templates/languages";
import type { LanguageEntry, LanguagesContent } from "../../../types/content";
import { Button, IconButton } from "../../ui/Button";
import { Group, Toggle } from "../../ui/fields";
import { GithubImport } from "../GithubImport";
import { type ContentEditorProps, OptionalInput } from "./common";

export function LanguagesEditor({ content, update }: ContentEditorProps<LanguagesContent>) {
  const id = useId();
  const shares = new Map(languageShares(content).map((s) => [s.name, s.label]));
  const setEntry = (index: number, patch: Partial<LanguageEntry>) =>
    update({
      languages: content.languages.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    });

  return (
    <>
      <Group title="GitHub">
        <GithubImport
          mode="languages"
          onImport={async ({ languages, byRepoCount }) => {
            update({ languages: mapLanguages(languages) });
            return byRepoCount
              ? "From a profile, each language is weighted by how many of your own public repositories use it as their main language."
              : "From a repository, each language is weighted by bytes of code.";
          }}
        />
      </Group>
      <Group title="Heading">
        <OptionalInput
          label="Title"
          shown={content.showTitle}
          onShown={(showTitle) => update({ showTitle })}
          value={content.title}
          maxLength={80}
          onChange={(title) => update({ title })}
        />
        <Toggle
          label="Show percentages"
          checked={content.showPercent}
          onChange={(showPercent) => update({ showPercent })}
        />
      </Group>
      <Group title="Languages">
        <p className="text-[11.5px] leading-snug text-ink-3">
          Values can be percentages, bytes or counts: each share is computed from the total, and the
          card lists them largest first.
        </p>
        {content.languages.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {content.languages.map((lang, index) => (
              <li key={lang.id} className="flex items-center gap-2">
                <span className="relative size-8 shrink-0 overflow-hidden rounded-[var(--radius-control)] border border-control">
                  <input
                    type="color"
                    aria-label={`Colour for ${lang.name || `language ${index + 1}`}`}
                    className="absolute -inset-2 size-12 cursor-pointer border-0 p-0"
                    value={lang.color}
                    onChange={(e) => setEntry(index, { color: e.target.value })}
                  />
                </span>
                <input
                  aria-label={`Name of language ${index + 1}`}
                  className="control min-w-0"
                  list={`${id}-languages`}
                  value={lang.name}
                  maxLength={40}
                  onChange={(e) =>
                    setEntry(index, {
                      name: e.target.value,
                      color:
                        e.target.value in LANGUAGE_COLORS
                          ? languageColor(e.target.value)
                          : lang.color,
                    })
                  }
                />
                <input
                  aria-label={`Value for ${lang.name || `language ${index + 1}`}`}
                  type="number"
                  min={0}
                  step="any"
                  inputMode="decimal"
                  className="control w-[84px] shrink-0 font-mono text-[12px] tabular-nums"
                  value={Number.isFinite(lang.value) ? lang.value : 0}
                  onChange={(e) => {
                    const n = Number.parseFloat(e.target.value);
                    setEntry(index, { value: Number.isFinite(n) && n >= 0 ? n : 0 });
                  }}
                />
                <span className="w-11 shrink-0 text-right font-mono text-[11px] text-ink-3 tabular-nums">
                  {shares.get(lang.name.trim()) ?? "—"}
                </span>
                <IconButton
                  label={`Remove ${lang.name || `language ${index + 1}`}`}
                  onClick={() =>
                    update({ languages: content.languages.filter((_, i) => i !== index) })
                  }
                >
                  <Trash width={14} height={14} aria-hidden />
                </IconButton>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[11.5px] text-ink-3">No languages yet.</p>
        )}
        <datalist id={`${id}-languages`}>
          {Object.keys(LANGUAGE_COLORS).map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <div>
          <Button
            size="sm"
            variant="ghost"
            icon={<Plus width={13} height={13} aria-hidden />}
            disabled={content.languages.length >= MAX_LANGUAGES}
            onClick={() =>
              update({
                languages: [
                  ...content.languages,
                  { id: `l${Date.now().toString(36)}`, name: "", value: 10, color: "#8b8b85" },
                ],
              })
            }
          >
            {content.languages.length >= MAX_LANGUAGES
              ? `Up to ${MAX_LANGUAGES} languages`
              : "Add language"}
          </Button>
        </div>
      </Group>
    </>
  );
}
