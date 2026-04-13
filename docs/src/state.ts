import { Dota2Datafeed } from '@core/client';

// API Instance
const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost';
const apiBase = isProduction ? './api' : '/api';

export const api = new Dota2Datafeed({ 
  baseURL: apiBase,
  useJsonExtension: isProduction 
});
Dota2Datafeed.urls.setBaseUrl(isProduction ? `${apiBase}/assets` : '/api/assets');

// State variables
export let currentMode: 'heroes' | 'items' | 'patches' = 'heroes';
export let currentCategory = 'all';
export let currentHeroCategory = 'all';
export let allData: any[] = [];
export let currentHeroId: number | null = null;
export let currentItemId: number | null = null;
export let currentPatchVersion: string | null = null;
export let selectedSearchIndex = 0;

export const setModeType = (mode: 'heroes' | 'items' | 'patches') => { (currentMode as any) = mode; };
export const setCategory = (cat: string) => { (currentCategory as any) = cat; };
export const setHeroCategory = (cat: string) => { (currentHeroCategory as any) = cat; };
export const setData = (data: any[]) => { (allData as any) = data; };
export const setHeroId = (id: number | null) => { (currentHeroId as any) = id; };
export const setItemId = (id: number | null) => { (currentItemId as any) = id; };
export const setPatchVersion = (version: string | null) => { (currentPatchVersion as any) = version; };
export const setSelectedSearchIndex = (index: number) => { (selectedSearchIndex as any) = index; };

import abilityLookupStatic from './ability_lookup.json';

// dotaconstants data stores
export let constantsHeroes: any = null;
export let constantsItems: any = null;
export let constantsAbilities: any = null;
export let abilityLookup: any = abilityLookupStatic;
export let constantsAbilityIds: any = null;
export let valveHeroes: any[] | null = null;
export let valveItems: any[] | null = null;

export const setConstants = (key: string, val: any) => {
  if (key === 'heroes') (constantsHeroes as any) = val;
  if (key === 'items') (constantsItems as any) = val;
  if (key === 'abilities') (constantsAbilities as any) = val;
  if (key === 'lookup') (abilityLookup as any) = val;
  if (key === 'abilityIds') (constantsAbilityIds as any) = val;
  if (key === 'valveHeroes') (valveHeroes as any) = val;
  if (key === 'valveItems') (valveItems as any) = val;
};

// DOM Elements
export const contentEl = document.getElementById('grid')!; // Linked to 'grid' in main.ts
export const loaderEl = document.getElementById('loader')!;
export const titleEl = document.getElementById('page-title')!; // Linked to 'page-title' in main.ts
export const searchInput = document.getElementById('search-input') as HTMLInputElement;
export const modalEl = document.getElementById('modal')!;
export const modalBody = document.getElementById('modal-body')!;
export const modalSearch = document.getElementById('modal-search') as HTMLInputElement;
export const modalSearchResults = document.getElementById('modal-search-results')!;
export const modalClose = document.getElementById('modal-close')!;
export const clearCacheBtn = document.getElementById('clear-cache')!;
export const itemCategoriesEl = document.getElementById('item-categories')!;
export const heroCategoriesEl = document.getElementById('hero-categories')!;

export const navLinks = {
  heroes: document.getElementById('nav-heroes')!,
  items: document.getElementById('nav-items')!,
  patches: document.getElementById('nav-patches')!,
};
