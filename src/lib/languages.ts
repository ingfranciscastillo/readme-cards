/** Colours for common languages, matching the swatches developers know from GitHub. */
export const LANGUAGE_COLORS: Record<string, string> = {
  Astro: "#ff5a03",
  C: "#555555",
  "C#": "#178600",
  "C++": "#f34b7d",
  CSS: "#663399",
  Dart: "#00b4ab",
  Elixir: "#6e4a7e",
  Go: "#00add8",
  Haskell: "#5e5086",
  HTML: "#e34c26",
  Java: "#b07219",
  JavaScript: "#f1e05a",
  "Jupyter Notebook": "#da5b0b",
  Kotlin: "#a97bff",
  Lua: "#000080",
  MDX: "#fcb32c",
  Nix: "#7e7eff",
  OCaml: "#ef7a08",
  PHP: "#4f5d95",
  Python: "#3572a5",
  R: "#198ce7",
  Ruby: "#701516",
  Rust: "#dea584",
  Scala: "#c22d40",
  Shell: "#89e051",
  Svelte: "#ff3e00",
  Swift: "#f05138",
  TypeScript: "#3178c6",
  Vue: "#41b883",
  Zig: "#ec915c",
};

export function languageColor(language: string, fallback = "#8b8b85"): string {
  return LANGUAGE_COLORS[language] ?? fallback;
}
