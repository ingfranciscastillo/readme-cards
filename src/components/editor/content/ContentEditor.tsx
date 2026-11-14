import type { CardConfig, TemplateId } from "../../../types/card";
import type {
  ProfileContent,
  QuoteContent,
  RepositoryContent,
  StackContent,
} from "../../../types/content";
import { ProfileEditor } from "./ProfileEditor";
import { QuoteEditor } from "./QuoteEditor";
import { RepositoryEditor } from "./RepositoryEditor";
import { StackEditor } from "./StackEditor";

/** Picks the content form for a template; the casts mirror the registry's type erasure. */
export function ContentEditor({
  templateId,
  config,
  update,
}: {
  templateId: TemplateId;
  config: CardConfig<unknown>;
  update: (patch: Record<string, unknown>) => void;
}) {
  switch (templateId) {
    case "profile":
      return <ProfileEditor content={config.content as ProfileContent} update={update} />;
    case "repository":
      return <RepositoryEditor content={config.content as RepositoryContent} update={update} />;
    case "quote":
      return (
        <QuoteEditor
          content={config.content as QuoteContent}
          update={update}
          displayFont={config.style.displayFont}
        />
      );
    case "stack":
      return <StackEditor content={config.content as StackContent} update={update} />;
  }
}
