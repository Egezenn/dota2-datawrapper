import { 
  currentMode, loaderEl, contentEl, 
  setData, setConstants,
  constantsHeroes, constantsItems, constantsAbilityIds,
  api
} from './state';
import { render } from './render/grid';
import { LocalCache } from './cache';

let isConstantsLoading = false;

export async function ensureConstants() {
  if (constantsHeroes && constantsItems && constantsAbilityIds) return;
  if (isConstantsLoading) {
    // Wait until loading finishes
    while (isConstantsLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return;
  }

  isConstantsLoading = true;
  console.log('[Explorer] Loading dotaconstants...');
  
  try {
    const [heroes, items, abilities, lookup, abilityIds, vHeroes, vItems] = await Promise.all([
      LocalCache.getOrFetch('constants_heroes', () => api.getConstantsHeroes()),
      LocalCache.getOrFetch('constants_items', () => api.getConstantsItems()),
      LocalCache.getOrFetch('constants_abilities', () => api.getConstantsAbilities()),
      LocalCache.getOrFetch('constants_ability_lookup', () => api.getConstantsAbilityLookup()),
      LocalCache.getOrFetch('constants_ability_ids', () => api.getConstantsAbilityIds()),
      LocalCache.getOrFetch('valve_heroes', () => api.getHeroes()),
      LocalCache.getOrFetch('valve_items', () => api.getItems())
    ]);

    setConstants('heroes', heroes);
    setConstants('items', items);
    setConstants('abilities', abilities);
    setConstants('lookup', lookup);
    setConstants('abilityIds', abilityIds);
    setConstants('valveHeroes', vHeroes);
    setConstants('valveItems', vItems);
  } catch (err) {
    console.error('[Explorer] Failed to load dotaconstants:', err);
  } finally {
    isConstantsLoading = false;
  }
}

export async function loadData() {
  console.log(`[Explorer] Switching to ${currentMode}...`);
  contentEl.innerHTML = '';
  loaderEl.classList.remove('hidden');

  try {
    let freshData: any[] = [];
    
    if (currentMode === 'heroes') {
      await ensureConstants();
      freshData = await LocalCache.getOrFetch('heroes', () => api.getHeroesWithConstants(constantsHeroes));
    } else if (currentMode === 'items') {
      await ensureConstants();
      freshData = await LocalCache.getOrFetch('items', () => api.getItemsWithConstants(constantsItems));
    } else if (currentMode === 'patches') {
      await ensureConstants();
      freshData = await LocalCache.getOrFetch('patches', () => api.getPatchList());
    }
    
    console.log(`[Explorer] Received ${freshData?.length || 0} items`);
    setData(freshData || []);

    if (freshData.length === 0) {
      contentEl.innerHTML = `
        <div class="empty-state">
          <h3>No Data Found</h3>
          <p>The API returned an empty list for ${currentMode}.</p>
          <button onclick="localStorage.clear(); location.reload();" class="refresh-btn">Force Reset & Reload</button>
        </div>
      `;
    } else {
      render(freshData);
    }
  } catch (err: any) {
    console.error('[Explorer] Error loading data:', err);
    contentEl.innerHTML = `
      <div class="error">
        <h3>Connection Error</h3>
        <p>${err.message || 'Unknown error'}</p>
        <button onclick="location.reload();" class="refresh-btn">Retry</button>
      </div>
    `;
  } finally {
    loaderEl.classList.add('hidden');
  }
}
