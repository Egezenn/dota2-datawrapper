export interface Dota2Hero {
  id: number;
  name: string;
  name_loc: string;
  name_english_loc: string;
  primary_attr: number;
  complexity: number;
  roles: number[];
}

export interface Dota2Item {
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

export interface Dota2Ability {
  id: number;
  name: string;
  name_loc: string;
  desc_loc: string;
  lore_loc: string;
  notes_loc: string[];
  attrib_loc: string[];
}

export interface DatafeedResponse<T> {
  result: {
    data: T[];
    status: number;
  };
}

export interface HeroListResponse {
  result: {
    data: {
      heroes: Dota2Hero[];
    };
    status: number;
  };
}

export interface ItemListResponse {
  result: {
    data: {
      itemabilities: Dota2Item[];
    };
    status: number;
  };
}

export interface AbilityListResponse {
  result: {
    data: {
      abilities?: Dota2Ability[];
      itemabilities?: Dota2Ability[];
    };
    status: number;
  };
}

export interface PatchNotes {
  patch_number: string;
  patch_name: string;
  patch_timestamp: number;
}

export interface PatchNotesResponse {
  result?: {
    data: {
      patches: PatchNotes[];
    };
    status: number;
  };
  patches?: PatchNotes[];
  success?: boolean;
}

export interface PatchNote {
  indent_level: number;
  note: string;
}

export interface PatchAbilityChange {
  ability_id: number;
  ability_notes: PatchNote[];
}

export interface PatchHeroChange {
  hero_id: number;
  hero_notes?: PatchNote[];
  talent_notes?: PatchNote[];
  abilities?: PatchAbilityChange[];
}

export interface PatchItemChange {
  ability_id: number;
  ability_notes: PatchNote[];
}

export interface PatchGeneralNote {
  title?: string;
  generic: PatchNote[];
}

export interface PatchDetailsResponse {
  patch_number: string;
  patch_name: string;
  patch_timestamp: number;
  general_notes?: PatchGeneralNote[];
  items: PatchItemChange[];
  neutral_items?: PatchItemChange[];
  heroes: PatchHeroChange[];
  success?: boolean;
}

export interface AbilityBonus {
  name: string;
  value: number;
  operation: number;
}

export interface AbilitySpecialValue {
  name: string;
  values_float: number[];
  values_shard: number[];
  values_scepter: number[];
  is_percentage: boolean;
  heading_loc: string;
  bonuses: AbilityBonus[];
}

export interface DetailedAbility {
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

export interface DetailedHero {
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

export interface HeroDataResponse {
  result: {
    data: {
      heroes: DetailedHero[];
    };
    status: number;
  };
}
