# dota2-dotawrapper

A high-fidelity **Data Normalization & Enrichment Layer** for Dota 2. It seamlessly merges Valve's official live Datafeed API with the community-driven `dotaconstants` dataset to provide a single, consistent source of truth for heroes, items, abilities, and patches.

[![npm version](https://img.shields.io/npm/v/dota2-dotawrapper.svg)](https://www.npmjs.com/package/dota2-datawrapper)

## 🚀 Key Features

* **Unified Data Feed**: Consolidate disparate Valve endpoints into a single, clean API.
* **Deep Enrichment**: Injects missing metadata (stat gains, item costs, component trees) from `dotaconstants`.
* **Special Value Resolution**: Automatically parses complex in-game strings like `%bonus_damage%` and `{s:value}`, including Aghanim's Shard/Scepter overrides.
* **Auto-Normalization**: Fixes inconsistent API naming conventions and resolves legacy Valve placeholders.
* **Static-Site Ready**: Built-in utilities to fetch, bundle, and deploy data for serverless/static environments.
* **Type Safe**: Written in TypeScript with full definitions for the entire Dota 2 schema.

## 📦 Installation

```shell
npm install dota2-dotawrapper
```

## 🛠 Usage

```typescript
import { Dota2Datafeed } from 'dota2-dotawrapper';

// Initialize with optional configuration
const api = new Dota2Datafeed({ 
  language: 'english',
  useJsonExtension: true // Useful for static JSON mirrors
});

async function getHeroDetails(heroId: number) {
  // 1. Fetch community constants (cached/local/github)
  const constantsHeroes = await api.getConstantsHeroes();
  
  // 2. Fetch live Valve data and merge automatically
  const hero = await api.getHeroDataWithConstants(heroId, constantsHeroes);
  
  console.log(`Hero: ${hero.name_loc}`);
  console.log(`Strength Gain: ${hero.str_gain}`); // Enriched from constants
}
```

## 📖 API Reference

### Core Client: `Dota2Datafeed`

#### Enriched Methods (Recommended)

These methods combine live data with community metadata for the most complete dataset.

* `getHeroesWithConstants(constantsHeroes)`: Returns all heroes with merged stats.
* `getItemsWithConstants(constantsItems)`: Returns all items with gold costs and component data.
* `getHeroDataWithConstants(heroId, constantsHeroes)`: Detailed single hero data with merged attributes.

#### Live Valve Data Methods

Direct access to official Valve endpoints.

* `getHeroes()`: Raw list of all available heroes.
* `getHeroData(heroId)`: Raw detailed data (abilities, talents, etc.).
* `getItems()`: Base item list.
* `getAbilities()`: Master list of all abilities and item abilities.
* `getPatchList()`: Chronological list of game patches.
* `getPatchNotes(version)`: Specific changes for a given version.

#### Community Constants Helpers

Fetch the latest metadata from `dotaconstants`.

* `getConstantsHeroes()`: Raw hero metadata (stat gains, roles).
* `getConstantsItems()`: Raw item metadata (gold, components).
* `getConstantsAbilityLookup()`: Essential mapping for ability icons and innate status.

### Utilities: `Dota2Datafeed.utils`

* `formatAbilityText(text, specials, hero?, ability?, upgrade?)`: Resolve `%param%` placeholders to their actual values.
* `normalizeHeroName(name)`: Strips `npc_dota_hero_` prefixes.
* `getAbilityBehaviorNames(behavior)`: Converts bitmasks to human-readable labels.

## 🎨 Explorer

The repository includes a reference implementation under `docs/`. It is a high-performance, static-build explorer that demonstrates:

* Proof of concept.
* Complex ability rendering.
* Aghanim's Shard/Scepter upgrade visualization.
* Interactive hero grids and patch note histories.

[**View the Explorer Source**](docs/)

## 📜 Scripts

Useful for CI/CD and data management:

* `npm run fetch-all`: Downloads all Valve JSONs and assets (images/videos) to local storage.
* `npm run docs:static-build`: Generates a fully-contained static version of the library and explorer.
