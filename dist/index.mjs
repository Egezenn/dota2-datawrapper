var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/client.ts
import axios from "axios";

// src/urls.ts
var STEAM_CDN = typeof process !== "undefined" && process.env.DOTA2_LOCAL_ASSETS ? process.env.DOTA2_LOCAL_ASSETS : "https://cdn.steamstatic.com/apps/dota2";
var CLOUDFLARE_STEAM_CDN = "https://cdn.cloudflare.steamstatic.com/apps/dota2";
var ASSET_URLS = {
  ITEM_IMAGE: (shortName) => `${STEAM_CDN}/images/dota_react/items/${shortName}.png`,
  ABILITY_IMAGE: (shortName) => `${STEAM_CDN}/images/dota_react/abilities/${shortName}.png`,
  HERO_IMAGE: (shortName) => `${STEAM_CDN}/images/dota_react/heroes/${shortName}.png`,
  // Icons
  get TALENT_ICON() {
    return `${STEAM_CDN}/images/dota_react/icons/talents.svg`;
  },
  get INNATE_ICON() {
    return `${STEAM_CDN}/images/dota_react/icons/innate_icon.png`;
  },
  ATTRIBUTE_ICON: (attr) => `${STEAM_CDN}/images/dota_react/icons/hero_${attr}.png`,
  ATTACK_TYPE_ICON: (type) => `${STEAM_CDN}/images/dota_react/icons/${type}.svg`,
  get AGHS_SCEPTER() {
    return `${STEAM_CDN}/images/dota_react/heroes/stats/aghs_scepter.png`;
  },
  get AGHS_SHARD() {
    return `${STEAM_CDN}/images/dota_react/heroes/stats/aghs_shard.png`;
  },
  get COOLDOWN() {
    return `${STEAM_CDN}/images/dota_react/icons/cooldown.png`;
  },
  get GOLD() {
    return `${STEAM_CDN}/images/dota_react/icons/gold.png`;
  },
  // Hero Stats Icons
  STAT_ICON: (stat) => `${STEAM_CDN}/images/dota_react/heroes/stats/icon_${stat}.png`,
  // Brand & UI
  get FAVICON() {
    return `${STEAM_CDN}/favicon.ico`;
  },
  get VALVE_LOGO() {
    return `${STEAM_CDN}/images/dota_react/valve_logo.png`;
  },
  get DOTA_FOOTER_LOGO() {
    return `${STEAM_CDN}/images/dota_react/dota_footer_logo.png`;
  },
  get DOTA_LOGO_HORIZ() {
    return `${STEAM_CDN}/images/dota_react/global/dota2_logo_horiz.png`;
  },
  get STEAM_ICON() {
    return `${STEAM_CDN}/images/dota_react/icons/steam_icon.svg`;
  },
  get LANGUAGE_ICON() {
    return `${STEAM_CDN}/images/dota_react/icons/language.svg`;
  },
  get ARROW_OVER() {
    return `${STEAM_CDN}/images/dota_react/arrow_over.png`;
  },
  get SEARCH_ICON() {
    return `${STEAM_CDN}/images/dota_react/icons/search.svg`;
  },
  // Filters
  FILTER_ICON: (attr) => `${STEAM_CDN}/images/dota_react/herogrid/filter-${attr}-active.png`,
  get FILTER_DIAMOND() {
    return `${STEAM_CDN}/images/dota_react/herogrid/filter-diamond.png`;
  },
  // Videos
  ABILITY_VIDEO_POSTER: (heroName, abilityName) => `${STEAM_CDN}/videos/dota_react/abilities/${heroName}/${abilityName}.jpg`,
  ABILITY_VIDEO_WEBM: (heroName, abilityName) => `${STEAM_CDN}/videos/dota_react/abilities/${heroName}/${abilityName}.webm`,
  HERO_VIDEO_MOV: (heroName) => `${STEAM_CDN}/videos/dota_react/heroes/renders/${heroName}.mov`,
  HERO_VIDEO_WEBM: (heroName) => `${STEAM_CDN}/videos/dota_react/heroes/renders/${heroName}.webm`,
  HERO_RENDER_PNG: (heroName) => `${STEAM_CDN}/videos/dota_react/heroes/renders/${heroName}.png`,
  // Fonts
  FONT: (fontName) => {
    if (fontName === "reaver") return `${STEAM_CDN}/fonts/Reaver-Regular.woff`;
    return `${STEAM_CDN}/fonts/${fontName}.woff`;
  }
};
var Dota2Urls = class {
  static ASSET_URLS = ASSET_URLS;
  static setBaseUrl(url) {
    STEAM_CDN = url;
  }
  static heroImage(heroName) {
    if (!heroName) return "";
    const name = heroName.replace("npc_dota_hero_", "");
    return ASSET_URLS.HERO_IMAGE(name);
  }
  static itemImage(itemName) {
    if (!itemName) return "";
    const name = itemName.replace("item_", "").replace("recipe_", "");
    return ASSET_URLS.ITEM_IMAGE(name);
  }
  static abilityImage(abilityName) {
    return ASSET_URLS.ABILITY_IMAGE(abilityName);
  }
  static abilityVideo(heroName, abilityName) {
    const hName = heroName.replace("npc_dota_hero_", "");
    return {
      poster: ASSET_URLS.ABILITY_VIDEO_POSTER(hName, abilityName),
      webm: ASSET_URLS.ABILITY_VIDEO_WEBM(hName, abilityName)
    };
  }
  static heroVideo(heroName) {
    const hName = heroName.replace("npc_dota_hero_", "");
    return {
      mov: ASSET_URLS.HERO_VIDEO_MOV(hName),
      webm: ASSET_URLS.HERO_VIDEO_WEBM(hName),
      poster: ASSET_URLS.HERO_RENDER_PNG(hName)
    };
  }
  static attributeIcon(attr) {
    const mapping = {
      "0": "strength",
      "1": "agility",
      "2": "intelligence",
      "3": "universal",
      "str": "strength",
      "agi": "agility",
      "int": "intelligence",
      "uni": "universal"
    };
    const key = mapping[String(attr)] || "strength";
    return ASSET_URLS.ATTRIBUTE_ICON(key);
  }
  static toCloudflare(url) {
    return url.replace(STEAM_CDN, CLOUDFLARE_STEAM_CDN);
  }
};

// src/utils.ts
var utils_exports = {};
__export(utils_exports, {
  ABILITY_BEHAVIORS: () => ABILITY_BEHAVIORS,
  ROLE_NAMES: () => ROLE_NAMES,
  formatAbilityText: () => formatAbilityText,
  getAbilityBehaviorNames: () => getAbilityBehaviorNames,
  mergeAbilityData: () => mergeAbilityData,
  mergeHeroData: () => mergeHeroData,
  mergeItemData: () => mergeItemData,
  normalizeHeroName: () => normalizeHeroName
});
var ROLE_NAMES = [
  "Carry",
  "Support",
  "Nuker",
  "Disabler",
  "Jungler",
  "Durable",
  "Escape",
  "Pusher",
  "Initiator"
];
var ABILITY_BEHAVIORS = {
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
  "INNATE": 8796093022208n
};
function getAbilityBehaviorNames(behavior) {
  if (typeof behavior === "string" && behavior.includes(",")) {
    return behavior.split(",").map((s) => s.trim());
  }
  let b;
  try {
    b = BigInt(behavior);
  } catch {
    return [behavior.toString()];
  }
  const names = [];
  for (const [name, bit] of Object.entries(ABILITY_BEHAVIORS)) {
    if ((b & bit) === bit) {
      names.push(name);
    }
  }
  return names.length > 0 ? names : [behavior.toString()];
}
function getEffectiveValues(sv, upgradeContext, placeholderName) {
  let base = [...sv.values_float || []];
  let effectiveUpgrade = upgradeContext;
  if (!effectiveUpgrade && placeholderName) {
    const pLower = placeholderName.toLowerCase();
    if (pLower.includes("shard")) effectiveUpgrade = "shard";
    else if (pLower.includes("scepter")) effectiveUpgrade = "scepter";
  }
  if (effectiveUpgrade === "shard" && sv.values_shard?.length > 0) base = [...sv.values_shard];
  else if (effectiveUpgrade === "scepter" && sv.values_scepter?.length > 0) base = [...sv.values_scepter];
  return base;
}
function formatAbilityText(text, svs, hero, sourceAbility, upgradeContext) {
  if (!text) return "";
  let res = text;
  const round = (v) => {
    if (typeof v !== "number" || isNaN(v)) return 0;
    return Math.floor(100 * v) / 100;
  };
  const formatValues = (vals) => {
    if (!vals || vals.length === 0) return "";
    const rounded = vals.map(round);
    const allSame = rounded.every((v) => v === rounded[0]);
    return allSame ? rounded[0].toString() : rounded.join(" / ");
  };
  const resolvePlaceholder = (param) => {
    const pLower = param.toLowerCase();
    const checkName = (name) => {
      const lower = name.toLowerCase();
      return lower === pLower || pLower.startsWith("bonus_") && lower === pLower.replace("bonus_", "");
    };
    const localSv = svs?.find((v) => checkName(v.name));
    if (localSv) return formatValues(getEffectiveValues(localSv, upgradeContext, param));
    if (hero) {
      const allAbilities = [
        ...hero.abilities || [],
        ...hero.talents || []
      ].filter(Boolean);
      for (const a of allAbilities) {
        for (const s of a.special_values || []) {
          if (checkName(s.name)) {
            if (pLower.startsWith("bonus_")) {
              const bonus = s.bonuses?.find((b) => b.name === sourceAbility?.name);
              if (bonus) return Math.abs(round(bonus.value)).toString();
            }
            return formatValues(getEffectiveValues(s, upgradeContext, param));
          }
          if (param === "value" && s.bonuses?.some((b) => b.name === sourceAbility?.name)) {
            const bonus = s.bonuses.find((b) => b.name === sourceAbility?.name);
            if (bonus) return Math.abs(round(bonus.value)).toString();
          }
        }
      }
    }
    return null;
  };
  res = res.replace(/{s:([^}]+)}/g, (match, param) => resolvePlaceholder(param) ?? match);
  res = res.replace(/%([a-z0-9_$]+)%/gi, (match, param) => {
    const pName = param.split("$")[0].toLowerCase();
    if (pName === "zero_tooltip") return "0";
    return resolvePlaceholder(pName) ?? match;
  });
  return res.replace(/%%/g, "%");
}
function normalizeHeroName(name) {
  if (!name) return "";
  return name.replace("npc_dota_hero_", "");
}
function mergeHeroData(apiHero, cHero) {
  const merged = {
    ...apiHero,
    str_gain: cHero?.str_gain || apiHero.str_gain,
    agi_gain: cHero?.agi_gain || apiHero.agi_gain,
    int_gain: cHero?.int_gain || apiHero.int_gain
  };
  if (cHero) {
    if (!merged.name_loc && cHero.localized_name) merged.name_loc = cHero.localized_name;
  }
  return merged;
}
function mergeItemData(apiItem, cItem) {
  const name = apiItem.name || cItem?.name || "";
  const dname = apiItem.name_loc || cItem?.dname || name.replace(/^item_/, "");
  return {
    ...apiItem,
    ...cItem,
    id: apiItem.id || cItem?.id,
    name,
    name_loc: dname,
    // Prefer dname from constants if available
    cost: apiItem.cost ?? cItem?.gold ?? cItem?.cost,
    abilities: apiItem.abilities || cItem?.abilities || [],
    attrib: apiItem.attrib || cItem?.attrib || apiItem.attributes || [],
    lore: apiItem.lore_loc || cItem?.lore || apiItem.lore
  };
}
function mergeAbilityData(apiAbility, cAbility) {
  return {
    ...apiAbility,
    ...cAbility,
    name_loc: apiAbility.name_loc || cAbility?.dname,
    desc_loc: apiAbility.desc_loc || cAbility?.desc,
    lore_loc: apiAbility.lore_loc || cAbility?.lore,
    cooldowns: (apiAbility.cooldowns?.length ? apiAbility.cooldowns : cAbility?.cd) || [],
    mana_costs: (apiAbility.mana_costs?.length ? apiAbility.mana_costs : cAbility?.mc) || []
  };
}

// src/client.ts
var Dota2Datafeed = class {
  clientDf;
  clientConstants;
  language;
  useJsonExtension;
  static urls = Dota2Urls;
  static utils = utils_exports;
  constructor(config = {}) {
    this.language = config.language || "english";
    this.useJsonExtension = !!config.useJsonExtension;
    const timeout = config.timeout || 12e4;
    this.clientDf = axios.create({
      baseURL: config.dfBaseURL || config.baseURL || "https://www.dota2.com/datafeed",
      timeout
    });
    this.clientConstants = axios.create({
      baseURL: config.constantsBaseURL || (config.baseURL ? `${config.baseURL}/constants` : "https://raw.githubusercontent.com/odota/dotaconstants/master/build"),
      timeout
    });
    if (this.useJsonExtension) {
      [this.clientDf, this.clientConstants].forEach((c) => {
        c.interceptors.request.use((req) => {
          if (req.url && !req.url.endsWith(".json")) {
            if (req.url.includes("?")) {
              const [path, query] = req.url.split("?");
              if (!path.endsWith(".json")) req.url = `${path}.json?${query}`;
            } else {
              req.url += ".json";
            }
          }
          return req;
        });
      });
    }
  }
  /**
   * Fetches the list of all Dota 2 heroes from Valve.
   */
  async getHeroes() {
    try {
      const response = await this.clientDf.get("/herolist", {
        params: { language: this.language }
      });
      return response.data?.result?.data?.heroes || [];
    } catch (error) {
      this.handleError("getHeroes", error);
      throw error;
    }
  }
  /**
   * Fetches detailed data for a specific hero from Valve.
   */
  async getHeroData(heroId) {
    try {
      const path = this.useJsonExtension ? `/heroes/${heroId}` : "/herodata";
      const params = this.useJsonExtension ? { language: this.language } : { hero_id: heroId, language: this.language };
      const response = await this.clientDf.get(path, { params });
      return response.data?.result?.data?.heroes?.[0] || null;
    } catch (error) {
      this.handleError("getHeroData", error);
      throw error;
    }
  }
  /**
   * Fetches the list of all Dota 2 items from Valve.
   */
  async getItems() {
    try {
      const response = await this.clientDf.get("/itemlist", {
        params: { language: this.language }
      });
      return response.data?.result?.data?.itemabilities || [];
    } catch (error) {
      this.handleError("getItems", error);
      throw error;
    }
  }
  /**
   * Fetches the list of all Dota 2 abilities from Valve.
   */
  async getAbilities() {
    try {
      const response = await this.clientDf.get("/abilitylist", {
        params: { language: this.language }
      });
      const data = response.data.result.data;
      return data.abilities || data.itemabilities || [];
    } catch (error) {
      this.handleError("getAbilities", error);
      throw error;
    }
  }
  /**
   * Fetches the list of all Dota 2 patch notes from Valve.
   */
  async getPatchList() {
    try {
      const response = await this.clientDf.get("/patchnoteslist", {
        params: { language: this.language }
      });
      const data = response.data;
      return data?.patches || data?.result?.data?.patches || [];
    } catch (error) {
      this.handleError("getPatchList", error);
      throw error;
    }
  }
  /**
   * Fetches specific patch details from Valve.
   * @param version The patch version (e.g., '7.40b')
   */
  async getPatchNotes(version) {
    try {
      const path = this.useJsonExtension ? `/patches/${version}` : "/patchnotes";
      const params = this.useJsonExtension ? { language: this.language } : { version, language: this.language };
      const response = await this.clientDf.get(path, { params });
      return response.data;
    } catch (error) {
      this.handleError("getPatchNotes", error);
      throw error;
    }
  }
  // dotaconstants helpers (using clientConstants)
  async getConstantsHeroes() {
    return (await this.clientConstants.get("/heroes")).data;
  }
  async getConstantsAbilities() {
    return (await this.clientConstants.get("/abilities")).data;
  }
  async getConstantsHeroAbilities() {
    return (await this.clientConstants.get("/hero_abilities")).data;
  }
  async getConstantsAghsDesc() {
    return (await this.clientConstants.get("/aghs_desc")).data;
  }
  async getConstantsItems() {
    return (await this.clientConstants.get("/items")).data;
  }
  async getConstantsAbilityIds() {
    return (await this.clientConstants.get("/ability_ids")).data;
  }
  async getConstantsAbilityLookup() {
    return (await this.clientConstants.get("/ability_lookup")).data;
  }
  /**
   * Fetches the hero list and merges with dotaconstants.
   */
  async getHeroesWithConstants(constantsHeroes) {
    const heroes = await this.getHeroes();
    if (!constantsHeroes) return heroes;
    return heroes.map((h) => {
      const cHero = constantsHeroes[h.id];
      return cHero ? { ...h, ...cHero } : h;
    });
  }
  /**
   * Fetches the item list and merges with dotaconstants.
   */
  async getItemsWithConstants(constantsItems) {
    const baseItems = await this.getItems();
    if (!constantsItems) return baseItems;
    return Object.entries(constantsItems).map(([key, data]) => {
      const apiItem = baseItems.find((i) => i.name === key || i.name === `item_${key}`);
      return mergeItemData(apiItem || { name: key }, data);
    });
  }
  /**
   * Fetches detailed hero data and merges with dotaconstants.
   */
  async getHeroDataWithConstants(heroId, constantsHeroes) {
    const hero = await this.getHeroData(heroId);
    if (!hero) return null;
    const cHero = constantsHeroes?.[heroId];
    return mergeHeroData(hero, cHero);
  }
  handleError(method, error) {
    if (axios.isAxiosError(error)) {
      console.error(`Dota2Datafeed.${method} failed: ${error.message} - Status: ${error.response?.status}`);
    } else {
      console.error(`Dota2Datafeed.${method} failed: ${error.message}`);
    }
  }
};
export {
  ASSET_URLS,
  Dota2Datafeed,
  Dota2Urls,
  utils_exports as utils
};
