import { Github } from "iconoir-react";

export const REPO_URL = "https://github.com/ingfranciscastillo/readme-cards";

/** Icon link to the project's source on GitHub. */
export function GithubLink() {
  return (
    <a
      href={REPO_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Source code on GitHub"
      title="Source code on GitHub"
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-control)] text-ink-2 transition-colors hover:bg-paper-3 hover:text-ink"
    >
      <Github width={18} height={18} aria-hidden />
    </a>
  );
}
