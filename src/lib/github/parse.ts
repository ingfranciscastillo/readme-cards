export type GithubTarget =
  | { kind: "user"; username: string }
  | { kind: "repo"; owner: string; repo: string };

const NAME = /^[a-z\d](?:[a-z\d-]{0,38})$/i;
const REPO = /^[\w.-]{1,100}$/;

/**
 * Accepts `octocat`, `@octocat`, `octocat/hello-world`, and github.com URLs
 * (with or without protocol, `.git` suffix or trailing paths).
 */
export function parseGithubInput(input: string): GithubTarget | null {
  let value = input.trim();
  if (!value) return null;
  value = value
    .replace(/^git@github\.com:/i, "")
    .replace(/^(https?:\/\/)?(www\.)?github\.com\/?/i, "")
    .replace(/^@/, "")
    .replace(/[?#].*$/, "")
    .replace(/\/+$/, "");
  const [owner, repo] = value.split("/");
  if (!owner || !NAME.test(owner)) return null;
  if (!repo) return { kind: "user", username: owner };
  const cleanRepo = repo.replace(/\.git$/i, "");
  if (!REPO.test(cleanRepo) || cleanRepo === "." || cleanRepo === "..") return null;
  return { kind: "repo", owner, repo: cleanRepo };
}
