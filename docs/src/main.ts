import './style.css';
import { 
  currentMode, currentHeroId, currentItemId, currentPatchVersion, allData,
  setModeType, setCategory, setHeroCategory, setHeroId, setItemId, setPatchVersion,
  selectedSearchIndex, setSelectedSearchIndex,
  navLinks, titleEl, searchInput, heroCategoriesEl, itemCategoriesEl,
  modalEl, modalBody, modalSearch, modalSearchResults, clearCacheBtn, api, constantsItems
} from './state';
import { ensureConstants, loadData } from './data';
import { render } from './render/grid';
import { renderHeroDetails } from './render/hero';
import { renderItemDetails } from './render/item';
import { showPatchDetails } from './render/patch';
import { LocalCache } from './cache';
import { getAttributeName, debounce, getSearchScore } from './utils';

// --- Navigation & Routing ---
async function setMode(mode: 'heroes' | 'items' | 'patches') {
  if (currentMode === mode && allData.length > 0) return;
  
  setModeType(mode);
  Object.values(navLinks).forEach(el => el.classList.remove('active'));
  if (navLinks[mode]) navLinks[mode].classList.add('active');
  
  titleEl.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
  searchInput.placeholder = `Search ${mode}...`;
  searchInput.value = '';
  closeModal();

  if (mode === 'heroes') {
    heroCategoriesEl.classList.remove('hidden');
    itemCategoriesEl.classList.add('hidden');
  } else if (mode === 'items') {
    itemCategoriesEl.classList.remove('hidden');
    heroCategoriesEl.classList.add('hidden');
  } else {
    itemCategoriesEl.classList.add('hidden');
    heroCategoriesEl.classList.add('hidden');
    setCategory('all');
    setHeroCategory('all');
    document.querySelectorAll('.category-nav .cat-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.category-nav [data-category="all"]').forEach(btn => btn.classList.add('active'));
  }

  await loadData();
}

const closeModal = () => {
  modalEl.classList.add('hidden');
  document.body.classList.remove('no-scroll');
  setHeroId(null);
  setItemId(null);
  setPatchVersion(null);
  modalSearch.value = '';
  modalSearchResults.classList.add('hidden');
  document.getElementById('modal-search-clear')?.classList.add('hidden');

  // Clear main search bar
  if (searchInput.value) {
    searchInput.value = '';
    document.getElementById('main-search-clear')?.classList.add('hidden');
    render(allData);
  }
};

// Handle hash changes
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1) as any;
  if (['heroes', 'items', 'patches'].includes(hash)) {
    setMode(hash);
  }
});

// --- Details Handlers ---
async function showHeroDetails(id: number) {
  setHeroId(id);
  modalBody.innerHTML = '<div class="loader"></div>';
  modalEl.classList.remove('hidden');
  document.body.classList.add('no-scroll');
  
  // Clear main search
  searchInput.blur();
  if (searchInput.value) {
    searchInput.value = '';
    document.getElementById('main-search-clear')?.classList.add('hidden');
    render(allData);
  }
  
  try {
    const hero = await LocalCache.getOrFetch(`hero_${id}`, () => api.getHeroData(id));
    if (hero) renderHeroDetails(hero);
  } catch (err) {
    console.error(err);
    modalBody.innerHTML = 'Error loading details.';
  }
}

async function showItemDetails(id: number) {
  setItemId(id);
  setHeroId(null);
  modalEl.classList.remove('hidden');
  document.body.classList.add('no-scroll');
  modalBody.innerHTML = '<div class="loader">Merging...</div>';
  searchInput.blur();
  searchInput.value = '';
  document.getElementById('main-search-clear')?.classList.add('hidden');
  render(allData);
  
  try {
    const items = await LocalCache.getOrFetch('items', () => api.getItemsWithConstants(constantsItems));
    const item = items.find((i: any) => i.id === id);
    if (item) renderItemDetails(item);
  } catch (err) {
    console.error(err);
    modalBody.innerHTML = 'Error loading details.';
  }
}

// Global helpers for onclick attributes
(window as any).showHeroDetails = showHeroDetails;
(window as any).showItemDetails = showItemDetails;
(window as any).showPatchDetails = showPatchDetails;
(window as any).showItemDetailsByName = async (name: string) => {
  const items = await LocalCache.getOrFetch('items', () => api.getItems());
  const item = items.find((i: any) => i.name === name);
  if (item) showItemDetails(item.id);
};

// --- Initialization ---
async function init() {
  await ensureConstants();
  
  // Category listeners
  heroCategoriesEl.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      heroCategoriesEl.querySelector('.cat-btn.active')?.classList.remove('active');
      btn.classList.add('active');
      setHeroCategory((btn as HTMLElement).dataset.category || 'all');
      render(allData);
    });
  });

  itemCategoriesEl.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      itemCategoriesEl.querySelector('.cat-btn.active')?.classList.remove('active');
      btn.classList.add('active');
      setCategory((btn as HTMLElement).dataset.category || 'all');
      render(allData);
    });
  });

  const mainSearchClear = document.getElementById('main-search-clear') as HTMLButtonElement;
  searchInput.addEventListener('input', () => {
    mainSearchClear.classList.toggle('hidden', searchInput.value.length === 0);
    render(allData);
  });
  mainSearchClear.addEventListener('click', () => {
    searchInput.value = '';
    mainSearchClear.classList.add('hidden');
    searchInput.focus();
    render(allData);
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const firstCard = document.querySelector('.card') as HTMLElement;
      if (firstCard) {
        searchInput.blur();
        firstCard.click();
      }
    }
  });
  document.getElementById('modal-close')!.addEventListener('click', closeModal);
  modalEl.addEventListener('click', (e) => { if (e.target === modalEl) closeModal(); });

  // Clear Cache
  clearCacheBtn.addEventListener('click', async () => {
    if (confirm('Clear all cached data and reload?')) {
      await LocalCache.clear();
      window.location.reload();
    }
  });

  // Modal search logic
  let lastSearchResults: any[] = [];

  const updateSearchHighlight = () => {
    const items = modalSearchResults.querySelectorAll('.search-result-item');
    items.forEach((item, index) => {
      if (index === selectedSearchIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  };

  const handleModalSearch = () => {
    const query = modalSearch.value.toLowerCase().trim();
    if (!query) {
      modalSearchResults.classList.add('hidden');
      lastSearchResults = [];
      return;
    }

    const results = allData.filter(item => {
      const name = (item.name_loc || item.patch_name || item.name || '').toLowerCase();
      item._search_score = getSearchScore(name, query);
      return item._search_score > 0;
    }).sort((a, b) => {
      if (b._search_score !== a._search_score) return b._search_score - a._search_score;
      const nameA = (a.name_loc || a.patch_name || a.name || '').toLowerCase();
      const nameB = (b.name_loc || b.patch_name || b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    }).slice(0, 10);

    lastSearchResults = results;
    setSelectedSearchIndex(0);

    if (results.length === 0) {
      modalSearchResults.innerHTML = '<div class="search-result-item no-results">No matches found</div>';
    } else {
      modalSearchResults.innerHTML = results.map((item, index) => {
        let img = '';
        let meta = '';

        if (currentMode === 'heroes') {
          img = (api.constructor as any).urls.heroImage(item.name);
          const attrIcon = (api.constructor as any).urls.attributeIcon(item.primary_attr);
          meta = `<img src="${attrIcon}" class="result-meta-icon"> ${getAttributeName(item.primary_attr)}`;
        } else if (currentMode === 'items') {
          img = (api.constructor as any).urls.itemImage(item.name);
          const isNeutral = item.neutral_item_tier !== undefined && item.neutral_item_tier !== -1;
          if (isNeutral) {
            meta = `Tier ${item.neutral_item_tier + 1} Neutral`;
          } else {
            const goldIcon = (api.constructor as any).urls.ASSET_URLS.GOLD;
            meta = item.cost ? `<img src="${goldIcon}" class="result-meta-icon"> ${item.cost} Gold` : 'Free';
          }
        } else if (currentMode === 'patches') {
          meta = new Date(item.patch_timestamp * 1000).toLocaleDateString();
        }
        
        return `
          <div class="search-result-item ${index === 0 ? 'selected' : ''}" data-id="${item.id || item.patch_name}">
            ${img ? `<img src="${img}" class="result-icon">` : ''}
            <div class="result-info">
              <div class="result-text">${item.name_loc || item.patch_name || item.name}</div>
              <div class="result-meta">${meta}</div>
            </div>
          </div>
        `;
      }).join('');
    }

    modalSearchResults.classList.remove('hidden');

    modalSearchResults.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = (el as HTMLElement).dataset.id!;
        if (currentMode === 'heroes') showHeroDetails(parseInt(id));
        else if (currentMode === 'items') showItemDetails(parseInt(id));
        else if (currentMode === 'patches') showPatchDetails(id);
        modalSearch.value = '';
        modalSearchResults.classList.add('hidden');
      });
    });
  };

  const modalSearchClear = document.getElementById('modal-search-clear') as HTMLButtonElement;
  modalSearch.addEventListener('input', () => {
    modalSearchClear.classList.toggle('hidden', modalSearch.value.length === 0);
    debounce(handleModalSearch, 250)();
  });
  modalSearchClear.addEventListener('click', () => {
    modalSearch.value = '';
    modalSearchClear.classList.add('hidden');
    modalSearchResults.classList.add('hidden');
    modalSearch.focus();
  });

  // Shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl+K for focus
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (!modalEl.classList.contains('hidden')) {
        modalSearch.focus();
      } else {
        searchInput.focus();
      }
      return;
    }

    // Auto-focus modal search on typing
    const isModalOpen = !modalEl.classList.contains('hidden');
    const isSearchFocused = document.activeElement === modalSearch || document.activeElement === searchInput;

    if (!isSearchFocused && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (isModalOpen) {
        modalSearch.focus();
      } else {
        searchInput.focus();
      }
    }

    if (e.key === 'Escape') {
      if (isModalOpen) {
        closeModal();
      } else if (isSearchFocused) {
        if (searchInput.value) {
          searchInput.value = '';
          document.getElementById('main-search-clear')?.classList.add('hidden');
          render(allData);
        }
        (document.activeElement as HTMLElement).blur();
      }
      return;
    }

    if (isModalOpen) {
      if (isSearchFocused && !modalSearchResults.classList.contains('hidden') && lastSearchResults.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedSearchIndex((selectedSearchIndex + 1) % lastSearchResults.length);
          updateSearchHighlight();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedSearchIndex((selectedSearchIndex - 1 + lastSearchResults.length) % lastSearchResults.length);
          updateSearchHighlight();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const selected = lastSearchResults[selectedSearchIndex];
          if (selected) {
            if (currentMode === 'heroes') showHeroDetails(selected.id);
            else if (currentMode === 'items') showItemDetails(selected.id);
            else if (currentMode === 'patches') showPatchDetails(selected.patch_name);
            modalSearch.value = '';
            modalSearchResults.classList.add('hidden');
          }
        }
      } else if (!isSearchFocused) {
        // Navigation shortcuts - only if search is NOT focused
        if (currentHeroId !== null) {
          const currentIndex = allData.findIndex(h => h.id === currentHeroId);
          if (currentIndex === -1) return;

          if (e.key === 'ArrowLeft') {
            const prevIndex = (currentIndex - 1 + allData.length) % allData.length;
            showHeroDetails(allData[prevIndex].id);
          } else if (e.key === 'ArrowRight') {
            const nextIndex = (currentIndex + 1) % allData.length;
            showHeroDetails(allData[nextIndex].id);
          }
        } else if (currentItemId !== null) {
          const currentIndex = allData.findIndex(i => i.id === currentItemId);
          if (currentIndex === -1) return;

          if (e.key === 'ArrowLeft') {
            let prevIndex = (currentIndex - 1 + allData.length) % allData.length;
            while (allData[prevIndex].name?.includes('_recipe')) {
              prevIndex = (prevIndex - 1 + allData.length) % allData.length;
              if (prevIndex === currentIndex) break;
            }
            showItemDetails(allData[prevIndex].id);
          } else if (e.key === 'ArrowRight') {
            let nextIndex = (currentIndex + 1) % allData.length;
            while (allData[nextIndex].name?.includes('_recipe')) {
              nextIndex = (nextIndex + 1) % allData.length;
              if (nextIndex === currentIndex) break;
            }
            showItemDetails(allData[nextIndex].id);
          }
        } else if (currentPatchVersion !== null) {
          const currentIndex = allData.findIndex(p => p.patch_name === currentPatchVersion);
          if (currentIndex === -1) return;

          if (e.key === 'ArrowLeft') {
            const nextIndex = (currentIndex + 1) % allData.length;
            showPatchDetails(allData[nextIndex].patch_name);
          } else if (e.key === 'ArrowRight') {
            const prevIndex = (currentIndex - 1 + allData.length) % allData.length;
            showPatchDetails(allData[prevIndex].patch_name);
          }
        }
      }
    } else if (!isSearchFocused) {
      // Main page mode navigation
      const modes: ('heroes' | 'items' | 'patches')[] = ['heroes', 'items', 'patches'];
      const currentIndex = modes.indexOf(currentMode);

      if (e.key === 'ArrowRight') {
        const nextMode = modes[(currentIndex + 1) % modes.length];
        window.location.hash = nextMode;
      } else if (e.key === 'ArrowLeft') {
        const prevMode = modes[(currentIndex - 1 + modes.length) % modes.length];
        window.location.hash = prevMode;
      }
    }
  });

  // Initial routing
  const hash = window.location.hash.slice(1) as any;
  if (['heroes', 'items', 'patches'].includes(hash)) {
    setMode(hash);
  } else {
    window.location.hash = 'heroes';
    setMode('heroes');
  }
}

init();
