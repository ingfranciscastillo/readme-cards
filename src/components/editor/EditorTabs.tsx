import { useId, useRef } from "react";

export type EditorTab = "content" | "appearance" | "typography" | "layout";

export const EDITOR_TABS: { id: EditorTab; label: string }[] = [
  { id: "content", label: "Content" },
  { id: "appearance", label: "Appearance" },
  { id: "typography", label: "Type" },
  { id: "layout", label: "Layout" },
];

/** WAI-ARIA tabs with roving focus (arrow keys, Home and End). */
export function EditorTabs({
  active,
  onChange,
  children,
}: {
  active: EditorTab;
  onChange: (tab: EditorTab) => void;
  children: React.ReactNode;
}) {
  const id = useId();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const focus = (index: number) => {
    const tab = EDITOR_TABS[(index + EDITOR_TABS.length) % EDITOR_TABS.length];
    onChange(tab.id);
    refs.current[tab.id]?.focus();
  };
  const current = EDITOR_TABS.findIndex((t) => t.id === active);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        role="tablist"
        aria-label="Card settings"
        className="sticky top-0 z-10 flex border-b border-line bg-paper px-3"
      >
        {EDITOR_TABS.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                refs.current[tab.id] = el;
              }}
              id={`${id}-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") focus(current + 1);
                else if (e.key === "ArrowLeft") focus(current - 1);
                else if (e.key === "Home") focus(0);
                else if (e.key === "End") focus(EDITOR_TABS.length - 1);
                else return;
                e.preventDefault();
              }}
              className={`relative -mb-px h-10 flex-1 border-b-2 px-2 text-[12.5px] transition-colors ${
                selected
                  ? "border-ink font-medium text-ink"
                  : "border-transparent text-ink-2 hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${active}`}
        tabIndex={-1}
        className="min-h-0 flex-1"
      >
        {children}
      </div>
    </div>
  );
}
