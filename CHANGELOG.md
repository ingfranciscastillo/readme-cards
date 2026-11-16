# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Share links: **Copy share link** in the export panel gives a URL that opens the card in the
  editor with the same settings. The settings are compressed into the link, so nothing is
  uploaded; uploaded avatars are left out. Opening a link asks before it replaces your edits,
  and a broken link leaves the card unchanged.
- Unit tests with Vitest: every template and variant exports a valid SVG in light, dark and
  transparent setups, plus dark-mode colour mapping, validation, saved-data sanitising and
  GitHub input parsing. They run in CI before every build.

### Changed

- New interface type: Bricolage Grotesque (condensed) for headings and the wordmark, Instrument
  Sans for the interface. The gallery intro shows the Markdown line you paste into a README.
- Faster first load: gallery cards render as they scroll into view, the editor loads as a
  separate chunk (fetched when the browser is idle), and cards re-measure once when fonts
  arrive instead of once per font.

### Fixed

- Exporting no longer fails with "Fonts could not be embedded (Failed to fetch)" when the
  connection drops after the preview has loaded its fonts: the preview and the export share one
  download of each font. If a font never arrived, the export panel explains it, offers
  **Try again**, and retries on its own when the browser comes back online; retrying also
  reloads the font in the preview.
- Copying falls back to the older clipboard method when the browser denies the Clipboard API,
  and the share link appears in a field to copy by hand if both fail.
- Accessibility: gallery cards are named by their title instead of a label that did not match
  the visible text, the editor's back button has a name on phones, panel headings follow the
  page heading, and the profile counts are disabled (not just dimmed) while hidden.

## [0.3.0] - 2026-11-15

### Added

- Dark mode: a card can carry dark colours and switch to them when the viewer uses a dark
  theme, in the same SVG. Includes Ink, Night and GitHub dark palettes, and the Dark preview
  background shows the dark version.
- 14 more fonts: Inter, IBM Plex Sans, DM Sans, Manrope, Space Grotesk, Bricolage Grotesque,
  Fraunces, Playfair Display, Source Serif 4, Lora, JetBrains Mono, IBM Plex Mono, Fira Code
  and Space Mono. They are embedded in the export like the existing ones.
- The font picker groups fonts into sans serif, serif, monospace and system, and shows the
  chosen font's name in that font.

### Changed

- Fonts download on demand, only the faces a card uses, instead of all at startup.

## [0.2.0] - 2026-11-14

### Added

- Banner template: a wide README header with eyebrow, title, subtitle and tags, in classic,
  accent rule and split layouts.
- Contact template: social profiles, email and website with icons, as rows, a grid or an inline
  list. Imports the social accounts listed on a GitHub profile.
- Languages template: language shares as a stacked bar, bars or a donut. Imports bytes per
  language from a repository, or counts a user's public repositories by main language.
- New social platforms for Profile and Contact: GitLab, Threads, Instagram, Discord, Telegram,
  Medium, Dribbble and CodePen.
- GitHub link in the gallery and editor headers.
- Social preview image and Open Graph tags, so links to the app unfurl with a preview.
- Automatic deployment to GitHub Pages on every push to `main`.
- MIT license.

### Changed

- The header wordmark shows only the name, without the icon.
- Rewrote the README with a live demo link, an animated walkthrough, usage guide and
  architecture overview.

### Fixed

- Between 1024 and 1279 px wide, the live preview no longer overlaps the export panel.

## [0.1.0] - 2026-11-14

### Added

- Profile, Repository, Tech Stack and Quote templates with 10 layout variants.
- Editor with Content, Appearance, Type and Layout tabs and a live preview with zoom
  and transparent, light or dark backgrounds.
- Import from GitHub's public REST API for profiles and repositories, with caching and
  rate-limit handling.
- Standalone SVG export with embedded fonts and images, XML validation, and Markdown or
  HTML snippets.
- Work saved to `localStorage`, with a per-template reset.

[Unreleased]: https://github.com/ingfranciscastillo/readme-cards/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/ingfranciscastillo/readme-cards/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/ingfranciscastillo/readme-cards/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/ingfranciscastillo/readme-cards/releases/tag/v0.1.0
