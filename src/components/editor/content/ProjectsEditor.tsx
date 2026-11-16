import { Plus, Trash } from "iconoir-react";
import { fetchUserRepos } from "../../../lib/github/api";
import { mapProjects } from "../../../lib/github/map";
import { languageColor } from "../../../lib/languages";
import { MAX_PROJECTS } from "../../../templates/projects";
import type { ProjectEntry, ProjectsContent } from "../../../types/content";
import { Button, IconButton } from "../../ui/Button";
import { Group, Toggle } from "../../ui/fields";
import { GithubImport } from "../GithubImport";
import { type ContentEditorProps, NumberInput, OptionalInput } from "./common";

export function ProjectsEditor({ content, update }: ContentEditorProps<ProjectsContent>) {
  const projects = content.projects;
  const setProject = (index: number, patch: Partial<ProjectEntry>) =>
    update({ projects: projects.map((p, i) => (i === index ? { ...p, ...patch } : p)) });
  return (
    <>
      <Group title="GitHub">
        <GithubImport
          mode="user"
          onImport={async (user, signal) => {
            const repos = await fetchUserRepos(user.login, signal);
            const imported = mapProjects(
              repos,
              Math.max(4, Math.min(projects.length, MAX_PROJECTS)),
            );
            if (imported.length === 0)
              return `@${user.login} has no public repositories of their own yet.`;
            update({ projects: imported });
            return undefined;
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
      <Group title="Projects">
        {projects.length > 0 ? (
          <ul className="flex flex-col gap-3" aria-label="Projects">
            {projects.map((project, index) => (
              <li key={project.id} className="flex flex-col gap-1.5">
                <div className="flex gap-2">
                  <input
                    aria-label={`Name of project ${index + 1}`}
                    className="control"
                    value={project.name}
                    maxLength={60}
                    spellCheck={false}
                    placeholder="Repository name"
                    onChange={(e) => setProject(index, { name: e.target.value })}
                  />
                  <div className="w-[84px] shrink-0">
                    <NumberInput
                      label={`Stars of project ${index + 1}`}
                      value={project.stars}
                      onChange={(stars) => setProject(index, { stars })}
                    />
                  </div>
                  <IconButton
                    label={`Remove project ${index + 1}`}
                    className="mt-0.5"
                    onClick={() => update({ projects: projects.filter((_, i) => i !== index) })}
                  >
                    <Trash width={14} height={14} aria-hidden />
                  </IconButton>
                </div>
                <input
                  aria-label={`Description of project ${index + 1}`}
                  className="control"
                  value={project.description}
                  maxLength={160}
                  placeholder="What it does"
                  onChange={(e) => setProject(index, { description: e.target.value })}
                />
                <input
                  aria-label={`Language of project ${index + 1}`}
                  className="control"
                  value={project.language}
                  maxLength={30}
                  placeholder="Main language"
                  onChange={(e) =>
                    setProject(index, {
                      language: e.target.value,
                      languageColor: languageColor(e.target.value.trim(), project.languageColor),
                    })
                  }
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[11.5px] text-ink-3">
            No projects yet. Add one or import from GitHub.
          </p>
        )}
        <div>
          <Button
            size="sm"
            variant="ghost"
            icon={<Plus width={13} height={13} aria-hidden />}
            disabled={projects.length >= MAX_PROJECTS}
            onClick={() =>
              update({
                projects: [
                  ...projects,
                  {
                    id: `p${Date.now().toString(36)}`,
                    name: "",
                    description: "",
                    language: "",
                    languageColor: "#8b8b85",
                    stars: 0,
                  },
                ],
              })
            }
          >
            {projects.length >= MAX_PROJECTS ? `Up to ${MAX_PROJECTS} projects` : "Add project"}
          </Button>
        </div>
      </Group>
      <Group title="Details">
        <Toggle
          label="Show descriptions"
          checked={content.showDescription}
          onChange={(showDescription) => update({ showDescription })}
        />
        <Toggle
          label="Show languages"
          checked={content.showLanguage}
          onChange={(showLanguage) => update({ showLanguage })}
        />
        <Toggle
          label="Show stars"
          checked={content.showStars}
          onChange={(showStars) => update({ showStars })}
          description="Numbers are a snapshot; export again to refresh them."
        />
      </Group>
    </>
  );
}
