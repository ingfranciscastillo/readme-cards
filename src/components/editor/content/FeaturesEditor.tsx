import { Plus, Trash } from "iconoir-react";
import { FEATURE_ICONS, MAX_FEATURES } from "../../../templates/features";
import type { FeatureIcon, FeatureItem, FeaturesContent } from "../../../types/content";
import { Button, IconButton } from "../../ui/Button";
import { Group } from "../../ui/fields";
import { type ContentEditorProps, OptionalInput } from "./common";

export function FeaturesEditor({ content, update }: ContentEditorProps<FeaturesContent>) {
  const items = content.items;
  const setItem = (index: number, patch: Partial<FeatureItem>) =>
    update({ items: items.map((item, i) => (i === index ? { ...item, ...patch } : item)) });
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
      <Group title="Features">
        {items.length > 0 ? (
          <ul className="flex flex-col gap-3" aria-label="Features">
            {items.map((item, index) => (
              <li key={item.id} className="flex flex-col gap-1.5">
                <div className="flex gap-2">
                  <select
                    aria-label={`Icon for feature ${index + 1}`}
                    className="control w-[112px] shrink-0 cursor-pointer"
                    value={item.icon}
                    onChange={(e) => setItem(index, { icon: e.target.value as FeatureIcon })}
                  >
                    {FEATURE_ICONS.map((i) => (
                      <option key={i.value} value={i.value}>
                        {i.label}
                      </option>
                    ))}
                  </select>
                  <input
                    aria-label={`Title for feature ${index + 1}`}
                    className="control"
                    value={item.title}
                    maxLength={40}
                    placeholder="Title"
                    onChange={(e) => setItem(index, { title: e.target.value })}
                  />
                  <IconButton
                    label={`Remove feature ${index + 1}`}
                    className="mt-0.5"
                    onClick={() => update({ items: items.filter((_, i) => i !== index) })}
                  >
                    <Trash width={14} height={14} aria-hidden />
                  </IconButton>
                </div>
                <input
                  aria-label={`Description for feature ${index + 1}`}
                  className="control"
                  value={item.text}
                  maxLength={120}
                  placeholder="One line about it"
                  onChange={(e) => setItem(index, { text: e.target.value })}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[11.5px] text-ink-3">
            No features yet. Add what the project does well.
          </p>
        )}
        <div>
          <Button
            size="sm"
            variant="ghost"
            icon={<Plus width={13} height={13} aria-hidden />}
            disabled={items.length >= MAX_FEATURES}
            onClick={() =>
              update({
                items: [
                  ...items,
                  { id: `f${Date.now().toString(36)}`, icon: "check", title: "", text: "" },
                ],
              })
            }
          >
            {items.length >= MAX_FEATURES ? `Up to ${MAX_FEATURES} features` : "Add feature"}
          </Button>
        </div>
      </Group>
    </>
  );
}
