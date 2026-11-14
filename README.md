# Readme Cards

A small browser tool for designing SVG cards for GitHub profiles and README files.
Pick a template, edit it with a live preview, and export a standalone `.svg` you
commit next to your README.

Everything runs in the browser. The only network calls are optional lookups to
GitHub's public REST API (and the avatar image they point to).

## Features

- **Templates**: Profile, Repository, Tech Stack and Quote, grouped as Profile,
  Repository, Developer and Creative. Each has two or three layout variants.
- **Editor**: Content, Appearance, Type and Layout tabs. Every change re-renders
  the preview immediately.
- **Preview**: the actual SVG, with zoom (fit, 1:1, steps) and transparent, light
  or dark backgrounds that approximate GitHub's themes.
- **Export**: download, copy the SVG source, view the raw source, and copy a
  Markdown or HTML snippet that references the downloaded file by relative path.
  Choose the filename. The panel shows dimensions and file size.
- **GitHub import**: profiles (`octocat`, `@octocat`, `github.com/octocat`) and
  repositories (`owner/repo` or a URL). Responses are cached for 10 minutes and
  in-flight requests are aborted. The panel handles not-found, rate-limit and
  network errors.
- **Persistence**: work is saved to `localStorage`. Each template can be reset
  to its defaults.

## How rendering works

The SVG is the source of truth. Each template in `src/templates/` is a pure
function `config → SVG markup`, built with a small tagged-template helper
(`src/lib/svg/markup.ts`) that XML-escapes every interpolated value by default.
The preview injects exactly that string, and export wraps the same card in a
standalone document.

- **Text** is measured with a canvas against the loaded fonts and wrapped
  deterministically (`src/lib/svg/text.ts`). SVG has no native text wrapping.
- **Fonts**: the faces a card actually uses are embedded as base64 woff2
  (Latin subset) on export, so typography survives GitHub's image proxy. System
  fonts are never embedded. Embedding can be turned off for a smaller file.
- **Images**: avatars are cropped to 160 px and embedded as `data:` URIs.
  Opaque images use JPEG and transparent ones PNG. Without an image, initials
  are drawn instead. Exports never reference remote URLs and never use
  `<foreignObject>`.
- **Validation**: every export is parsed as XML and checked for namespace,
  dimensions, external references and `foreignObject`.

## Limits worth knowing

- Unauthenticated GitHub API requests are limited to 60 per hour per network.
  When the limit is hit, the UI shows when it resets.
- Exported numbers (stars, followers) are a snapshot; the file does not update
  itself.
- Images inside a README are not clickable. Wrap the snippet in a Markdown link
  if you need one.

## Development

Requires Node 20+ and pnpm.

```bash
pnpm install
```

```bash
pnpm dev
```

```bash
pnpm typecheck && pnpm check && pnpm build
```

`pnpm build` writes a static site to `dist/` with relative asset paths, so it
can be hosted from any static host or sub-path.

## Structure

```
src/
  templates/            card templates (pure render functions) + registry
  lib/svg/              markup builder, text measurement, layout, icons,
                        document wrapper, font embedding, validation
  lib/github/           input parsing, REST client with cache, data mapping
  lib/export/           download, clipboard, snippets
  components/editor/    tabs, content forms, appearance/type/layout panels
  components/preview/   live preview with zoom and backgrounds
  components/export/    export panel
  components/gallery/   template gallery
  state/                persisted app state, sanitising, render hooks
  types/                shared types
```

Stack: Vite, React, TypeScript, Tailwind CSS v4, Iconoir, Fontsource
(Geist Sans, Geist Mono, Instrument Serif) and Biome.
