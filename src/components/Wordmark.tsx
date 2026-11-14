export function Wordmark({ onClick }: { onClick?: () => void }) {
  const content = (
    <>
      <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden className="shrink-0">
        <rect
          x="0.75"
          y="0.75"
          width="20.5"
          height="14.5"
          rx="2.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="6" cy="8" r="2.6" fill="var(--color-accent)" />
        <rect x="10.5" y="5.5" width="7" height="1.5" fill="currentColor" />
        <rect x="10.5" y="9" width="4.5" height="1.5" fill="currentColor" opacity="0.45" />
      </svg>
      <span className="font-serif text-[22px] leading-none tracking-[-0.01em]">Readme Cards</span>
    </>
  );
  if (!onClick) return <span className="flex items-center gap-2.5">{content}</span>;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-[var(--radius-control)]"
      aria-label="Readme Cards, back to templates"
    >
      {content}
    </button>
  );
}
