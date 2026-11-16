import type {
  LanguageEntry,
  ProfileContent,
  ProjectEntry,
  RepositoryContent,
  SocialLink,
  SocialPlatform,
} from "../../types/content";
import { languageColor } from "../languages";
import type { GithubRepo, GithubRepoSummary, GithubSocialAccount, GithubUser } from "./api";

export function avatarUrl(url: string, size = 160): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("s", String(size));
    return parsed.toString();
  } catch {
    return url;
  }
}

/** Map a GitHub user onto profile content, keeping fields GitHub does not know about. */
export function mapUser(user: GithubUser, current: ProfileContent): ProfileContent {
  const socials: SocialLink[] = current.socials.filter(
    (s) => s.platform !== "github" && s.platform !== "x",
  );
  socials.unshift({ id: `gh-${user.login}`, platform: "github", handle: user.login });
  if (user.twitter_username) {
    socials.splice(1, 0, {
      id: `x-${user.twitter_username}`,
      platform: "x",
      handle: `@${user.twitter_username}`,
    });
  }
  return {
    ...current,
    displayName: user.name?.trim() || user.login,
    username: user.login,
    bio: user.bio?.trim() ?? "",
    location: user.location?.trim() ?? "",
    website: user.blog?.trim() ?? "",
    showBio: Boolean(user.bio?.trim()),
    showLocation: Boolean(user.location?.trim()),
    showWebsite: Boolean(user.blog?.trim()),
    socials,
    followers: user.followers,
    following: user.following,
    repos: user.public_repos,
  };
}

export function mapRepo(repo: GithubRepo, current: RepositoryContent): RepositoryContent {
  const license =
    repo.license?.spdx_id && repo.license.spdx_id !== "NOASSERTION"
      ? repo.license.spdx_id
      : (repo.license?.name ?? "");
  return {
    ...current,
    owner: repo.owner.login,
    name: repo.name,
    description: repo.description?.trim() ?? "",
    language: repo.language ?? "",
    languageColor: languageColor(repo.language ?? "", current.languageColor),
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    license,
    showDescription: Boolean(repo.description?.trim()),
    showLanguage: Boolean(repo.language),
    showLicense: Boolean(license),
  };
}

/** Count the user's own, non-archived repositories by primary language. */
export function repoLanguageCounts(repos: GithubRepoSummary[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const repo of repos) {
    if (repo.fork || repo.archived || !repo.language) continue;
    counts[repo.language] = (counts[repo.language] ?? 0) + 1;
  }
  return counts;
}

/** Largest languages first; anything past `limit - 1` entries is folded into "Other". */
export function mapLanguages(weights: Record<string, number>, limit = 8): LanguageEntry[] {
  const sorted = Object.entries(weights)
    .filter(([, value]) => Number.isFinite(value) && value > 0)
    .sort((a, b) => b[1] - a[1]);
  const head = sorted.length > limit ? sorted.slice(0, limit - 1) : sorted;
  const rest = sorted.slice(head.length).reduce((sum, [, value]) => sum + value, 0);
  const entries = head.map(([name, value], i) => ({
    id: `gh-${i}-${name}`,
    name,
    value,
    color: languageColor(name),
  }));
  if (rest > 0) entries.push({ id: "gh-other", name: "Other", value: rest, color: "#8b8b85" });
  return entries;
}

function stripUrl(url: string): string {
  return url
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "");
}

const PROVIDERS: Record<string, SocialPlatform> = {
  linkedin: "linkedin",
  mastodon: "mastodon",
  youtube: "youtube",
  instagram: "instagram",
};

/** Mastodon profile URLs (https://host/@user) read better as @user@host. */
function mastodonHandle(url: string): string {
  const match = stripUrl(url).match(/^([^/]+)\/@([^/]+)$/);
  return match ? `@${match[2]}@${match[1]}` : stripUrl(url);
}

/** Build contact links from a GitHub profile and its listed social accounts. */
export function mapContactLinks(user: GithubUser, accounts: GithubSocialAccount[]): SocialLink[] {
  const links: SocialLink[] = [{ id: `gh-${user.login}`, platform: "github", handle: user.login }];
  if (user.twitter_username) {
    links.push({
      id: `x-${user.twitter_username}`,
      platform: "x",
      handle: `@${user.twitter_username}`,
    });
  }
  for (const [i, account] of accounts.entries()) {
    if (account.provider === "twitter") {
      const name = stripUrl(account.url).split("/").pop();
      if (!user.twitter_username && name)
        links.push({ id: `sa-${i}`, platform: "x", handle: `@${name}` });
      continue;
    }
    const platform = PROVIDERS[account.provider] ?? "link";
    const handle = platform === "mastodon" ? mastodonHandle(account.url) : stripUrl(account.url);
    if (handle) links.push({ id: `sa-${i}`, platform, handle });
  }
  if (user.email) links.push({ id: "email", platform: "email", handle: user.email });
  if (user.blog?.trim()) links.push({ id: "blog", platform: "link", handle: stripUrl(user.blog) });
  return links;
}

/** The user's own, non-archived repositories with the most stars, as project entries. */
export function mapProjects(repos: GithubRepoSummary[], limit: number): ProjectEntry[] {
  return repos
    .filter((repo) => !repo.fork && !repo.archived)
    .sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0))
    .slice(0, limit)
    .map((repo, i) => ({
      id: `gh${i}-${repo.name}`,
      name: repo.name,
      description: repo.description?.trim() ?? "",
      language: repo.language ?? "",
      languageColor: languageColor(repo.language ?? ""),
      stars: repo.stargazers_count ?? 0,
    }));
}
