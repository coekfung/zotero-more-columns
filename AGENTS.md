# AGENTS

## Overview

- This repo is a Zotero 7 plugin built from `zotero-plugin-template` and now focused on one job: adding lightweight extra columns to Zotero's main item list.
- Keep changes small, typed, and startup-safe. The product surface is the existing Zotero library table, not a separate browser UI.

## Where to Work

- `src/hooks.ts`: plugin lifecycle. Startup should stay minimal and only wire essential behavior.
- `src/modules/itemListColumns.ts`: source of truth for custom column keys, count providers, registration, and cleanup.
- `src/utils/locale.ts`: Fluent localization helpers for column labels.
- `test/startup.test.ts`: current test entry point for startup and column-helper behavior.
- `addon/locale/*/addon.ftl`: user-facing column labels.
- `package.json` + `addon/manifest.json`: plugin identity and Zotero version targeting.

## Conventions

- Target Zotero 7 APIs. Prefer `Zotero.ItemTreeManager.registerColumn()` over deprecated plural helpers.
- Keep the plugin lightweight: prefer native item-tree columns over custom panes, prompts, menus, or large injected UI.
- Column providers must stay cheap and deterministic because they run across many rows.
- If a value should sort numerically but the API sorts strings, encode a sortable string and render a clean display value.
- Use localization keys for user-facing labels instead of hard-coded text where practical.

## Anti-Patterns

- Do not re-introduce template demo startup behaviors into normal plugin boot.
- Do not add heavy per-window UI unless the feature explicitly requires it.
- Do not suppress type errors or rely on `as any` / `@ts-ignore`.
- Do not hand-edit generated typings.

## Verification

- Run `npm run lint:check`.
- Run `npm run build`.
- Run `npm run test`.
- For behavior changes, smoke-test in Zotero with `npm start` and confirm the custom columns can be enabled from the column picker.

## Product Notes

- Current MVP columns: attachments, notes, tags.
- Scope for now is the main item list only.
- If you add more columns later, extend `src/modules/itemListColumns.ts` first and keep tests in sync.
