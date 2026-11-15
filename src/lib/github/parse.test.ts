import { describe, expect, it } from "vitest";
import { parseGithubInput } from "./parse";

describe("parseGithubInput", () => {
  it.each([
    ["octocat", { kind: "user", username: "octocat" }],
    ["@octocat", { kind: "user", username: "octocat" }],
    ["https://github.com/octocat/", { kind: "user", username: "octocat" }],
    ["octocat/hello-world", { kind: "repo", owner: "octocat", repo: "hello-world" }],
    ["github.com/octocat/hello-world.git", { kind: "repo", owner: "octocat", repo: "hello-world" }],
    [
      "https://www.github.com/octocat/hello-world/tree/main?tab=readme#top",
      { kind: "repo", owner: "octocat", repo: "hello-world" },
    ],
    [
      "git@github.com:octocat/hello-world.git",
      { kind: "repo", owner: "octocat", repo: "hello-world" },
    ],
  ])("parses %s", (input, expected) => {
    expect(parseGithubInput(input)).toEqual(expected);
  });

  it.each(["", "   ", "-octocat", "a".repeat(40), "octocat/..", "octo cat"])(
    "rejects %j",
    (input) => {
      expect(parseGithubInput(input)).toBeNull();
    },
  );
});
