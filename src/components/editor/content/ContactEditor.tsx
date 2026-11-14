import { fetchSocialAccounts, type GithubSocialAccount } from "../../../lib/github/api";
import { mapContactLinks } from "../../../lib/github/map";
import { MAX_CONTACT_LINKS } from "../../../templates/contact";
import type { ContactContent } from "../../../types/content";
import { Group, Toggle } from "../../ui/fields";
import { GithubImport } from "../GithubImport";
import { type ContentEditorProps, OptionalInput } from "./common";
import { SocialLinksEditor } from "./SocialLinksEditor";

export function ContactEditor({ content, update }: ContentEditorProps<ContactContent>) {
  return (
    <>
      <Group title="GitHub">
        <GithubImport
          mode="user"
          onImport={async (user, signal) => {
            let accounts: GithubSocialAccount[] = [];
            let warning: string | undefined;
            try {
              accounts = await fetchSocialAccounts(user.login, signal);
            } catch (error) {
              if ((error as Error).name === "AbortError") throw error;
              warning =
                "Social accounts couldn't be read, so only the basic profile links were added.";
            }
            update({ links: mapContactLinks(user, accounts).slice(0, MAX_CONTACT_LINKS) });
            return warning;
          }}
        />
      </Group>
      <Group title="Heading">
        <OptionalInput
          label="Title"
          shown={content.showTitle}
          onShown={(showTitle) => update({ showTitle })}
          value={content.title}
          maxLength={80}
          onChange={(title) => update({ title })}
        />
        <OptionalInput
          label="Subtitle"
          shown={content.showSubtitle}
          onShown={(showSubtitle) => update({ showSubtitle })}
          value={content.subtitle}
          maxLength={160}
          onChange={(subtitle) => update({ subtitle })}
        />
      </Group>
      <Group title="Links">
        <SocialLinksEditor
          label="Links"
          links={content.links}
          max={MAX_CONTACT_LINKS}
          onChange={(links) => update({ links })}
        />
        <Toggle
          label="Show platform names"
          checked={content.showPlatform}
          onChange={(showPlatform) => update({ showPlatform })}
          description="Used by the Rows and Grid layouts."
        />
      </Group>
    </>
  );
}
