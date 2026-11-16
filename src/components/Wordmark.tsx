export function Wordmark({ onClick }: { onClick?: () => void }) {
  const content = (
    <span className="font-display text-[21px] leading-none font-extrabold font-stretch-[80%] tracking-[-0.02em]">
      Readme Cards
    </span>
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
