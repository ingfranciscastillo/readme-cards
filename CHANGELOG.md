# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- GitHub link in the gallery and editor headers.
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

[Unreleased]: https://github.com/ingfranciscastillo/readme-cards/compare/88447d5...HEAD
[0.1.0]: https://github.com/ingfranciscastillo/readme-cards/commit/88447d5
