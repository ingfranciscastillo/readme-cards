import type { ProfileContent, RepositoryContent, SocialLink } from "../../types/content";
import { languageColor } from "../languages";
import type { GithubRepo, GithubUser } from "./api";

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
