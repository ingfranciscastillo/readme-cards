export function Wordmark({ onClick }: { onClick?: () => void }) {
  const content = (
    <span className="font-serif text-[22px] leading-none tracking-[-0.01em]">Readme Cards</span>
  );
  if (!onClick) return <span className="flex items-center">{content}</span>;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center rounded-[var(--radius-control)]"
      aria-label="Readme Cards, back to templates"
    >
      {content}
    </button>
  );
}
