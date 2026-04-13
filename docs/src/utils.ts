import { Dota2Datafeed } from '@core/client';
import type { DetailedAbility } from '@core/types';
import { abilityLookup } from './state';
import { LocalCache } from './cache';

export function getAttributeName(attr: number | string) {
  const a = typeof attr === 'string' ? attr.toLowerCase() : attr;
  switch (a) {
    case 0:
    case '0':
    case 'str': 
      return 'Strength';
    case 1:
    case '1':
    case 'agi': 
      return 'Agility';
    case 2:
    case '2':
    case 'int': 
      return 'Intelligence';
    case 3:
    case '3':
    case 'all':
    case 'uni':
      return 'Universal';
    default: 
      return 'Unknown';
  }
}

export function getAbilityIconUrl(name: string, dAbility?: DetailedAbility) {
  const lookup = (abilityLookup as any)?.[name];
  const isInnate = dAbility?.ability_is_innate || lookup?.is_innate;
  
  // Assume icon exists unless explicitly marked as missing in lookup
  let imgUrl = (lookup?.has_icon !== false) ? Dota2Datafeed.urls.abilityImage(name) : '';
  
  // Fallback to innate icon if specific icon is missing and it's an innate
  if (!imgUrl && isInnate) {
    imgUrl = Dota2Datafeed.urls.ASSET_URLS.INNATE_ICON;
  }
  
  return imgUrl || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
}

export async function loadCachedImg(img: HTMLImageElement, url: string) {
  img.src = await LocalCache.getCachedImageUrl(url);
}

export async function processImages(container: HTMLElement) {
  const imgs = container.querySelectorAll('img[data-src]');
  for (const img of Array.from(imgs)) {
    const url = img.getAttribute('data-src')!;
    loadCachedImg(img as HTMLImageElement, url);
  }
}

export function getSearchScore(text: string, query: string): number {
  if (!query) return 1;
  text = text.toLowerCase();
  query = query.toLowerCase();
  
  let score = 0;
  if (text === query) score = 100;
  else {
    // Acronym match check (e.g. bkb -> Black King Bar)
    const words = text.split(/[\s\-_]+/).filter(w => w.length > 0);
    if (words.length >= query.length && query.length > 1) {
      let qIdx = 0;
      for (let i = 0; i < words.length && qIdx < query.length; i++) {
        if (words[i][0] === query[qIdx]) qIdx++;
      }
      if (qIdx === query.length) score = 95;
    }
  }

  if (score === 0) {
    if (text.startsWith(query)) score = 80;
    else if (text.includes(query)) score = 50;
    else {
    // Basic fuzzy: check if characters appear in order
    let textIdx = 0;
    let queryIdx = 0;
    while (textIdx < text.length && queryIdx < query.length) {
      if (text[textIdx] === query[queryIdx]) {
        queryIdx++;
      }
      textIdx++;
    }
    if (queryIdx === query.length) score = 10;
    }
  }
  
  // Devalue recipes unless explicitly searching for them
  if (score > 0 && text.includes('recipe') && !query.includes('recipe')) {
    score -= 5;
  }

  return score;
}

export function debounce(fn: Function, delay: number) {
  let timeoutId: any;
  return function(...args: any[]) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
