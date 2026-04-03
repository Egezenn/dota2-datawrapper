let STEAM_CDN = (typeof process !== 'undefined' && process.env.DOTA2_LOCAL_ASSETS) 
  ? process.env.DOTA2_LOCAL_ASSETS 
  : 'https://cdn.steamstatic.com/apps/dota2';

const CLOUDFLARE_STEAM_CDN = 'https://cdn.cloudflare.steamstatic.com/apps/dota2';

/**
 * Constants for various Dota 2 assets.
 */
export const ASSET_URLS = {
  ITEM_IMAGE: (shortName: string) => `${STEAM_CDN}/images/dota_react/items/${shortName}.png`,
  ABILITY_IMAGE: (shortName: string) => `${STEAM_CDN}/images/dota_react/abilities/${shortName}.png`,
  HERO_IMAGE: (shortName: string) => `${STEAM_CDN}/images/dota_react/heroes/${shortName}.png`,
  
  // Icons
  get TALENT_ICON() { return `${STEAM_CDN}/images/dota_react/icons/talents.svg`; },
  get INNATE_ICON() { return `${STEAM_CDN}/images/dota_react/icons/innate_icon.png`; },
  ATTRIBUTE_ICON: (attr: 'strength' | 'agility' | 'intelligence' | 'universal') => 
    `${STEAM_CDN}/images/dota_react/icons/hero_${attr}.png`,
  ATTACK_TYPE_ICON: (type: 'melee' | 'ranged') => 
    `${STEAM_CDN}/images/dota_react/icons/${type}.svg`,
  
  get AGHS_SCEPTER() { return `${STEAM_CDN}/images/dota_react/heroes/stats/aghs_scepter.png`; },
  get AGHS_SHARD() { return `${STEAM_CDN}/images/dota_react/heroes/stats/aghs_shard.png`; },
  
  get COOLDOWN() { return `${STEAM_CDN}/images/dota_react/icons/cooldown.png`; },
  get GOLD() { return `${STEAM_CDN}/images/dota_react/icons/gold.png`; },
  
  // Hero Stats Icons
  STAT_ICON: (stat: 'damage' | 'attack_time' | 'attack_range' | 'armor' | 'magic_resist' | 'movement_speed' | 'turn_rate' | 'vision') => 
    `${STEAM_CDN}/images/dota_react/heroes/stats/icon_${stat}.png`,
  
  // Brand & UI
  get FAVICON() { return `${STEAM_CDN}/favicon.ico`; },
  get VALVE_LOGO() { return `${STEAM_CDN}/images/dota_react/valve_logo.png`; },
  get DOTA_FOOTER_LOGO() { return `${STEAM_CDN}/images/dota_react/dota_footer_logo.png`; },
  get DOTA_LOGO_HORIZ() { return `${STEAM_CDN}/images/dota_react/global/dota2_logo_horiz.png`; },
  get STEAM_ICON() { return `${STEAM_CDN}/images/dota_react/icons/steam_icon.svg`; },
  get LANGUAGE_ICON() { return `${STEAM_CDN}/images/dota_react/icons/language.svg`; },
  get ARROW_OVER() { return `${STEAM_CDN}/images/dota_react/arrow_over.png`; },
  get SEARCH_ICON() { return `${STEAM_CDN}/images/dota_react/icons/search.svg`; },

  // Filters
  FILTER_ICON: (attr: 'str' | 'agi' | 'int' | 'uni') => 
    `${STEAM_CDN}/images/dota_react/herogrid/filter-${attr}-active.png`,
  get FILTER_DIAMOND() { return `${STEAM_CDN}/images/dota_react/herogrid/filter-diamond.png`; },

  // Videos
  ABILITY_VIDEO_POSTER: (heroName: string, abilityName: string) => 
    `${STEAM_CDN}/videos/dota_react/abilities/${heroName}/${abilityName}.jpg`,
  ABILITY_VIDEO_WEBM: (heroName: string, abilityName: string) => 
    `${STEAM_CDN}/videos/dota_react/abilities/${heroName}/${abilityName}.webm`,
  
  HERO_VIDEO_MOV: (heroName: string) => `${STEAM_CDN}/videos/dota_react/heroes/renders/${heroName}.mov`,
  HERO_VIDEO_WEBM: (heroName: string) => `${STEAM_CDN}/videos/dota_react/heroes/renders/${heroName}.webm`,
  HERO_RENDER_PNG: (heroName: string) => `${STEAM_CDN}/videos/dota_react/heroes/renders/${heroName}.png`,

  // Fonts
  FONT: (fontName: string) => {
    if (fontName === 'reaver') return `${STEAM_CDN}/fonts/Reaver-Regular.woff`;
    return `${STEAM_CDN}/fonts/${fontName}.woff`;
  },
};

/**
 * Helper utility for Dota 2 asset URLs.
 */
export class Dota2Urls {
  static ASSET_URLS = ASSET_URLS;

  static setBaseUrl(url: string) {
    STEAM_CDN = url;
  }

  static heroImage(heroName: string) {
    if (!heroName) return '';
    const name = heroName.replace('npc_dota_hero_', '');
    return ASSET_URLS.HERO_IMAGE(name);
  }

  static itemImage(itemName: string) {
    if (!itemName) return '';
    const name = itemName
      .replace('item_', '')
      .replace('recipe_', '');
    return ASSET_URLS.ITEM_IMAGE(name);
  }

  static abilityImage(abilityName: string) {
    return ASSET_URLS.ABILITY_IMAGE(abilityName);
  }

  static abilityVideo(heroName: string, abilityName: string) {
    const hName = heroName.replace('npc_dota_hero_', '');
    return {
      poster: ASSET_URLS.ABILITY_VIDEO_POSTER(hName, abilityName),
      webm: ASSET_URLS.ABILITY_VIDEO_WEBM(hName, abilityName),
    };
  }

  static heroVideo(heroName: string) {
    const hName = heroName.replace('npc_dota_hero_', '');
    return {
      mov: ASSET_URLS.HERO_VIDEO_MOV(hName),
      webm: ASSET_URLS.HERO_VIDEO_WEBM(hName),
      poster: ASSET_URLS.HERO_RENDER_PNG(hName),
    };
  }

  static attributeIcon(attr: number | string) {
    const mapping: Record<string, 'strength' | 'agility' | 'intelligence' | 'universal'> = {
      '0': 'strength',
      '1': 'agility',
      '2': 'intelligence',
      '3': 'universal',
      'str': 'strength',
      'agi': 'agility',
      'int': 'intelligence',
      'uni': 'universal',
      'all': 'universal',
    };
    const key = mapping[String(attr)] || 'strength';
    return ASSET_URLS.ATTRIBUTE_ICON(key);
  }

  static toCloudflare(url: string) {
    return url.replace(STEAM_CDN, CLOUDFLARE_STEAM_CDN);
  }
}
