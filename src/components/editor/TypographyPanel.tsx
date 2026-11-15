import { useEffect, useId } from "react";
import { FONT_GROUPS, FONTS, resolveWeight } from "../../lib/fonts";
import { STYLE_LIMITS } from "../../state/limits";
import { requestFaces } from "../../state/useFontsVersion";
import type { FontId } from "../../types/card";
import { Field, Group, Segmented, SliderField } from "../ui/fields";
import type { StylePanelProps } from "./AppearancePanel";

const WEIGHTS = [400, 500, 600, 700];

function fontHint(font: FontId) {
  return FONTS[font].family
    ? "Embedded in the exported SVG (Latin subset)."
    : "Not embedded: renders with the viewer's system font, so widths can vary.";
}

const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%2385878a' stroke-width='1.4'/%3E%3C/svg%3E\")";

/** Regular face of every embeddable font, fetched only when the picker is used. */
const SPECIMEN_FACES = Object.values(FONTS)
  .filter((f) => f.family)
  .map((f) => ({ font: f.id, weight: 400, italic: false }));

function FontSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: FontId;
  onChange: (font: FontId) => void;
}) {
  const id = useId();
  // The closed select shows the chosen font's name in that font.
  useEffect(() => requestFaces([{ font: value, weight: 400, italic: false }]), [value]);
  return (
    <Field label={label} hint={fontHint(value)} htmlFor={id}>
      <select
        id={id}
        className="control cursor-pointer appearance-none bg-[length:10px] bg-[right_10px_center] bg-no-repeat pr-7"
        style={{ backgroundImage: CHEVRON, fontFamily: FONTS[value].stack }}
        value={value}
        // Load every font's regular face so options can preview themselves
        // where the browser styles <option> elements.
        onFocus={() => requestFaces(SPECIMEN_FACES)}
        onPointerEnter={() => requestFaces(SPECIMEN_FACES)}
        onChange={(e) => onChange(e.target.value as FontId)}
      >
        {FONT_GROUPS.map((group) => (
          <optgroup
            key={group.label}
            label={group.label}
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {group.fonts.map((font) => (
              <option key={font.id} value={font.id} style={{ fontFamily: font.stack }}>
                {font.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </Field>
  );
}

export function TypographyPanel({ style, update }: StylePanelProps) {
  const display = FONTS[style.displayFont];
  const effective = resolveWeight(style.displayFont, style.titleWeight);
  return (
    <>
      <Group title="Typefaces">
        <FontSelect
          label="Display font"
          value={style.displayFont}
          onChange={(displayFont) => update({ displayFont })}
        />
        <FontSelect
          label="Body font"
          value={style.bodyFont}
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
