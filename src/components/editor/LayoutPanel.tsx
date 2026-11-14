import { AlignCenter, AlignLeft, AlignRight } from "iconoir-react";
import { STYLE_LIMITS } from "../../state/limits";
import type { Align, TemplateVariant } from "../../types/card";
import { Group, Segmented, SliderField, Toggle } from "../ui/fields";
import type { StylePanelProps } from "./AppearancePanel";

export function LayoutPanel({
  style,
  update,
  variant,
  variants,
  onVariant,
  overflow,
}: StylePanelProps & {
  overflow: boolean;
  variant: string;
  variants: TemplateVariant[];
  onVariant: (variant: string) => void;
}) {
  const alignOptions: { value: Align; label: React.ReactNode; title: string }[] = [
    { value: "left", label: <AlignLeft width={15} height={15} aria-hidden />, title: "Align left" },
    {
      value: "center",
      label: <AlignCenter width={15} height={15} aria-hidden />,
      title: "Align centre",
    },
    {
      value: "right",
      label: <AlignRight width={15} height={15} aria-hidden />,
      title: "Align right",
    },
  ];
  return (
    <>
      <Group title="Variation">
        <Segmented
          label="Layout"
          hideLabel
          value={variant}
          onChange={onVariant}
          options={variants.map((v) => ({ value: v.value, label: v.label }))}
        />
      </Group>
      <Group title="Size">
        <SliderField
          label="Width"
          unit="px"
          {...STYLE_LIMITS.width}
          value={style.width}
          onChange={(width) => update({ width })}
        />
        <Toggle
          label="Fit height to content"
          checked={style.autoHeight}
          onChange={(autoHeight) => update({ autoHeight })}
        />
        <SliderField
          label="Height"
          unit="px"
          {...STYLE_LIMITS.height}
          value={style.height}
          disabled={style.autoHeight}
          hint={
            style.autoHeight ? undefined : overflow ? (
              <span className="text-danger">
                Content is taller than the card and is being cut off. Increase the height or fit
                height to content.
              </span>
            ) : (
              "Content is centred vertically and clipped if it overflows."
            )
          }
          onChange={(height) => update({ height })}
        />
      </Group>
      <Group title="Spacing">
        <SliderField
          label="Padding"
          unit="px"
          {...STYLE_LIMITS.padding}
          value={style.padding}
          onChange={(padding) => update({ padding })}
        />
        <SliderField
          label="Element spacing"
          unit="px"
          {...STYLE_LIMITS.gap}
          value={style.gap}
          onChange={(gap) => update({ gap })}
        />
        <Segmented
          label="Alignment"
          value={style.align}
          onChange={(align) => update({ align })}
          options={alignOptions}
        />
        <Toggle
          label="Divider"
          description="A hairline between the main text and the details."
          checked={style.showDivider}
          onChange={(showDivider) => update({ showDivider })}
        />
      </Group>
    </>
  );
}
