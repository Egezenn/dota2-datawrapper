import type { 
  AbilitySpecialValue, 
  DetailedHero, 
  DetailedAbility,
  Dota2Item
} from './types';

export const ROLE_NAMES = [
  "Carry", "Support", "Nuker", "Disabler", "Jungler", "Durable", "Escape", "Pusher", "Initiator"
];

export const ABILITY_BEHAVIORS: Record<string, bigint> = {
  "HIDDEN": 1n,
  "PASSIVE": 2n,
  "NO_TARGET": 4n,
  "UNIT_TARGET": 8n,
  "POINT": 16n,
  "AOE": 32n,
  "NOT_LEARNABLE": 64n,
  "CHANNELLED": 128n,
  "ITEM": 256n,
  "TOGGLE": 512n,
  "DIRECTIONAL": 1024n,
  "IMMEDIATE": 2048n,
  "AUTOCAST": 4096n,
  "NO_ASSIST": 8192n,
  "AURA": 16384n,
  "ATTACK": 32768n,
  "DONT_RESUME_MOVEMENT": 65536n,
  "DONT_RESUME_ATTACK": 131072n,
  "VECTOR_TARGETING": 262144n,
  "WORLD_TARGETING": 524288n,
  "IGNORE_BACKSWING": 1048576n,
  "RUNE_TARGET": 2097152n,
  "DONT_ALERT_TARGET": 4194304n,
  "INNATE": 8796093022208n,
};

/**
 * Translates an ability behavior bitmask into an array of human-readable strings.
 */
export function getAbilityBehaviorNames(behavior: number | string | bigint): string[] {
  if (typeof behavior === 'string' && behavior.includes(',')) {
    return behavior.split(',').map(s => s.trim());
  }

  let b: bigint;
  try {
    b = BigInt(behavior);
  } catch {
    return [behavior.toString()];
  }

  const names: string[] = [];
  for (const [name, bit] of Object.entries(ABILITY_BEHAVIORS)) {
    if ((b & bit) === bit) {
      names.push(name);
    }
  }
  return names.length > 0 ? names : [behavior.toString()];
}

/**
 * Calculates the effective values for a special value given shard/scepter.
 */
function getEffectiveValues(
  sv: AbilitySpecialValue,
  upgradeContext?: 'shard' | 'scepter',
  placeholderName?: string
): number[] {
  let base = [...(sv.values_float || [])];
  
  // 1. Determine which upgrade array to use.
  let effectiveUpgrade = upgradeContext;
  if (!effectiveUpgrade && placeholderName) {
    const pLower = placeholderName.toLowerCase();
    if (pLower.includes('shard')) effectiveUpgrade = 'shard';
    else if (pLower.includes('scepter')) effectiveUpgrade = 'scepter';
  }

  if (effectiveUpgrade === 'shard' && sv.values_shard?.length > 0) base = [...sv.values_shard];
  else if (effectiveUpgrade === 'scepter' && sv.values_scepter?.length > 0) base = [...sv.values_scepter];

  return base;
}

/**
 * Formats Dota 2 ability/talent text by resolving placeholders like %param% and {s:bonus_name}.
 */
export function formatAbilityText(
  text: string, 
  svs: AbilitySpecialValue[], 
  hero?: DetailedHero, 
  sourceAbility?: DetailedAbility, 
  upgradeContext?: 'shard' | 'scepter'
): string {
  if (!text) return '';
  
  let res = text;
  const round = (v: any) => {
      if (typeof v !== 'number' || isNaN(v)) return 0;
      return Math.floor(100 * v) / 100;
  };

  const formatValues = (vals: number[]) => {
    if (!vals || vals.length === 0) return '';
    const rounded = vals.map(round);
    const allSame = rounded.every(v => v === rounded[0]);
    return allSame ? rounded[0].toString() : rounded.join(' / ');
  };

  const resolvePlaceholder = (param: string): string | null => {
    const pLower = param.toLowerCase();
    
    // 1. Local Specials search
    const checkName = (name: string) => {
      const lower = name.toLowerCase();
      return lower === pLower || (pLower.startsWith('bonus_') && lower === pLower.replace('bonus_', ''));
    };

    const localSv = svs?.find(v => checkName(v.name));
    if (localSv) return formatValues(getEffectiveValues(localSv, upgradeContext, param));

    // 3. Global search
    if (hero) {
      const allAbilities = [
        ...(hero.abilities || []),
        ...(hero.talents || [])
      ].filter(Boolean);

      for (const a of allAbilities) {
        for (const s of a.special_values || []) {
          if (checkName(s.name)) {
            // Handle {s:bonus_name} where bonus maps to sourceAbility
            if (pLower.startsWith('bonus_')) {
               const bonus = s.bonuses?.find((b: any) => b.name === sourceAbility?.name);
               if (bonus) return Math.abs(round(bonus.value)).toString();
            }
            return formatValues(getEffectiveValues(s, upgradeContext, param));
          }
          if (param === 'value' && s.bonuses?.some((b: any) => b.name === sourceAbility?.name)) {
            const bonus = s.bonuses.find((b: any) => b.name === sourceAbility?.name);
            if (bonus) return Math.abs(round(bonus.value)).toString();
          }
        }
      }
    }

    return null;
  };

  // Replace {s:name}
  res = res.replace(/{s:([^}]+)}/g, (match, param) => resolvePlaceholder(param) ?? match);

  // Replace %name%
  res = res.replace(/%([a-z0-9_$]+)%/gi, (match, param) => {
    const pName = param.split('$')[0].toLowerCase();
    if (pName === 'zero_tooltip') return '0';
    return resolvePlaceholder(pName) ?? match;
  });

  return res.replace(/%%/g, '%');
}

/**
 * Normalizes a hero name by removing the 'npc_dota_hero_' prefix.
 */
export function normalizeHeroName(name: string): string {
  if (!name) return '';
  return name.replace('npc_dota_hero_', '');
}

/**
 * Merges API hero data with dotaconstants.
 */
export function mergeHeroData(
  apiHero: DetailedHero, 
  cHero?: any
): DetailedHero {
  const merged = {
    ...apiHero,
    str_gain: cHero?.str_gain || apiHero.str_gain,
    agi_gain: cHero?.agi_gain || apiHero.agi_gain,
    int_gain: cHero?.int_gain || apiHero.int_gain,
  };

  // If the API hero doesn't have localized strings but the constants do, use them
  if (cHero) {
    if (!merged.name_loc && cHero.localized_name) merged.name_loc = cHero.localized_name;
  }

  return merged;
}

/**
 * Merges API item data with dotaconstants.
 */
export function mergeItemData(apiItem: Partial<Dota2Item>, cItem: any): Dota2Item {
  const name = apiItem.name || cItem?.name || '';
  const dname = apiItem.name_loc || cItem?.dname || name.replace(/^item_/, '');
  
  return {
    ...apiItem,
    ...cItem,
    id: apiItem.id || cItem?.id,
    name: name,
    name_loc: dname, // Prefer dname from constants if available
    cost: apiItem.cost ?? cItem?.gold ?? cItem?.cost,
    abilities: apiItem.abilities || cItem?.abilities || [],
    attrib: apiItem.attrib || cItem?.attrib || apiItem.attributes || [],
    lore: apiItem.lore_loc || cItem?.lore || apiItem.lore
  } as Dota2Item;
}

/**
 * Merges API ability data with dotaconstants.
 */
export function mergeAbilityData(apiAbility: Partial<DetailedAbility>, cAbility: any): DetailedAbility {
  return {
    ...apiAbility,
    ...cAbility,
    name_loc: apiAbility.name_loc || cAbility?.dname,
    desc_loc: apiAbility.desc_loc || cAbility?.desc,
    lore_loc: apiAbility.lore_loc || cAbility?.lore,
    cooldowns: (apiAbility.cooldowns?.length ? apiAbility.cooldowns : cAbility?.cd) || [],
    mana_costs: (apiAbility.mana_costs?.length ? apiAbility.mana_costs : cAbility?.mc) || [],
  } as DetailedAbility;
}
