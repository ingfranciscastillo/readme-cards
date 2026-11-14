import { Plus, Trash } from "iconoir-react";
import { useId } from "react";
import { SOCIAL_PLATFORMS } from "../../../templates/socials";
import type { SocialLink, SocialPlatform } from "../../../types/content";
import { Button, IconButton } from "../../ui/Button";
import { ShowSwitch } from "./common";

/** Editable list of platform + handle rows, shared by the Profile and Contact editors. */
export function SocialLinksEditor({
  label,
  links,
  onChange,
  max,
  shown,
  onShown,
  emptyText = "No links yet. Add where people can find you.",
}: {
  label: string;
  links: SocialLink[];
  onChange: (links: SocialLink[], options?: { reveal?: boolean }) => void;
  max: number;
  shown?: boolean;
  onShown?: (shown: boolean) => void;
  emptyText?: string;
}) {
  const id = useId();
  const setLink = (index: number, patch: Partial<SocialLink>) =>
    onChange(links.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  const dimmed = shown === false;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span id={id} className="text-[12px] font-medium text-ink-2">
          {label}
        </span>
        {onShown && shown !== undefined ? (
          <ShowSwitch label={label.toLowerCase()} checked={shown} onChange={onShown} />
        ) : null}
      </div>
      {links.length > 0 ? (
        <ul className={`flex flex-col gap-2 ${dimmed ? "opacity-55" : ""}`} aria-labelledby={id}>
          {links.map((link, index) => (
            <li key={link.id} className="flex gap-2">
              <select
                aria-label={`Platform for link ${index + 1}`}
                className="control w-[112px] shrink-0 cursor-pointer"
                value={link.platform}
                onChange={(e) => setLink(index, { platform: e.target.value as SocialPlatform })}
              >
                {SOCIAL_PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <input
                aria-label={`Handle for link ${index + 1}`}
                className="control"
                value={link.handle}
                maxLength={80}
                spellCheck={false}
                placeholder="handle or address"
                onChange={(e) => setLink(index, { handle: e.target.value })}
              />
              <IconButton
                label={`Remove link ${index + 1}`}
                className="mt-0.5"
                onClick={() => onChange(links.filter((_, i) => i !== index))}
              >
                <Trash width={14} height={14} aria-hidden />
              </IconButton>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[11.5px] text-ink-3">{emptyText}</p>
      )}
      <div>
        <Button
          size="sm"
          variant="ghost"
          icon={<Plus width={13} height={13} aria-hidden />}
          disabled={links.length >= max}
          onClick={() =>
            onChange(
              [...links, { id: `s${Date.now().toString(36)}`, platform: "link", handle: "" }],
              { reveal: true },
            )
          }
        >
          {links.length >= max ? `Up to ${max} links` : "Add link"}
        </Button>
      </div>
    </div>
  );
}
