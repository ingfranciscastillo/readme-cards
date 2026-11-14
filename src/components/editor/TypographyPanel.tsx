import { FONT_OPTIONS, FONTS, resolveWeight } from "../../lib/fonts";
import { STYLE_LIMITS } from "../../state/limits";
import type { FontId } from "../../types/card";
import { Group, Segmented, SelectField, SliderField } from "../ui/fields";
import type { StylePanelProps } from "./AppearancePanel";

const WEIGHTS = [400, 500, 600, 700];

function fontHint(font: FontId) {
  return FONTS[font].family
    ? "Embedded in the exported SVG (Latin subset)."
    : "Not embedded: renders with the viewer's system font, so widths can vary.";
}

export function TypographyPanel({ style, update }: StylePanelProps) {
  const display = FONTS[style.displayFont];
  const effective = resolveWeight(style.displayFont, style.titleWeight);
  return (
    <>
      <Group title="Typefaces">
        <SelectField
          label="Display font"
          value={style.displayFont}
          options={FONT_OPTIONS}
          hint={fontHint(style.displayFont)}
          onChange={(displayFont) => update({ displayFont })}
        />
        <SelectField
          label="Body font"
          value={style.bodyFont}
          options={FONT_OPTIONS}
          hint={fontHint(style.bodyFont)}
          onChange={(bodyFont) => update({ bodyFont })}
        />
      </Group>
      <Group title="Scale">
        <SliderField
          label="Base size"
          unit="px"
          {...STYLE_LIMITS.fontSize}
          value={style.fontSize}
          hint="Titles and labels scale from this size."
          onChange={(fontSize) => update({ fontSize })}
        />
        <div className="flex flex-col gap-1.5">
          <Segmented
            label="Title weight"
            value={effective}
            onChange={(titleWeight) => update({ titleWeight })}
            options={WEIGHTS.map((w) => ({
              value: w,
              label: <span style={{ fontWeight: w }}>{w}</span>,
              disabled: !display.weights.includes(w),
              title: display.weights.includes(w)
                ? undefined
                : `${display.label} has no ${w} weight`,
            }))}
          />
          {display.weights.length === 1 ? (
            <p className="text-[11.5px] text-ink-3">{display.label} ships a single weight.</p>
          ) : null}
        </div>
        <SliderField
          label="Line height"
          {...STYLE_LIMITS.lineHeight}
          value={style.lineHeight}
          onChange={(lineHeight) => update({ lineHeight: Math.round(lineHeight * 100) / 100 })}
        />
      </Group>
    </>
  );
}
