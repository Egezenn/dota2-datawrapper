import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

const ITEM_ABILITIES_JSON_PATH = path.resolve(__dirname, '../data/itemabilities.json');
const ASSETS_ABILITIES_PATH = path.resolve(__dirname, '../data/assets/images/dota_react/abilities');
const OUTPUT_PATH = path.resolve(__dirname, '../docs/src/ability-lookup.json');

async function getAbilitiesJson() {
    const localPath = path.resolve(__dirname, '../dotaconstants/build/abilities.json');
    if (fs.existsSync(localPath)) {
        return JSON.parse(fs.readFileSync(localPath, 'utf-8'));
    }
    console.log('Local abilities.json not found, fetching from GitHub...');
    const resp = await axios.get('https://raw.githubusercontent.com/odota/dotaconstants/master/build/abilities.json');
    return resp.data;
}

async function generate() {
    console.log('Generating ability lookup...');

    const abilities = await getAbilitiesJson();
    
    if (!fs.existsSync(ITEM_ABILITIES_JSON_PATH)) {
        console.error('data itemabilities.json not found. Run npm run fetch-all first.');
        process.exit(1);
    }

    const itemAbilitiesRaw = JSON.parse(fs.readFileSync(ITEM_ABILITIES_JSON_PATH, 'utf-8'));
    const itemAbilities = itemAbilitiesRaw.result?.data?.itemabilities || [];

    const lookup: Record<string, { has_icon: boolean; is_innate: boolean }> = {};

    // 1. Process all abilities from dotaconstants
    for (const [name, data] of Object.entries(abilities)) {
        const abilityData = data as any;
        const iconPath = path.join(ASSETS_ABILITIES_PATH, `${name}.png`);
        const fileExists = fs.existsSync(iconPath);

        lookup[name] = {
            has_icon: fileExists,
            is_innate: !!abilityData.is_innate
        };
    }

    // 2. Overlay innate status from itemabilities.json
    for (const itemAbi of itemAbilities) {
        if (lookup[itemAbi.name]) {
            lookup[itemAbi.name].is_innate = lookup[itemAbi.name].is_innate || !!itemAbi.is_innate;
        } else {
            const iconPath = path.join(ASSETS_ABILITIES_PATH, `${itemAbi.name}.png`);
            const fileExists = fs.existsSync(iconPath);

            lookup[itemAbi.name] = {
                has_icon: fileExists,
                is_innate: !!itemAbi.is_innate
            };
        }
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(lookup, null, 2));
    
    // Also save to data/ for the local server
    const DATA_OUTPUT_PATH = path.resolve(__dirname, '../data/ability-lookup.json');
    fs.writeFileSync(DATA_OUTPUT_PATH, JSON.stringify(lookup, null, 2));
    
    console.log(`Generated lookup for ${Object.keys(lookup).length} abilities`);
    console.log(`- UI: ${OUTPUT_PATH}`);
    console.log(`- Data: ${DATA_OUTPUT_PATH}`);
}

generate().catch(console.error);
