# Zotero More Columns

A lightweight open-source Zotero 7/8 plugin that adds practical metadata columns to Zotero’s main item list.

## What it does

This plugin extends Zotero’s native library table instead of replacing it. The current MVP adds three sortable columns to the main item list:

- **Attachments**
- **Notes**
- **Tags**

The goal is simple: make browsing large libraries easier without introducing a separate panel, heavy UI, or closed-source dependency.

## Why this approach

Zotero 7 already exposes a first-party item-tree column API. This plugin uses that native extension point so the result stays close to Zotero’s built-in browsing experience and remains easy to maintain.

## Development

### Requirements

1. Zotero 7 or 8
2. Node.js LTS
3. Git

Use an LTS Node release. The scaffold tooling in this repo currently fails under Node 25.

### Setup

```sh
npm install
cp .env.example .env
```

Then update `.env` so `npm start` launches your local Zotero 7 binary and development profile.

### Useful commands

```sh
npm start
npm run lint:check
npm run build
npm run test
```

- `npm start`: runs the dev server, builds the plugin, starts Zotero, and hot-reloads on changes
- `npm run build`: creates a production build and runs TypeScript checking
- `npm run test`: runs the scaffolded test suite

## Project structure

- `src/hooks.ts`: startup and shutdown wiring
- `src/modules/itemListColumns.ts`: custom column definitions, providers, registration, cleanup
- `src/utils/locale.ts`: Fluent localization helpers
- `addon/manifest.json`: Zotero addon manifest
- `addon/locale/*/addon.ftl`: localized column labels
- `test/startup.test.ts`: startup and column helper tests

## Notes

- The plugin currently targets Zotero 7 and 8.
- The current scope is the **main item list** only.
- If you add more columns later, keep them cheap to compute and sortable.

## License

AGPL-3.0-or-later.
