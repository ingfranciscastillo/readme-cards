const API = "https://api.github.com";
const TTL_MS = 10 * 60 * 1000;
const STORAGE_KEY = "readme-cards:github-cache";

export interface GithubUser {
  login: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  blog: string | null;
  twitter_username: string | null;
  /** Only present when the user made their email public. */
  email?: string | null;
  avatar_url: string;
  followers: number;
  following: number;
  public_repos: number;
}

export interface GithubRepo {
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  license: { spdx_id: string | null; name: string } | null;
  owner: { login: string; avatar_url: string };
}

export interface RateLimit {
  limit: number;
  remaining: number;
  /** Epoch milliseconds when the window resets. */
  resetAt: number;
}

export type GithubErrorKind = "not-found" | "rate-limited" | "network" | "invalid" | "unknown";

export class GithubError extends Error {
  readonly kind: GithubErrorKind;
  readonly rateLimit?: RateLimit;
  constructor(kind: GithubErrorKind, message: string, rateLimit?: RateLimit) {
    super(message);
    this.kind = kind;
    this.rateLimit = rateLimit;
  }
}

interface CacheEntry {
  at: number;
  data: unknown;
}

/** In-memory cache backed by sessionStorage so refreshes do not spend quota. */
const memory = new Map<string, CacheEntry>();
let lastRateLimit: RateLimit | null = null;

function readStorage(): Record<string, CacheEntry> {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, CacheEntry>;
  } catch {
    return {};
  }
}

function getCached(path: string): unknown | undefined {
  const entry = memory.get(path) ?? readStorage()[path];
  if (!entry || Date.now() - entry.at > TTL_MS) return undefined;
  memory.set(path, entry);
  return entry.data;
}

function setCached(path: string, data: unknown): void {
  const entry = { at: Date.now(), data };
  memory.set(path, entry);
  try {
    const stored = readStorage();
    stored[path] = entry;
    // Keep storage small: drop expired entries.
    for (const [key, value] of Object.entries(stored)) {
      if (Date.now() - value.at > TTL_MS) delete stored[key];
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Storage may be unavailable (private mode); the memory cache still works.
  }
}

function parseRateLimit(headers: Headers): RateLimit | null {
  const limit = Number(headers.get("x-ratelimit-limit"));
  const remaining = Number(headers.get("x-ratelimit-remaining"));
  const reset = Number(headers.get("x-ratelimit-reset"));
  if (!headers.has("x-ratelimit-remaining") || Number.isNaN(remaining)) return null;
  return { limit, remaining, resetAt: reset * 1000 };
}

export function getLastRateLimit(): RateLimit | null {
  return lastRateLimit;
}

function minutesUntil(ms: number): number {
  return Math.max(1, Math.ceil((ms - Date.now()) / 60000));
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const cached = getCached(path);
  if (cached !== undefined) return cached as T;

  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      signal,
      headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    });
  } catch (error) {
    if ((error as Error).name === "AbortError") throw error;
    throw new GithubError(
      "network",
      "Could not reach GitHub. Check your connection and try again.",
    );
  }

  const rate = parseRateLimit(res.headers);
  if (rate) lastRateLimit = rate;

  if (res.ok) {
    const data = (await res.json()) as T;
    setCached(path, data);
    return data;
  }
  if (res.status === 404) {
    throw new GithubError("not-found", "Nothing public was found at that name.", rate ?? undefined);
  }
  if ((res.status === 403 || res.status === 429) && (rate?.remaining === 0 || res.status === 429)) {
    const wait = rate ? ` Try again in about ${minutesUntil(rate.resetAt)} min.` : "";
    throw new GithubError(
      "rate-limited",
      `GitHub's limit for unauthenticated requests has been reached.${wait}`,
      rate ?? undefined,
    );
  }
  let message = `GitHub responded with ${res.status}.`;
  try {
    const body = (await res.json()) as { message?: string };
    if (body.message) message = `GitHub: ${body.message}`;
  } catch {
    // Keep the generic message.
  }
  throw new GithubError("unknown", message, rate ?? undefined);
}

export function fetchUser(username: string, signal?: AbortSignal): Promise<GithubUser> {
  return request<GithubUser>(`/users/${encodeURIComponent(username)}`, signal);
}

export function fetchRepo(owner: string, repo: string, signal?: AbortSignal): Promise<GithubRepo> {
  return request<GithubRepo>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    signal,
  );
}

export interface GithubRepoSummary {
  name: string;
  fork: boolean;
  archived: boolean;
  language: string | null;
  description?: string | null;
  stargazers_count?: number;
}

export interface GithubSocialAccount {
  provider: string;
  url: string;
}

/** Up to 100 of the user's own public repositories, most recently pushed first. */
export function fetchUserRepos(
  username: string,
  signal?: AbortSignal,
): Promise<GithubRepoSummary[]> {
  return request<GithubRepoSummary[]>(
    `/users/${encodeURIComponent(username)}/repos?per_page=100&type=owner&sort=pushed`,
    signal,
  );
}

/** Bytes of code per language, as GitHub's linguist counts them. */
export function fetchRepoLanguages(
  owner: string,
  repo: string,
  signal?: AbortSignal,
): Promise<Record<string, number>> {
  return request<Record<string, number>>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`,
    signal,
  );
}

/** Social accounts listed on the user's GitHub profile. */
export function fetchSocialAccounts(
  username: string,
  signal?: AbortSignal,
): Promise<GithubSocialAccount[]> {
  return request<GithubSocialAccount[]>(
    `/users/${encodeURIComponent(username)}/social_accounts`,
    signal,
  );
}
