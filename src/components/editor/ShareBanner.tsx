import { Link, WarningTriangle, Xmark } from "iconoir-react";
import { useEffect, useId, useRef } from "react";
import type { ShareNotice } from "../../state/useShareLink";
import { Button } from "../ui/Button";

/** Tells the person what a share link did, or asks before it replaces their edits. */
export function ShareBanner({
  notice,
  templateName,
  onAccept,
  onDismiss,
}: {
  notice: ShareNotice;
  templateName: string;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const messageId = useId();
  // A question needs an answer: move focus to it so keyboard users meet it first.
  useEffect(() => {
    if (notice.kind === "confirm") ref.current?.querySelector("button")?.focus();
  }, [notice.kind]);

  const broken = notice.kind === "broken";
  return (
    <div
      ref={ref}
      {...(notice.kind === "confirm"
        ? { role: "alertdialog", "aria-labelledby": messageId }
        : { role: "status" })}
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-2.5 text-[12.5px] ${
        broken
          ? "border-danger/30 bg-danger-soft text-danger"
          : "border-line bg-accent-soft text-ink"
      }`}
    >
      <span className="flex min-w-0 flex-1 items-start gap-2">
        {broken ? (
          <WarningTriangle width={15} height={15} className="mt-px shrink-0" aria-hidden />
        ) : (
          <Link width={15} height={15} className="mt-px shrink-0 text-accent" aria-hidden />
        )}
        <span id={messageId}>
          {notice.kind === "broken"
            ? "This share link is broken or incomplete, so the card was not changed."
            : notice.kind === "confirm"
              ? `This link has a shared ${templateName} card. Replace your edits with it?`
              : "Loaded a shared card. It's saved in this browser like your own edits."}
          {notice.kind !== "broken" && notice.droppedImages
            ? " Images aren't included in share links, so upload the avatar again."
            : ""}
        </span>
      </span>
      {notice.kind === "confirm" ? (
        <span className="flex gap-2">
          <Button size="sm" variant="primary" onClick={onAccept}>
            Replace my edits
          </Button>
          <Button size="sm" onClick={onDismiss}>
            Keep mine
          </Button>
        </span>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          aria-label="Dismiss"
          icon={<Xmark width={14} height={14} aria-hidden />}
          onClick={onDismiss}
        />
      )}
    </div>
  );
}
