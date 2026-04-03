# Dota2 datawrapper

This repository is a **Universal Data Normalization & Enrichment Library** that merges Valve's official Dota 2 data feeds with the `dotaconstants` community dataset. It is designed to be consumed by any platform (Node.js, Browser, Static Sites).

## Project Structure

- `src/`: Core library logic.
  - `client.ts`: The main `Dota2Datafeed` class.
  - `utils.ts`: High-fidelity string resolution and data merging logic.
  - `types.ts`: Full TypeScript definitions for Valve and community data.
- `docs/`: The **Explorer**, a reference implementation building a UI using the library.
- `scripts/`: Data orchestration tools.
  - `fetch-all.ts`: Downloads Valve JSONs and raw assets (images/videos).
  - `prepare-static.ts`: Pre-processes data for static deployments.
- `data/`: Local cache of Valve data (populated via `fetch-all`).
- `dist/`: Compiled production bundles (CJS, ESM, Types).

## Core Features & Intent

- **Unified Data Feed**: Access Valve's official endpoints (herolist, itemlist, etc.) enriched with `dotaconstants` metadata.
- **Enriched by Default**: All complex merging logic (Heroes, Items, Abilities) lives in the library (`src/`), not in the UI.
- **High Fidelity Resolution**: It resolves `%param%` and `{s:param}` placeholders using both local and global special values.
- **Static-Site Ready**: Built-in support for `.json` file extension interceptors and local asset mirroring.

## Technical Documentation

### `Dota2Datafeed` Client

The main entry point for consuming data. It manages two internal `axios` clients: one for Valve's Datafeed and one for `dotaconstants`.

```typescript
const api = new Dota2Datafeed({ language: 'english' });
const heroes = await api.getHeroesWithConstants(constants);
```

### Data Merging logic

The library provides `withConstants` wrappers that automatically merge:

- Base hero stats (Str/Agi/Int gains) from `dotaconstants`.
- Item costs, components, and recipes.
- Ability metadata (Innate status, Icon availability).

### Special Value Resolution

`utils.formatAbilityText` is the "brain" of the library. It handles:

- **Overrides**: Calculates values based on Aghanim's Shard or Scepter.
- **Placeholders**: Resolves `%param%` and `{s:param}` by scanning local and global `special_values`.
- **Bonus Prefixes**: Correctly maps placeholders like `%bonus_bonus_damage%`.

## Data Pipeline (Maintenance)

When Dota 2 updates, the following flow is used:

1. `npm run fetch-all`: Syncs latest Valve data and assets to `data/`.
2. `npm run gen-lookup`: Updates ability/innate mappings.
3. `npm run docs:static-build`: Regenerates the static JSON snapshots for the Explorer and publishes them.
