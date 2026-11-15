import { STYLE_LIMITS } from "../../state/limits";
import type { CardStyle } from "../../types/card";
import { ColorField, Group, SliderField, Toggle } from "../ui/fields";
import { COLOR_PRESETS, DARK_PRESETS } from "./presets";

export interface StylePanelProps {
  style: CardStyle;
  update: (patch: Partial<CardStyle>) => void;
}

function PresetButton({
  label,
  selected,
  onClick,
  background,
  text,
  accent,
  border,
  transparent,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  background: string;
  text: string;
  accent: string;
  border: string;
  transparent: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`group flex flex-col gap-1.5 rounded-[var(--radius-control)] border p-1.5 text-left transition-colors ${
        selected ? "border-ink" : "border-line hover:border-line-strong"
      }`}
    >
      <span
        className={`flex h-8 items-end gap-1 rounded-[3px] border p-1.5 ${transparent ? "checkerboard" : ""}`}
        style={{ background: transparent ? undefined : background, borderColor: border }}
      >
        <span className="h-1.5 w-5 rounded-full" style={{ background: text }} />
        <span className="size-1.5 rounded-full" style={{ background: accent }} />
      </span>
      <span className="px-0.5 text-[11.5px] text-ink-2">{label}</span>
    </button>
  );
}

export function AppearancePanel({ style, update }: StylePanelProps) {
  const active = COLOR_PRESETS.find(
    (p) =>
      p.colors.background === style.background &&
      p.colors.text === style.text &&
      p.colors.accent === style.accent &&
      p.colors.transparent === style.transparent,
  );
  const activeDark = DARK_PRESETS.find(
    (p) =>
      p.colors.darkBackground === style.darkBackground &&
      p.colors.darkText === style.darkText &&
      p.colors.darkAccent === style.darkAccent &&
      p.colors.darkBorder === style.darkBorder,
  );
  return (
    <>
      <Group title="Palette">
        <fieldset className="m-0 grid grid-cols-3 gap-2 border-0 p-0">
          <legend className="sr-only">Colour presets</legend>
          {COLOR_PRESETS.map((preset) => (
            <PresetButton
              key={preset.id}
              label={preset.label}
              selected={active?.id === preset.id}
              onClick={() => update(preset.colors)}
              {...preset.colors}
            />
          ))}
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
          description="Lets the card sit on GitHub's page colour. Pick a text colour that reads on both themes, or turn on dark mode below."
          checked={style.transparent}
          onChange={(transparent) => update({ transparent })}
        />
      </Group>
      <Group title="Dark mode">
        <Toggle
          label="Adapt to dark mode"
          description="Adds dark colours to the same SVG. GitHub shows them when the viewer uses a dark theme. Use the Dark preview background to check them."
          checked={style.darkMode}
          onChange={(darkMode) => update({ darkMode })}
        />
        {style.darkMode ? (
          <>
            <fieldset className="m-0 grid grid-cols-3 gap-2 border-0 p-0">
              <legend className="sr-only">Dark colour presets</legend>
              {DARK_PRESETS.map((preset) => (
                <PresetButton
                  key={preset.id}
                  label={preset.label}
                  selected={activeDark?.id === preset.id}
                  onClick={() => update(preset.colors)}
                  background={preset.colors.darkBackground}
                  text={preset.colors.darkText}
                  accent={preset.colors.darkAccent}
                  border={preset.colors.darkBorder}
                  transparent={false}
                />
              ))}
            </fieldset>
            <div className="grid grid-cols-2 gap-x-3 gap-y-3.5">
              <ColorField
                label="Background"
                value={style.darkBackground}
                disabled={style.transparent}
                onChange={(darkBackground) => update({ darkBackground })}
              />
              <ColorField
                label="Text"
                value={style.darkText}
                onChange={(darkText) => update({ darkText })}
              />
              <ColorField
                label="Accent"
                value={style.darkAccent}
                onChange={(darkAccent) => update({ darkAccent })}
              />
              <ColorField
                label="Border"
                value={style.darkBorder}
                onChange={(darkBorder) => update({ darkBorder })}
              />
            </div>
          </>
        ) : null}
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
