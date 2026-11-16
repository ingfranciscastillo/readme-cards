import { Plus, Trash } from "iconoir-react";
import { MAX_NOW_ITEMS, NOW_ICONS } from "../../../templates/now";
import type { NowContent, NowIcon, NowItem } from "../../../types/content";
import { Button, IconButton } from "../../ui/Button";
import { Group, Toggle } from "../../ui/fields";
import { type ContentEditorProps, OptionalInput } from "./common";

export function NowEditor({ content, update }: ContentEditorProps<NowContent>) {
  const items = content.items;
  const setItem = (index: number, patch: Partial<NowItem>) =>
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
      <Group title="Items">
        {items.length > 0 ? (
          <ul className="flex flex-col gap-3" aria-label="Items">
            {items.map((item, index) => (
              <li key={item.id} className="flex flex-col gap-1.5">
                <div className="flex gap-2">
                  <select
                    aria-label={`Icon for item ${index + 1}`}
                    className="control w-[112px] shrink-0 cursor-pointer"
                    value={item.icon}
                    onChange={(e) => {
                      const icon = e.target.value as NowIcon;
                      const previous = NOW_ICONS.find((i) => i.value === item.icon)?.label;
                      const next = NOW_ICONS.find((i) => i.value === icon)?.label ?? "";
                      // Keep a custom label; replace one that still matches the old icon.
                      const label = !item.label || item.label === previous ? next : item.label;
                      setItem(index, { icon, label });
                    }}
                  >
                    {NOW_ICONS.map((i) => (
                      <option key={i.value} value={i.value}>
                        {i.label}
                      </option>
                    ))}
                  </select>
                  <input
                    aria-label={`Label for item ${index + 1}`}
                    className="control"
                    value={item.label}
                    maxLength={32}
                    placeholder="Label"
                    onChange={(e) => setItem(index, { label: e.target.value })}
                  />
                  <IconButton
                    label={`Remove item ${index + 1}`}
                    className="mt-0.5"
                    onClick={() => update({ items: items.filter((_, i) => i !== index) })}
                  >
                    <Trash width={14} height={14} aria-hidden />
                  </IconButton>
                </div>
                <input
                  aria-label={`Text for item ${index + 1}`}
                  className="control"
                  value={item.text}
                  maxLength={120}
                  placeholder="What it is"
                  onChange={(e) => setItem(index, { text: e.target.value })}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[11.5px] text-ink-3">No items yet. Add what you're up to.</p>
        )}
        <div>
          <Button
            size="sm"
            variant="ghost"
            icon={<Plus width={13} height={13} aria-hidden />}
            disabled={items.length >= MAX_NOW_ITEMS}
            onClick={() =>
              update({
                items: [
                  ...items,
                  { id: `n${Date.now().toString(36)}`, icon: "other", label: "", text: "" },
                ],
              })
            }
          >
            {items.length >= MAX_NOW_ITEMS ? `Up to ${MAX_NOW_ITEMS} items` : "Add item"}
          </Button>
        </div>
        <Toggle
          label="Show icons"
          checked={content.showIcons}
          onChange={(showIcons) => update({ showIcons })}
        />
      </Group>
    </>
  );
}
