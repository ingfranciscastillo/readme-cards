import { MediaImage, Plus, Trash, Upload } from "iconoir-react";
import { useId, useRef, useState } from "react";
import { avatarUrl, mapUser } from "../../../lib/github/map";
import { imageToDataUri } from "../../../lib/image";
import { SOCIAL_PLATFORMS } from "../../../templates/profile";
import { isDataImage } from "../../../templates/shared";
import type { AvatarShape, ProfileContent, SocialPlatform } from "../../../types/content";
import { Button, IconButton } from "../../ui/Button";
import { Group, Segmented, TextField, Toggle } from "../../ui/fields";
import { GithubImport } from "../GithubImport";
import { type ContentEditorProps, NumberInput, OptionalInput, ShowSwitch } from "./common";

const MAX_SOCIALS = 6;

function AvatarControls({ content, update }: ContentEditorProps<ProfileContent>) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const hasImage = isDataImage(content.avatar);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (file.size > 8 * 1024 * 1024) {
      setError("Choose an image under 8 MB.");
      return;
    }
    setBusy(true);
    try {
      update({ avatar: await imageToDataUri(file), showAvatar: true });
    } catch (err) {
      setError((err as Error).message || "That image could not be read.");
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-ink-2">Avatar</span>
        <ShowSwitch
          label="avatar"
          checked={content.showAvatar}
          onChange={(showAvatar) => update({ showAvatar })}
        />
      </div>
      <div className={`flex items-center gap-3 ${content.showAvatar ? "" : "opacity-55"}`}>
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-paper-2">
          {hasImage ? (
            <img src={content.avatar} alt="Current avatar" className="size-full object-cover" />
          ) : (
            <MediaImage width={18} height={18} className="text-ink-3" aria-hidden />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            icon={<Upload width={13} height={13} aria-hidden />}
            onClick={() => fileInput.current?.click()}
            disabled={busy}
          >
            {busy ? "Processing…" : hasImage ? "Replace" : "Upload image"}
          </Button>
          {hasImage ? (
            <Button size="sm" variant="ghost" onClick={() => update({ avatar: "" })}>
              Use initials
            </Button>
          ) : null}
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>
      <p className="text-[11.5px] leading-snug text-ink-3">
        {error ? (
          <span className="text-danger">{error}</span>
        ) : (
          "Images are cropped square and embedded at 160 px, so the SVG makes no external requests. Without one, initials are drawn."
        )}
      </p>
      <Segmented<AvatarShape>
        label="Avatar shape"
        size="sm"
        value={content.avatarShape}
        onChange={(avatarShape) => update({ avatarShape })}
        options={[
          { value: "circle", label: "Circle" },
          { value: "rounded", label: "Rounded" },
          { value: "square", label: "Square" },
        ]}
      />
    </div>
  );
}

function Socials({ content, update }: ContentEditorProps<ProfileContent>) {
  const id = useId();
  const setSocial = (index: number, patch: Partial<ProfileContent["socials"][number]>) => {
    update({ socials: content.socials.map((s, i) => (i === index ? { ...s, ...patch } : s)) });
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span id={id} className="text-[12px] font-medium text-ink-2">
          Social links
        </span>
        <ShowSwitch
          label="social links"
          checked={content.showSocials}
          onChange={(showSocials) => update({ showSocials })}
        />
      </div>
      {content.socials.length > 0 ? (
        <ul
          className={`flex flex-col gap-2 ${content.showSocials ? "" : "opacity-55"}`}
          aria-labelledby={id}
        >
          {content.socials.map((social, index) => (
            <li key={social.id} className="flex gap-2">
              <select
                aria-label={`Platform for link ${index + 1}`}
                className="control w-[112px] shrink-0 cursor-pointer"
                value={social.platform}
                onChange={(e) => setSocial(index, { platform: e.target.value as SocialPlatform })}
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
                value={social.handle}
                maxLength={80}
                spellCheck={false}
                placeholder="handle or address"
                onChange={(e) => setSocial(index, { handle: e.target.value })}
              />
              <IconButton
                label={`Remove link ${index + 1}`}
                className="mt-0.5"
                onClick={() => update({ socials: content.socials.filter((_, i) => i !== index) })}
              >
                <Trash width={14} height={14} aria-hidden />
              </IconButton>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[11.5px] text-ink-3">No links yet. Add where people can find you.</p>
      )}
      <div>
        <Button
          size="sm"
          variant="ghost"
          icon={<Plus width={13} height={13} aria-hidden />}
          disabled={content.socials.length >= MAX_SOCIALS}
          onClick={() =>
            update({
              showSocials: true,
              socials: [
                ...content.socials,
                { id: `s${Date.now().toString(36)}`, platform: "link", handle: "" },
              ],
            })
          }
        >
          {content.socials.length >= MAX_SOCIALS ? `Up to ${MAX_SOCIALS} links` : "Add link"}
        </Button>
      </div>
    </div>
  );
}

export function ProfileEditor({ content, update }: ContentEditorProps<ProfileContent>) {
  const statsId = useId();
  return (
    <>
      <Group title="GitHub">
        <GithubImport
          mode="user"
          onImport={async (user, signal) => {
            const next = mapUser(user, content);
            try {
              next.avatar = await imageToDataUri(avatarUrl(user.avatar_url), 160, signal);
              next.showAvatar = true;
              update(next);
              return undefined;
            } catch (error) {
              if ((error as Error).name === "AbortError") throw error;
              update({ ...next, avatar: "" });
              return "The avatar couldn't be embedded, so initials are shown. You can upload the image instead.";
            }
          }}
        />
      </Group>
      <Group title="Identity">
        <AvatarControls content={content} update={update} />
        <TextField
          label="Display name"
          value={content.displayName}
          maxLength={80}
          onChange={(displayName) => update({ displayName })}
        />
        <OptionalInput
          label="Username"
          shown={content.showUsername}
          onShown={(showUsername) => update({ showUsername })}
          value={content.username}
          maxLength={60}
          onChange={(username) => update({ username })}
        />
        <OptionalInput
          label="Bio"
          multiline
          shown={content.showBio}
          onShown={(showBio) => update({ showBio })}
          value={content.bio}
          maxLength={300}
          onChange={(bio) => update({ bio })}
        />
      </Group>
      <Group title="Details">
        <OptionalInput
          label="Location"
          shown={content.showLocation}
          onShown={(showLocation) => update({ showLocation })}
          value={content.location}
          maxLength={80}
          onChange={(location) => update({ location })}
        />
        <OptionalInput
          label="Website"
          type="url"
          shown={content.showWebsite}
          onShown={(showWebsite) => update({ showWebsite })}
          value={content.website}
          onChange={(website) => update({ website })}
          hint="Shown as text: images in a README aren't clickable. Wrap the Markdown in a link if you need one."
        />
        <Socials content={content} update={update} />
      </Group>
      <Group title="Stats">
        <Toggle
          label="Show follower and repository counts"
          checked={content.showStats}
          onChange={(showStats) => update({ showStats })}
          description="Imported values are a snapshot; the exported SVG does not update itself."
        />
        <div className={`grid grid-cols-3 gap-2 ${content.showStats ? "" : "opacity-55"}`}>
          {(
            [
              ["followers", "Followers"],
              ["following", "Following"],
              ["repos", "Repos"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex flex-col gap-1 text-[11.5px] text-ink-2">
              <label htmlFor={`${statsId}-${key}`}>{label}</label>
              <NumberInput
                id={`${statsId}-${key}`}
                value={content[key]}
                onChange={(v) => update({ [key]: v })}
              />
            </div>
          ))}
        </div>
      </Group>
    </>
  );
}
