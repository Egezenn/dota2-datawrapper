import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { Dota2Datafeed } from '../src/client';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const dataDir = path.resolve(__dirname, '..', 'data');
const unavailableAssetsPath = path.join(dataDir, 'unavailable_assets.json');
let unavailableAssets = new Set<string>();

function loadUnavailableAssets() {
  if (fs.existsSync(unavailableAssetsPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(unavailableAssetsPath, 'utf-8'));
      unavailableAssets = new Set(data);
      console.log(`Loaded ${unavailableAssets.size} unavailable assets from blacklist.`);
    } catch (e) {
      console.warn('Failed to load unavailable_assets.json, starting fresh.');
    }
  }
}

function saveUnavailableAssets() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(unavailableAssetsPath, JSON.stringify(Array.from(unavailableAssets).sort(), null, 2));
}

async function downloadAsset(url: string, destDir: string, force = false) {
  if (unavailableAssets.has(url)) {
    // console.log(`Skipping known unavailable asset: ${url}`);
    return;
  }

  try {
    const parsedUrl = new URL(url);
    const relativePath = parsedUrl.pathname.replace(/^\/apps\/dota2\//, '').replace(/^\//, '');
    const fullPath = path.join(destDir, relativePath);
    const dir = path.dirname(fullPath);

    if (fs.existsSync(fullPath) && !force) return;

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    console.log(`Downloading: ${url} -> ${fullPath}`);
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(fullPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.error(`404 Not Found: ${url} - Adding to blacklist.`);
      unavailableAssets.add(url);
      saveUnavailableAssets();
    } else {
      console.error(`Failed to download ${url}: ${error.message}`);
    }
  }
}

async function main() {
  loadUnavailableAssets();
  const force = process.argv.includes('--force') || process.argv.includes('-f');
  const skipAssets = process.argv.includes('--no-assets');
  const api = new Dota2Datafeed();
  
  // Force CDN for downloading
  Dota2Datafeed.urls.setBaseUrl('https://cdn.steamstatic.com/apps/dota2');
  
  const assetsDir = path.join(dataDir, 'assets');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // --- 1. Fetch Heroes ---
  const heroListPath = path.join(dataDir, 'herolist.json');
  let heroes: any[] = [];
  if (fs.existsSync(heroListPath) && !force) {
    console.log('Using local hero list.');
    heroes = JSON.parse(fs.readFileSync(heroListPath, 'utf-8')).result.data.heroes;
  } else {
    console.log('Fetching hero list from API...');
    heroes = await api.getHeroes();
    fs.writeFileSync(heroListPath, JSON.stringify({ result: { data: { heroes } } }, null, 2));
    console.log(`Saved hero list (${heroes.length} heroes).`);
  }

  for (const hero of heroes) {
    const heroPath = path.join(dataDir, 'heroes', `${hero.id}.json`);
    if (!fs.existsSync(path.dirname(heroPath))) fs.mkdirSync(path.dirname(heroPath), { recursive: true });

    // Download hero image
    if (!skipAssets) {
      await downloadAsset(Dota2Datafeed.urls.heroImage(hero.name), assetsDir, force);
    }

    let detailedHero = null;
    if (fs.existsSync(heroPath) && !force) {
      detailedHero = JSON.parse(fs.readFileSync(heroPath, 'utf-8')).result.data.heroes[0];
    } else {
      console.log(`Fetching detailed data for Hero ID ${hero.id} (${hero.name_loc})...`);
      // Note: Valve's API sometimes prefers 'heroid' over 'hero_id'
      detailedHero = await api.getHeroData(hero.id);
      if (detailedHero) {
        fs.writeFileSync(heroPath, JSON.stringify({ result: { data: { heroes: [detailedHero] } } }, null, 2));
      }
    }

    if (detailedHero) {
      // Download ability images & videos
      for (const ability of detailedHero.abilities) {
        if (!skipAssets) {
          await downloadAsset(Dota2Datafeed.urls.abilityImage(ability.name), assetsDir, force);
          await sleep(50); // Small delay for assets
        }
      }
    }
    
    if (detailedHero && (!fs.existsSync(heroPath) || force)) {
      await sleep(200); 
    }
  }

  // --- 2. Fetch Items ---
  const itemListPath = path.join(dataDir, 'itemlist.json');
  let items: any[] = [];
  if (fs.existsSync(itemListPath) && !force) {
    console.log('\nUsing local item list.');
    items = JSON.parse(fs.readFileSync(itemListPath, 'utf-8')).result.data.itemabilities;
  } else {
    console.log('\nFetching item list from API...');
    items = await api.getItems();
    fs.writeFileSync(itemListPath, JSON.stringify({ result: { data: { itemabilities: items } } }, null, 2));
    console.log(`Saved item list (${items.length} items).`);
  }

  for (const item of items) {
    if (item.name && !skipAssets) {
      await downloadAsset(Dota2Datafeed.urls.itemImage(item.name), assetsDir, force);
      await sleep(50); // Small delay for assets
    }
  }

  // --- 3. Fetch Detailed Item Data (from Ability List) ---
  const itemAbilitiesPath = path.join(dataDir, 'itemabilities.json');
  let allAbilities: any[] = [];
  if (fs.existsSync(itemAbilitiesPath) && !force) {
    console.log('\nUsing local detailed item data.');
    allAbilities = JSON.parse(fs.readFileSync(itemAbilitiesPath, 'utf-8')).result.data.itemabilities;
  } else {
    console.log('\nFetching detailed item data (abilitylist) from API...');
    allAbilities = await api.getAbilities();
    fs.writeFileSync(itemAbilitiesPath, JSON.stringify({ result: { data: { itemabilities: allAbilities } } }, null, 2));
    console.log(`Saved detailed item/ability data (${allAbilities.length} entries).`);
  }

  // --- 4. Fetch Patches ---
  const patchListPath = path.join(dataDir, 'patchnoteslist.json');
  let patches: any[] = [];
  if (fs.existsSync(patchListPath) && !force) {
    console.log('\nUsing local patch list.');
    patches = JSON.parse(fs.readFileSync(patchListPath, 'utf-8')).patches;
  } else {
    console.log('\nFetching patch list from API...');
    patches = await api.getPatchList();
    fs.writeFileSync(patchListPath, JSON.stringify({ patches }, null, 2));
    console.log(`Saved patch list (${patches.length} patches).`);
  }

  // Fetch all patches details
  for (const patch of patches) {
    const patchPath = path.join(dataDir, 'patches', `${patch.patch_name}.json`);
    if (!fs.existsSync(path.dirname(patchPath))) fs.mkdirSync(path.dirname(patchPath), { recursive: true });

    if (fs.existsSync(patchPath) && !force) continue;

    console.log(`Fetching details for patch ${patch.patch_name}...`);
    let details = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        details = await api.getPatchNotes(patch.patch_name);
        break;
      } catch (error: any) {
        if (attempts >= maxAttempts) {
          console.error(`Failed to fetch patch ${patch.patch_name} after ${maxAttempts} attempts.`);
          throw error;
        }
        const backoff = 5000 * Math.pow(2, attempts - 1);
        console.warn(`Attempt ${attempts} failed for ${patch.patch_name}. Retrying in ${backoff/1000}s... (${error.message})`);
        await sleep(backoff);
      }
    }

    if (details) {
      fs.writeFileSync(patchPath, JSON.stringify(details, null, 2));
    }
    
    // Always sleep after a successful API fetch to respect rate limits
    await sleep(200); 
  }

  // --- 5. Download Constants from dotaconstants ---
  console.log('\nDownloading dotaconstants metadata...');
  const constantsTargetDir = path.join(dataDir, 'constants');
  if (!fs.existsSync(constantsTargetDir)) fs.mkdirSync(constantsTargetDir, { recursive: true });

  const constantFiles = [
    'heroes.json',
    'abilities.json',
    'hero_abilities.json',
    'aghs_desc.json',
    'items.json',
    'ability_ids.json',
    'patch.json'
  ];

  const githubRoot = 'https://raw.githubusercontent.com/odota/dotaconstants/master/build';

  for (const file of constantFiles) {
    const url = `${githubRoot}/${file}`;
    const dest = path.join(constantsTargetDir, file);
    
    if (fs.existsSync(dest) && !force) continue;

    try {
      console.log(`Downloading constant: ${file}...`);
      const response = await axios.get(url);
      fs.writeFileSync(dest, JSON.stringify(response.data, null, 2));
    } catch (error: any) {
      console.error(`Failed to download constant ${file}: ${error.message}`);
    }
  }

  // --- 6. Download Static Icons ---
  console.log('\nDownloading static icons...');
  const staticIcons = [
    Dota2Datafeed.urls.ASSET_URLS.TALENT_ICON,
    Dota2Datafeed.urls.ASSET_URLS.INNATE_ICON,
    Dota2Datafeed.urls.ASSET_URLS.AGHS_SCEPTER,
    Dota2Datafeed.urls.ASSET_URLS.AGHS_SHARD,
    Dota2Datafeed.urls.ASSET_URLS.COOLDOWN,
    Dota2Datafeed.urls.ASSET_URLS.GOLD,
    Dota2Datafeed.urls.ASSET_URLS.VALVE_LOGO,
    Dota2Datafeed.urls.ASSET_URLS.DOTA_FOOTER_LOGO,
    Dota2Datafeed.urls.ASSET_URLS.DOTA_LOGO_HORIZ,
    Dota2Datafeed.urls.ASSET_URLS.STEAM_ICON,
    Dota2Datafeed.urls.ASSET_URLS.LANGUAGE_ICON,
    Dota2Datafeed.urls.ASSET_URLS.ARROW_OVER,
    Dota2Datafeed.urls.ASSET_URLS.SEARCH_ICON,
    Dota2Datafeed.urls.ASSET_URLS.FILTER_DIAMOND,
    Dota2Datafeed.urls.ASSET_URLS.FAVICON,
    Dota2Datafeed.urls.ASSET_URLS.ATTRIBUTE_ICON('strength'),
    Dota2Datafeed.urls.ASSET_URLS.ATTRIBUTE_ICON('agility'),
    Dota2Datafeed.urls.ASSET_URLS.ATTRIBUTE_ICON('intelligence'),
    Dota2Datafeed.urls.ASSET_URLS.ATTRIBUTE_ICON('universal'),
    Dota2Datafeed.urls.ASSET_URLS.ATTACK_TYPE_ICON('melee'),
    Dota2Datafeed.urls.ASSET_URLS.ATTACK_TYPE_ICON('ranged'),
  ];

  // Add stat icons
  const stats = ['damage', 'attack_time', 'attack_range', 'armor', 'magic_resist', 'movement_speed', 'turn_rate', 'vision'];
  stats.forEach(s => staticIcons.push(Dota2Datafeed.urls.ASSET_URLS.STAT_ICON(s as any)));

  // Add filter icons
  const attrs = ['str', 'agi', 'int', 'uni'] as const;
  attrs.forEach(a => staticIcons.push(Dota2Datafeed.urls.ASSET_URLS.FILTER_ICON(a)));

  // Add fonts
  const fonts = ['radiance', 'reaver'];
  fonts.forEach(f => staticIcons.push(Dota2Datafeed.urls.ASSET_URLS.FONT(f)));

  if (!skipAssets) {
    for (const url of staticIcons) {
      await downloadAsset(url, assetsDir, force);
    }
  }

  console.log('\nAll data and assets fetched successfully.');
}

main().catch(console.error);
