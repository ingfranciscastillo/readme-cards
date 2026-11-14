import type { ReactNode } from "react";
import { useId } from "react";

export interface ContentEditorProps<C> {
  content: C;
  update: (patch: Partial<C>) => void;
}

/** A compact "show" switch for optional card elements, placed beside a field. */
export function ShowSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={`Show ${label}`}
      onClick={() => onChange(!checked)}
      className={`inline-flex h-6 items-center gap-1.5 rounded-[3px] px-1.5 font-mono text-[10.5px] tracking-wide uppercase transition-colors ${
        checked ? "text-accent hover:bg-accent-soft" : "text-ink-3 hover:bg-paper-3"
      }`}
    >
      <span
        aria-hidden
        className={`inline-block size-2 rounded-full border ${checked ? "border-accent bg-accent" : "border-ink-3"}`}
      />
      {checked ? "Shown" : "Hidden"}
    </button>
  );
}

/** A labelled field with a show/hide switch; dimmed while hidden but still editable. */
export function OptionalField({
  label,
  shown,
  onShown,
  children,
  hint,
}: {
  label: string;
  shown: boolean;
  onShown: (shown: boolean) => void;
  children: (id: string) => ReactNode;
  hint?: ReactNode;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-[12px] font-medium text-ink-2">
          {label}
        </label>
        <ShowSwitch label={label.toLowerCase()} checked={shown} onChange={onShown} />
      </div>
      <div className={shown ? "" : "opacity-55"}>{children(id)}</div>
      {hint ? <p className="text-[11.5px] leading-snug text-ink-3">{hint}</p> : null}
    </div>
  );
}

export function NumberInput({
  id,
  value,
  onChange,
  label,
}: {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  label?: string;
}) {
  return (
    <input
      id={id}
      aria-label={label}
      type="number"
      min={0}
      step={1}
      inputMode="numeric"
      className="control font-mono text-[12px] tabular-nums"
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => {
        const n = Number.parseInt(e.target.value, 10);
        onChange(Number.isFinite(n) && n >= 0 ? n : 0);
      }}
    />
  );
}

export function OptionalInput({
  label,
  shown,
  onShown,
  value,
  onChange,
  maxLength = 120,
  hint,
  multiline,
  type = "text",
}: {
  label: string;
  shown: boolean;
  onShown: (shown: boolean) => void;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  hint?: ReactNode;
  multiline?: boolean;
  type?: "text" | "url";
}) {
  return (
    <OptionalField label={label} shown={shown} onShown={onShown} hint={hint}>
      {(id) =>
        multiline ? (
          <textarea
            id={id}
            className="control h-auto resize-y py-1.5 leading-relaxed"
            rows={3}
            maxLength={maxLength}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <input
            id={id}
            type={type}
            className="control"
            value={value}
            maxLength={maxLength}
            spellCheck={type === "text"}
            onChange={(e) => onChange(e.target.value)}
          />
        )
      }
    </OptionalField>
  );
}
