import { STYLE_LIMITS } from "../../state/limits";
import type { CardStyle } from "../../types/card";
import { ColorField, Group, SliderField, Toggle } from "../ui/fields";
import { COLOR_PRESETS } from "./presets";

export interface StylePanelProps {
  style: CardStyle;
  update: (patch: Partial<CardStyle>) => void;
}

export function AppearancePanel({ style, update }: StylePanelProps) {
  const active = COLOR_PRESETS.find(
    (p) =>
      p.colors.background === style.background &&
      p.colors.text === style.text &&
      p.colors.accent === style.accent &&
      p.colors.transparent === style.transparent,
  );
  return (
    <>
      <Group title="Palette">
        <fieldset className="m-0 grid grid-cols-3 gap-2 border-0 p-0">
          <legend className="sr-only">Colour presets</legend>
          {COLOR_PRESETS.map((preset) => {
            const selected = active?.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={selected}
                onClick={() => update(preset.colors)}
                className={`group flex flex-col gap-1.5 rounded-[var(--radius-control)] border p-1.5 text-left transition-colors ${
                  selected ? "border-ink" : "border-line hover:border-line-strong"
                }`}
              >
                <span
                  className={`flex h-8 items-end gap-1 rounded-[3px] border p-1.5 ${preset.colors.transparent ? "checkerboard" : ""}`}
                  style={{
                    background: preset.colors.transparent ? undefined : preset.colors.background,
                    borderColor: preset.colors.border,
                  }}
                >
                  <span
                    className="h-1.5 w-5 rounded-full"
                    style={{ background: preset.colors.text }}
                  />
                  <span
                    className="size-1.5 rounded-full"
                    style={{ background: preset.colors.accent }}
                  />
                </span>
                <span className="px-0.5 text-[11.5px] text-ink-2">{preset.label}</span>
              </button>
            );
          })}
        </fieldset>
      </Group>
      <Group title="Colours">
        <div className="grid grid-cols-2 gap-x-3 gap-y-3.5">
          <ColorField
            label="Background"
            value={style.background}
            disabled={style.transparent}
            onChange={(background) => update({ background })}
          />
          <ColorField label="Text" value={style.text} onChange={(text) => update({ text })} />
          <ColorField
            label="Accent"
            value={style.accent}
            onChange={(accent) => update({ accent })}
          />
          <ColorField
            label="Border"
            value={style.border}
            onChange={(border) => update({ border })}
          />
        </div>
        <Toggle
          label="Transparent background"
          description="Lets the card sit on GitHub's light or dark page colour. Pick a text colour that reads on both."
          checked={style.transparent}
          onChange={(transparent) => update({ transparent })}
        />
      </Group>
      <Group title="Shape">
        <Toggle
          label="Show border"
          checked={style.showBorder}
          onChange={(showBorder) => update({ showBorder })}
        />
        <SliderField
          label="Border width"
          unit="px"
          {...STYLE_LIMITS.borderWidth}
          value={style.borderWidth}
          disabled={!style.showBorder}
          onChange={(borderWidth) => update({ borderWidth })}
        />
        <SliderField
          label="Corner radius"
          unit="px"
          {...STYLE_LIMITS.radius}
          value={style.radius}
          onChange={(radius) => update({ radius })}
        />
      </Group>
    </>
  );
}
