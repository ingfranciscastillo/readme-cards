import { type ReactNode, useEffect, useId, useState } from "react";

export function Field({
  label,
  hint,
  children,
  htmlFor,
  aside,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  htmlFor?: string;
  aside?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="text-[12px] font-medium text-ink-2">
          {label}
        </label>
        {aside}
      </div>
      {children}
      {hint ? <p className="text-[11.5px] leading-snug text-ink-3">{hint}</p> : null}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  maxLength = 200,
  disabled,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: ReactNode;
  maxLength?: number;
  disabled?: boolean;
  type?: "text" | "url" | "email";
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <input
        id={id}
        type={type}
        className="control"
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        spellCheck={type === "text"}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  rows = 3,
  maxLength = 600,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: ReactNode;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <Field
      label={label}
      hint={hint}
      htmlFor={id}
      aside={
        <span className="font-mono text-[10.5px] text-ink-3 tabular-nums">
          {value.length}/{maxLength}
        </span>
      }
    >
      <textarea
        id={id}
        className="control h-auto resize-y py-1.5 leading-relaxed"
        rows={rows}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

/** Range slider paired with a number input; both are keyboard accessible. */
export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
  disabled,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
  hint?: ReactNode;
}) {
  const id = useId();
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);

  const commit = (raw: string) => {
    const parsed = Number.parseFloat(raw);
    if (Number.isFinite(parsed)) {
      const clamped = Math.min(max, Math.max(min, parsed));
      onChange(Math.round(clamped / step) * step);
      setDraft(String(Math.round(Math.round(clamped / step) * step * 1000) / 1000));
    } else {
      setDraft(String(value));
    }
  };

  return (
    <Field label={label} hint={hint} htmlFor={`${id}-n`}>
      <div className="flex items-center gap-3">
        <input
          type="range"
          aria-label={label}
          className="h-1 min-w-0 flex-1 cursor-pointer disabled:cursor-not-allowed"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <div className="relative w-[76px] shrink-0">
          <input
            id={`${id}-n`}
            type="number"
            inputMode="decimal"
            className="control pr-7 text-right font-mono text-[12px] tabular-nums"
            min={min}
            max={max}
            step={step}
            value={draft}
            disabled={disabled}
            onChange={(e) => {
              setDraft(e.target.value);
              const parsed = Number.parseFloat(e.target.value);
              if (Number.isFinite(parsed) && parsed >= min && parsed <= max) onChange(parsed);
            }}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit((e.target as HTMLInputElement).value);
            }}
          />
          {unit ? (
            <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 font-mono text-[10.5px] text-ink-3">
              {unit}
            </span>
          ) : null}
        </div>
      </div>
    </Field>
  );
}

const HEX6 = /^#[0-9a-f]{6}$/i;
const HEX3 = /^#[0-9a-f]{3}$/i;

function normalizeHex(input: string): string | null {
  let v = input.trim();
  if (!v.startsWith("#")) v = `#${v}`;
  if (HEX3.test(v)) v = `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;
  return HEX6.test(v) ? v.toLowerCase() : null;
}

export function ColorField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const id = useId();
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const invalid = normalizeHex(draft) === null;
  return (
    <Field label={label} htmlFor={`${id}-hex`}>
      <div className="flex items-center gap-2">
        <span className="relative size-8 shrink-0 overflow-hidden rounded-[var(--radius-control)] border border-control">
          <input
            type="color"
            aria-label={`${label} picker`}
            className="absolute -inset-2 size-12 cursor-pointer border-0 p-0 disabled:cursor-not-allowed"
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
          />
        </span>
        <input
          id={`${id}-hex`}
          className={`control font-mono text-[12px] uppercase ${invalid ? "border-danger" : ""}`}
          value={draft}
          maxLength={7}
          disabled={disabled}
          aria-invalid={invalid}
          spellCheck={false}
          onChange={(e) => {
            setDraft(e.target.value);
            const hex = normalizeHex(e.target.value);
            if (hex && e.target.value.length >= 4) onChange(hex);
          }}
          onBlur={() => setDraft(normalizeHex(draft) ?? value)}
        />
      </div>
    </Field>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  hint?: ReactNode;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <select
        id={id}
        className="control cursor-pointer appearance-none bg-[length:10px] bg-[right_10px_center] bg-no-repeat pr-7"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%2385878a' stroke-width='1.4'/%3E%3C/svg%3E\")",
        }}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  description,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: ReactNode;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <label htmlFor={id} className="cursor-pointer text-[12.5px] text-ink">
          {label}
        </label>
        {description ? (
          <p className="text-[11.5px] leading-snug text-ink-3">{description}</p>
        ) : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-[18px] w-[30px] shrink-0 cursor-pointer items-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
          checked ? "border-accent bg-accent" : "border-control bg-white"
        }`}
      >
        <span
          className={`inline-block size-3 rounded-full ${checked ? "bg-white" : "bg-ink-3"} shadow-[0_1px_1px_rgb(0_0_0/0.15)] transition-transform ${
            checked ? "translate-x-[14px]" : "translate-x-[2px]"
          }`}
        />
      </button>
    </div>
  );
}

/** Radio group rendered as a segmented control. Arrow keys move the selection. */
export function Segmented<T extends string | number>({
  label,
  value,
  onChange,
  options,
  hideLabel,
  size = "md",
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: ReactNode; title?: string; disabled?: boolean }[];
  hideLabel?: boolean;
  size?: "sm" | "md";
}) {
  const id = useId();
  const enabled = options.filter((o) => !o.disabled);
  const move = (dir: 1 | -1) => {
    const index = enabled.findIndex((o) => o.value === value);
    const next = enabled[(index + dir + enabled.length) % enabled.length];
    if (next) {
      onChange(next.value);
      document.getElementById(`${id}-${String(next.value)}`)?.focus();
    }
  };
  const group = (
    <div
      role="radiogroup"
      aria-labelledby={hideLabel ? undefined : `${id}-label`}
      aria-label={hideLabel ? label : undefined}
      className="flex rounded-[var(--radius-control)] border border-line bg-paper-2 p-0.5"
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          // biome-ignore lint/a11y/useSemanticElements: ARIA radio pattern with roving focus keeps the segmented styling.
          <button
            key={String(o.value)}
            id={`${id}-${String(o.value)}`}
            type="button"
            role="radio"
            aria-checked={selected}
            title={o.title}
            disabled={o.disabled}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                move(1);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                move(-1);
              }
            }}
            className={`inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[3px] px-2 whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
              size === "sm" ? "h-6 text-[11.5px]" : "h-7 text-[12px]"
            } ${selected ? "bg-white font-medium text-ink shadow-[0_0_0_1px_var(--color-control)]" : "text-ink-2 hover:text-ink"}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
  if (hideLabel) return group;
  return (
    <div className="flex flex-col gap-1.5">
      <span id={`${id}-label`} className="text-[12px] font-medium text-ink-2">
        {label}
      </span>
      {group}
    </div>
  );
}

export function Group({
  title,
  children,
  aside,
}: {
  title: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3.5 border-b border-line px-5 py-5 last:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <h3 className="eyebrow">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  );
}
