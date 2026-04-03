interface Dota2Hero {
    id: number;
    name: string;
    name_loc: string;
    name_english_loc: string;
    primary_attr: number;
    complexity: number;
    roles: number[];
}
interface Dota2Item {
    id: number;
    name: string;
    name_loc: string;
    name_english_loc: string;
    cost: number;
    desc_loc: string;
    lore_loc: string;
    notes_loc: string[];
    attrib_loc: string[];
    item_slot: number;
    abilities?: any[];
    attrib?: any[];
    attributes?: any[];
    lore?: string;
    neutral_item_tier?: number;
    qual?: string;
    behavior?: string | string[];
}
interface Dota2Ability {
    id: number;
    name: string;
    name_loc: string;
    desc_loc: string;
    lore_loc: string;
    notes_loc: string[];
    attrib_loc: string[];
}
interface DatafeedResponse<T> {
    result: {
        data: T[];
        status: number;
    };
}
interface HeroListResponse {
    result: {
        data: {
            heroes: Dota2Hero[];
        };
        status: number;
    };
}
interface ItemListResponse {
    result: {
        data: {
            itemabilities: Dota2Item[];
        };
        status: number;
    };
}
interface AbilityListResponse {
    result: {
        data: {
            abilities?: Dota2Ability[];
            itemabilities?: Dota2Ability[];
        };
        status: number;
    };
}
interface PatchNotes {
    patch_number: string;
    patch_name: string;
    patch_timestamp: number;
}
interface PatchNotesResponse {
    result?: {
        data: {
            patches: PatchNotes[];
        };
        status: number;
    };
    patches?: PatchNotes[];
    success?: boolean;
}
interface PatchNote {
    indent_level: number;
    note: string;
}
interface PatchAbilityChange {
    ability_id: number;
    ability_notes: PatchNote[];
}
interface PatchHeroChange {
    hero_id: number;
    hero_notes?: PatchNote[];
    talent_notes?: PatchNote[];
    abilities?: PatchAbilityChange[];
}
interface PatchItemChange {
    ability_id: number;
    ability_notes: PatchNote[];
}
interface PatchGeneralNote {
    title?: string;
    generic: PatchNote[];
}
interface PatchDetailsResponse {
    patch_number: string;
    patch_name: string;
    patch_timestamp: number;
    general_notes?: PatchGeneralNote[];
    items: PatchItemChange[];
    neutral_items?: PatchItemChange[];
    heroes: PatchHeroChange[];
    success?: boolean;
}
interface AbilityBonus {
    name: string;
    value: number;
    operation: number;
}
interface AbilitySpecialValue {
    name: string;
    values_float: number[];
    values_shard: number[];
    values_scepter: number[];
    is_percentage: boolean;
    heading_loc: string;
    bonuses: AbilityBonus[];
}
interface DetailedAbility {
    id: number;
    name: string;
    name_loc: string;
    desc_loc: string;
    lore_loc: string;
    notes_loc: string[];
    shard_loc: string;
    scepter_loc: string;
    type: number;
    behavior: string | number;
    target_team: number;
    target_type: number;
    flags: number;
    damage: number;
    immunity: number;
    dispellable: number;
    max_level: number;
    item_cost: number;
    ability_has_scepter: boolean;
    ability_has_shard: boolean;
    ability_is_innate: boolean;
    ability_is_granted_by_shard: boolean;
    ability_is_granted_by_scepter: boolean;
    cooldowns: number[];
    mana_costs: number[];
    special_values: AbilitySpecialValue[];
}
interface DetailedHero {
    id: number;
    name: string;
    name_loc: string;
    bio_loc: string;
    hype_loc: string;
    npe_desc_loc: string;
    str_base: number;
    str_gain: number;
    agi_base: number;
    agi_gain: number;
    int_base: number;
    int_gain: number;
    primary_attr: number;
    complexity: number;
    attack_capability: number;
    damage_min: number;
    damage_max: number;
    attack_rate: number;
    attack_range: number;
    projectile_speed: number;
    armor: number;
    magic_resistance: number;
    movement_speed: number;
    turn_rate: number;
    sight_range_day: number;
    sight_range_night: number;
    max_health: number;
    health_regen: number;
    max_mana: number;
    mana_regen: number;
    abilities: DetailedAbility[];
    talents: DetailedAbility[];
    role_levels: number[];
}
interface HeroDataResponse {
    result: {
        data: {
            heroes: DetailedHero[];
        };
        status: number;
    };
}

/**
 * Constants for various Dota 2 assets.
 */
declare const ASSET_URLS: {
    ITEM_IMAGE: (shortName: string) => string;
    ABILITY_IMAGE: (shortName: string) => string;
    HERO_IMAGE: (shortName: string) => string;
    readonly TALENT_ICON: string;
    readonly INNATE_ICON: string;
    ATTRIBUTE_ICON: (attr: "strength" | "agility" | "intelligence" | "universal") => string;
    ATTACK_TYPE_ICON: (type: "melee" | "ranged") => string;
    readonly AGHS_SCEPTER: string;
    readonly AGHS_SHARD: string;
    readonly COOLDOWN: string;
    readonly GOLD: string;
    STAT_ICON: (stat: "damage" | "attack_time" | "attack_range" | "armor" | "magic_resist" | "movement_speed" | "turn_rate" | "vision") => string;
    readonly FAVICON: string;
    readonly VALVE_LOGO: string;
    readonly DOTA_FOOTER_LOGO: string;
    readonly DOTA_LOGO_HORIZ: string;
    readonly STEAM_ICON: string;
    readonly LANGUAGE_ICON: string;
    readonly ARROW_OVER: string;
    readonly SEARCH_ICON: string;
    FILTER_ICON: (attr: "str" | "agi" | "int" | "uni") => string;
    readonly FILTER_DIAMOND: string;
    ABILITY_VIDEO_POSTER: (heroName: string, abilityName: string) => string;
    ABILITY_VIDEO_WEBM: (heroName: string, abilityName: string) => string;
    HERO_VIDEO_MOV: (heroName: string) => string;
    HERO_VIDEO_WEBM: (heroName: string) => string;
    HERO_RENDER_PNG: (heroName: string) => string;
    FONT: (fontName: string) => string;
};
/**
 * Helper utility for Dota 2 asset URLs.
 */
declare class Dota2Urls {
    static ASSET_URLS: {
        ITEM_IMAGE: (shortName: string) => string;
        ABILITY_IMAGE: (shortName: string) => string;
        HERO_IMAGE: (shortName: string) => string;
        readonly TALENT_ICON: string;
        readonly INNATE_ICON: string;
        ATTRIBUTE_ICON: (attr: "strength" | "agility" | "intelligence" | "universal") => string;
        ATTACK_TYPE_ICON: (type: "melee" | "ranged") => string;
        readonly AGHS_SCEPTER: string;
        readonly AGHS_SHARD: string;
        readonly COOLDOWN: string;
        readonly GOLD: string;
        STAT_ICON: (stat: "damage" | "attack_time" | "attack_range" | "armor" | "magic_resist" | "movement_speed" | "turn_rate" | "vision") => string;
        readonly FAVICON: string;
        readonly VALVE_LOGO: string;
        readonly DOTA_FOOTER_LOGO: string;
        readonly DOTA_LOGO_HORIZ: string;
        readonly STEAM_ICON: string;
        readonly LANGUAGE_ICON: string;
        readonly ARROW_OVER: string;
        readonly SEARCH_ICON: string;
        FILTER_ICON: (attr: "str" | "agi" | "int" | "uni") => string;
        readonly FILTER_DIAMOND: string;
        ABILITY_VIDEO_POSTER: (heroName: string, abilityName: string) => string;
        ABILITY_VIDEO_WEBM: (heroName: string, abilityName: string) => string;
        HERO_VIDEO_MOV: (heroName: string) => string;
        HERO_VIDEO_WEBM: (heroName: string) => string;
        HERO_RENDER_PNG: (heroName: string) => string;
        FONT: (fontName: string) => string;
    };
    static setBaseUrl(url: string): void;
    static heroImage(heroName: string): string;
    static itemImage(itemName: string): string;
    static abilityImage(abilityName: string): string;
    static abilityVideo(heroName: string, abilityName: string): {
        poster: string;
        webm: string;
    };
    static heroVideo(heroName: string): {
        mov: string;
        webm: string;
        poster: string;
    };
    static attributeIcon(attr: number | string): string;
    static toCloudflare(url: string): string;
}

declare const ROLE_NAMES: string[];
declare const ABILITY_BEHAVIORS: Record<string, bigint>;
/**
 * Translates an ability behavior bitmask into an array of human-readable strings.
 */
declare function getAbilityBehaviorNames(behavior: number | string | bigint): string[];
/**
 * Formats Dota 2 ability/talent text by resolving placeholders like %param% and {s:bonus_name}.
 */
declare function formatAbilityText(text: string, svs: AbilitySpecialValue[], hero?: DetailedHero, sourceAbility?: DetailedAbility, upgradeContext?: 'shard' | 'scepter'): string;
/**
 * Normalizes a hero name by removing the 'npc_dota_hero_' prefix.
 */
declare function normalizeHeroName(name: string): string;
/**
 * Merges API hero data with dotaconstants.
 */
declare function mergeHeroData(apiHero: DetailedHero, cHero?: any): DetailedHero;
/**
 * Merges API item data with dotaconstants.
 */
declare function mergeItemData(apiItem: Partial<Dota2Item>, cItem: any): Dota2Item;
/**
 * Merges API ability data with dotaconstants.
 */
declare function mergeAbilityData(apiAbility: Partial<DetailedAbility>, cAbility: any): DetailedAbility;

declare const utils_ABILITY_BEHAVIORS: typeof ABILITY_BEHAVIORS;
declare const utils_ROLE_NAMES: typeof ROLE_NAMES;
declare const utils_formatAbilityText: typeof formatAbilityText;
declare const utils_getAbilityBehaviorNames: typeof getAbilityBehaviorNames;
declare const utils_mergeAbilityData: typeof mergeAbilityData;
declare const utils_mergeHeroData: typeof mergeHeroData;
declare const utils_mergeItemData: typeof mergeItemData;
declare const utils_normalizeHeroName: typeof normalizeHeroName;
declare namespace utils {
  export { utils_ABILITY_BEHAVIORS as ABILITY_BEHAVIORS, utils_ROLE_NAMES as ROLE_NAMES, utils_formatAbilityText as formatAbilityText, utils_getAbilityBehaviorNames as getAbilityBehaviorNames, utils_mergeAbilityData as mergeAbilityData, utils_mergeHeroData as mergeHeroData, utils_mergeItemData as mergeItemData, utils_normalizeHeroName as normalizeHeroName };
}

interface Dota2DatafeedConfig {
    language?: string;
    baseURL?: string;
    dfBaseURL?: string;
    constantsBaseURL?: string;
    timeout?: number;
    useJsonExtension?: boolean;
}
/**
 * A normalization and enrichment layer for Dota 2 data feeds.
 */
declare class Dota2Datafeed {
    private clientDf;
    private clientConstants;
    private language;
    static urls: typeof Dota2Urls;
    static utils: typeof utils;
    constructor(config?: Dota2DatafeedConfig);
    /**
     * Fetches the list of all Dota 2 heroes from Valve.
     */
    getHeroes(): Promise<Dota2Hero[]>;
    /**
     * Fetches detailed data for a specific hero from Valve.
     */
    getHeroData(heroId: number): Promise<DetailedHero | null>;
    /**
     * Fetches the list of all Dota 2 items from Valve.
     */
    getItems(): Promise<Dota2Item[]>;
    /**
     * Fetches the list of all Dota 2 abilities from Valve.
     */
    getAbilities(): Promise<Dota2Ability[]>;
    /**
     * Fetches the list of all Dota 2 patch notes from Valve.
     */
    getPatchList(): Promise<PatchNotes[]>;
    /**
     * Fetches specific patch details from Valve.
     * @param version The patch version (e.g., '7.40b')
     */
    getPatchNotes(version: string): Promise<PatchDetailsResponse>;
    getConstantsHeroes(): Promise<any>;
    getConstantsAbilities(): Promise<any>;
    getConstantsHeroAbilities(): Promise<any>;
    getConstantsAghsDesc(): Promise<any>;
    getConstantsItems(): Promise<any>;
    getConstantsAbilityIds(): Promise<any>;
    getConstantsAbilityLookup(): Promise<any>;
    /**
     * Fetches the hero list and merges with dotaconstants.
     */
    getHeroesWithConstants(constantsHeroes: any): Promise<Dota2Hero[]>;
    /**
     * Fetches the item list and merges with dotaconstants.
     */
    getItemsWithConstants(constantsItems: any): Promise<Dota2Item[]>;
    /**
     * Fetches detailed hero data and merges with dotaconstants.
     */
    getHeroDataWithConstants(heroId: number, constantsHeroes: any): Promise<DetailedHero | null>;
    private handleError;
}

export { ASSET_URLS, type AbilityBonus, type AbilityListResponse, type AbilitySpecialValue, type DatafeedResponse, type DetailedAbility, type DetailedHero, type Dota2Ability, Dota2Datafeed, type Dota2DatafeedConfig, type Dota2Hero, type Dota2Item, Dota2Urls, type HeroDataResponse, type HeroListResponse, type ItemListResponse, type PatchAbilityChange, type PatchDetailsResponse, type PatchGeneralNote, type PatchHeroChange, type PatchItemChange, type PatchNote, type PatchNotes, type PatchNotesResponse, utils };
