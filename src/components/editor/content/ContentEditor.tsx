import type { CardConfig, TemplateId } from "../../../types/card";
import type {
  BannerContent,
  ContactContent,
  FeaturesContent,
  InstallContent,
  LanguagesContent,
  NowContent,
  ProfileContent,
  ProjectsContent,
  QuoteContent,
  RepositoryContent,
  SectionContent,
  StackContent,
} from "../../../types/content";
import { BannerEditor } from "./BannerEditor";
import { ContactEditor } from "./ContactEditor";
import { FeaturesEditor } from "./FeaturesEditor";
import { InstallEditor } from "./InstallEditor";
import { LanguagesEditor } from "./LanguagesEditor";
import { NowEditor } from "./NowEditor";
import { ProfileEditor } from "./ProfileEditor";
import { ProjectsEditor } from "./ProjectsEditor";
import { QuoteEditor } from "./QuoteEditor";
import { RepositoryEditor } from "./RepositoryEditor";
import { SectionEditor } from "./SectionEditor";
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
    case "banner":
      return <BannerEditor content={config.content as BannerContent} update={update} />;
    case "contact":
      return <ContactEditor content={config.content as ContactContent} update={update} />;
    case "now":
      return <NowEditor content={config.content as NowContent} update={update} />;
    case "install":
      return <InstallEditor content={config.content as InstallContent} update={update} />;
    case "features":
      return <FeaturesEditor content={config.content as FeaturesContent} update={update} />;
    case "projects":
      return <ProjectsEditor content={config.content as ProjectsContent} update={update} />;
    case "section":
      return <SectionEditor content={config.content as SectionContent} update={update} />;
    case "languages":
      return <LanguagesEditor content={config.content as LanguagesContent} update={update} />;
  }
}
