import axios, { type AxiosInstance } from 'axios';
import type { HeroListResponse, ItemListResponse, AbilityListResponse, PatchNotesResponse, PatchDetailsResponse, HeroDataResponse, Dota2Hero, Dota2Item, Dota2Ability, PatchNotes, DetailedHero } from './types';
import { Dota2Urls } from './urls';
import * as utils from './utils';

export interface Dota2DatafeedConfig {
  language?: string;
  baseURL?: string; // Legacy/Global base URL
  dfBaseURL?: string; // Valve Datafeed
  constantsBaseURL?: string; // dotaconstants
  timeout?: number;
  useJsonExtension?: boolean;
}

/**
 * A normalization and enrichment layer for Dota 2 data feeds.
 */
export class Dota2Datafeed {
  private clientDf: AxiosInstance;
  private clientConstants: AxiosInstance;
  private language: string;
  private useJsonExtension: boolean;
  public static urls = Dota2Urls;
  public static utils = utils;

  constructor(config: Dota2DatafeedConfig = {}) {
    this.language = config.language || 'english';
    this.useJsonExtension = !!config.useJsonExtension;
    const timeout = config.timeout || 120000;

    // 1. Valve Datafeed Client
    this.clientDf = axios.create({
      baseURL: config.dfBaseURL || config.baseURL || 'https://www.dota2.com/datafeed',
      timeout,
    });

    // 2. Constants Client (defaults to local /constants if baseURL is provided, else GitHub)
    this.clientConstants = axios.create({
      baseURL: config.constantsBaseURL || (config.baseURL ? `${config.baseURL}/constants` : 'https://raw.githubusercontent.com/odota/dotaconstants/master/build'),
      timeout,
    });

    if (this.useJsonExtension) {
      [this.clientDf, this.clientConstants].forEach(c => {
        c.interceptors.request.use((req) => {
          if (req.url && !req.url.endsWith('.json')) {
            // Strip any existing .json if we are about to add it (though usually it's not there)
            // If it has a query string, inject .json before the ?
            if (req.url.includes('?')) {
              const [path, query] = req.url.split('?');
              if (!path.endsWith('.json')) req.url = `${path}.json?${query}`;
            } else {
              req.url += '.json';
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
  async getHeroes(): Promise<Dota2Hero[]> {
    try {
      const response = await this.clientDf.get<HeroListResponse>('/herolist', {
        params: { language: this.language },
      });
      return response.data?.result?.data?.heroes || [];
    } catch (error) {
      this.handleError('getHeroes', error);
      throw error;
    }
  }

  /**
   * Fetches detailed data for a specific hero from Valve.
   */
  async getHeroData(heroId: number): Promise<DetailedHero | null> {
    try {
      const path = this.useJsonExtension ? `/heroes/${heroId}` : '/herodata';
      const params = this.useJsonExtension ? { language: this.language } : { hero_id: heroId, language: this.language };
      
      const response = await this.clientDf.get<HeroDataResponse>(path, { params });
      return response.data?.result?.data?.heroes?.[0] || null;
    } catch (error) {
      this.handleError('getHeroData', error);
      throw error;
    }
  }

  /**
   * Fetches the list of all Dota 2 items from Valve.
   */
  async getItems(): Promise<Dota2Item[]> {
    try {
      const response = await this.clientDf.get<ItemListResponse>('/itemlist', {
        params: { language: this.language },
      });
      return response.data?.result?.data?.itemabilities || [];
    } catch (error) {
      this.handleError('getItems', error);
      throw error;
    }
  }

  /**
   * Fetches the list of all Dota 2 abilities from Valve.
   */
  async getAbilities(): Promise<Dota2Ability[]> {
    try {
      const response = await this.clientDf.get<AbilityListResponse>('/abilitylist', {
        params: { language: this.language },
      });
      const data = response.data.result.data;
      return data.abilities || data.itemabilities || [];
    } catch (error) {
      this.handleError('getAbilities', error);
      throw error;
    }
  }

  /**
   * Fetches the list of all Dota 2 patch notes from Valve.
   */
  async getPatchList(): Promise<PatchNotes[]> {
    try {
      const response = await this.clientDf.get<PatchNotesResponse>('/patchnoteslist', {
        params: { language: this.language },
      });
      const data = response.data;
      return data?.patches || data?.result?.data?.patches || [];
    } catch (error) {
      this.handleError('getPatchList', error);
      throw error;
    }
  }

  /**
   * Fetches specific patch details from Valve.
   * @param version The patch version (e.g., '7.40b')
   */
  async getPatchNotes(version: string): Promise<PatchDetailsResponse> {
    try {
      const path = this.useJsonExtension ? `/patches/${version}` : '/patchnotes';
      const params = this.useJsonExtension ? { language: this.language } : { version, language: this.language };

      const response = await this.clientDf.get<PatchDetailsResponse>(path, { params });
      return response.data;
    } catch (error) {
      this.handleError('getPatchNotes', error);
      throw error;
    }
  }

  // dotaconstants helpers (using clientConstants)
  async getConstantsHeroes(): Promise<any> {
    return (await this.clientConstants.get('/heroes')).data;
  }

  async getConstantsAbilities(): Promise<any> {
    return (await this.clientConstants.get('/abilities')).data;
  }

  async getConstantsHeroAbilities(): Promise<any> {
    return (await this.clientConstants.get('/hero_abilities')).data;
  }

  async getConstantsAghsDesc(): Promise<any> {
    return (await this.clientConstants.get('/aghs_desc')).data;
  }

  async getConstantsItems(): Promise<any> {
    return (await this.clientConstants.get('/items')).data;
  }

  async getConstantsAbilityIds(): Promise<any> {
    return (await this.clientConstants.get('/ability_ids')).data;
  }

  async getConstantsAbilityLookup(): Promise<any> {
    return (await this.clientConstants.get('/ability_lookup')).data;
  }

  /**
   * Fetches the hero list and merges with dotaconstants.
   */
  async getHeroesWithConstants(constantsHeroes: any): Promise<Dota2Hero[]> {
    const heroes = await this.getHeroes();
    if (!constantsHeroes) return heroes;
    return heroes.map(h => {
      const cHero = constantsHeroes[h.id];
      return cHero ? { ...h, ...cHero } : h;
    });
  }

  /**
   * Fetches the item list and merges with dotaconstants.
   */
  async getItemsWithConstants(constantsItems: any): Promise<Dota2Item[]> {
    const baseItems = await this.getItems();
    if (!constantsItems) return baseItems;

    return Object.entries(constantsItems).map(([key, data]: [string, any]) => {
      const apiItem = baseItems.find((i: any) => i.name === key || i.name === `item_${key}`);
      return utils.mergeItemData(apiItem || { name: key }, data);
    });
  }

  /**
   * Fetches detailed hero data and merges with dotaconstants.
   */
  async getHeroDataWithConstants(
    heroId: number, 
    constantsHeroes: any
  ): Promise<DetailedHero | null> {
    const hero = await this.getHeroData(heroId);
    if (!hero) return null;

    const cHero = constantsHeroes?.[heroId];
    return utils.mergeHeroData(hero, cHero);
  }

  private handleError(method: string, error: any): void {
    if (axios.isAxiosError(error)) {
      console.error(`Dota2Datafeed.${method} failed: ${error.message} - Status: ${error.response?.status}`);
    } else {
      console.error(`Dota2Datafeed.${method} failed: ${error.message}`);
    }
  }
}
