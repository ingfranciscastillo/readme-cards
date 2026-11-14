import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-ink/88 border border-ink",
  secondary: "border border-line-strong bg-white/60 text-ink hover:border-ink-3 hover:bg-white",
  ghost: "border border-transparent text-ink-2 hover:bg-paper-3 hover:text-ink",
  danger: "border border-danger/40 bg-danger-soft text-danger hover:border-danger",
};

const SIZES: Record<Size, string> = {
  sm: "h-7 gap-1.5 px-2 text-[12px]",
  md: "h-8 gap-2 px-3 text-[13px]",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

export function Button({
  variant = "secondary",
  size = "md",
  icon,
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex shrink-0 items-center justify-center rounded-[var(--radius-control)] font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

export function IconButton({
  label,
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-control)] text-ink-2 transition-colors hover:bg-paper-3 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
