import { describe, expect, it } from "vitest";
import type { GithubUser } from "./api";
import { mapContactLinks, mapLanguages, repoLanguageCounts } from "./map";

describe("repoLanguageCounts", () => {
  it("counts own, active repositories by language", () => {
    expect(
      repoLanguageCounts([
        { name: "a", fork: false, archived: false, language: "TypeScript" },
        { name: "b", fork: false, archived: false, language: "TypeScript" },
        { name: "c", fork: true, archived: false, language: "Go" },
        { name: "d", fork: false, archived: true, language: "Rust" },
        { name: "e", fork: false, archived: false, language: null },
      ]),
    ).toEqual({ TypeScript: 2 });
  });
});

describe("mapLanguages", () => {
  it("sorts by size and drops empty values", () => {
    const out = mapLanguages({ Go: 10, TypeScript: 50, Rust: 0 });
    expect(out.map((l) => l.name)).toEqual(["TypeScript", "Go"]);
  });

  it("folds everything past the limit into Other", () => {
    const out = mapLanguages({ A: 5, B: 4, C: 3, D: 2, E: 1 }, 3);
    expect(out.map((l) => [l.name, l.value])).toEqual([
      ["A", 5],
      ["B", 4],
      ["Other", 6],
    ]);
  });
});

describe("mapContactLinks", () => {
  const user = { login: "ada", twitter_username: null } as GithubUser;

  it("starts with GitHub and formats Mastodon handles", () => {
    const links = mapContactLinks(user, [
      { provider: "mastodon", url: "https://hachyderm.io/@ada" },
      { provider: "linkedin", url: "https://www.linkedin.com/in/ada/" },
    ]);
    expect(links.map((l) => [l.platform, l.handle])).toEqual([
      ["github", "ada"],
      ["mastodon", "@ada@hachyderm.io"],
      ["linkedin", "linkedin.com/in/ada"],
    ]);
  });

  it("does not list X twice", () => {
    const links = mapContactLinks({ ...user, twitter_username: "ada" }, [
      { provider: "twitter", url: "https://twitter.com/ada" },
    ]);
    expect(links.filter((l) => l.platform === "x")).toHaveLength(1);
  });
});
