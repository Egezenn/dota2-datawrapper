import { Dota2Datafeed } from '@core/client';
import { contentEl, currentMode, currentHeroCategory, currentCategory, searchInput } from '../state';
import { getAttributeName, loadCachedImg } from '../utils';
import { renderPatchesGraph } from './patches-graph';

export function render(data: any[]) {
  contentEl.innerHTML = '';

  if (currentMode === 'patches') {
    renderPatchesGraph(data);
    return;
  }
  
  const filtered = data.filter(item => {
    // Hero attribute filtering
    if (currentMode === 'heroes' && currentHeroCategory !== 'all') {
      if (item.primary_attr !== parseInt(currentHeroCategory)) return false;
    }

    // Hide recipes from the main list
    if (currentMode === 'items' && item.name?.includes('_recipe')) return false;

    // Category filtering
    if (currentMode === 'items' && currentCategory !== 'all') {
      const isNeutral = item.neutral_item_tier !== undefined && item.neutral_item_tier !== -1;
      const isEnhancement = item.name?.startsWith('item_enhancement_');

      if (currentCategory === 'normal') {
        if (isNeutral || isEnhancement || item.cost === 0 || item.cost === null || item.cost === undefined) return false;
      }
      else if (currentCategory === 'zero') {
        if (item.cost !== 0 || isNeutral || isEnhancement) return false;
      }
      else if (currentCategory === 'neutral1') { if (item.neutral_item_tier !== 0) return false; }
      else if (currentCategory === 'neutral2') { if (item.neutral_item_tier !== 1) return false; }
      else if (currentCategory === 'neutral3') { if (item.neutral_item_tier !== 2) return false; }
      else if (currentCategory === 'neutral4') { if (item.neutral_item_tier !== 3) return false; }
      else if (currentCategory === 'neutral5') { if (item.neutral_item_tier !== 4) return false; }
      else if (currentCategory === 'enhancements') { if (!item.name?.startsWith('item_enhancement_')) return false; }
      else if (currentCategory === 'null') { if (item.cost !== null && item.cost !== undefined) return false; }
    }

    const query = searchInput.value.toLowerCase();
    const name = (item.name_loc || item.patch_name || item.name || '').toLowerCase();
    return name.includes(query);
  });

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    
    if (currentMode === 'heroes') {
      const imgUrl = Dota2Datafeed.urls.heroImage(item.name);
      card.innerHTML = `
        <div class="card-img-wrapper"><img alt="${item.name_loc}" loading="lazy"></div>
        <div class="card-info">
          <div class="card-name">${item.name_loc}</div>
          <div class="card-attr">
            <img src="${Dota2Datafeed.urls.attributeIcon(item.primary_attr)}" class="inline-icon">
            ${getAttributeName(item.primary_attr)}
          </div>
        </div>
      `;
      loadCachedImg(card.querySelector('img')!, imgUrl);
      card.addEventListener('click', () => (window as any).showHeroDetails(item.id));
    } else if (currentMode === 'items') {
      const imgUrl = Dota2Datafeed.urls.itemImage(item.name);
      const isNeutral = item.neutral_item_tier !== -1;
      const isEnhancement = item.name.startsWith('item_enhancement_');
      card.innerHTML = `
        <div class="card-img-wrapper">
          <img alt="${item.name_loc}" loading="lazy" style="object-fit: contain; padding: 10px;">
          ${isNeutral ? `<div class="tier-badge">Tier ${item.neutral_item_tier + 1}</div>` : ''}
          ${isEnhancement ? `<div class="tier-badge" style="background: var(--primary)">ENHANCEMENT</div>` : ''}
        </div>
        <div class="card-info">
          <div class="card-name">${item.dname || item.name_loc}</div>
          <div class="card-attr">
            ${isNeutral ? 'Neutral Item' : (isEnhancement ? 'Enhancement' : `
              <img src="${Dota2Datafeed.urls.ASSET_URLS.GOLD}" class="inline-icon">
              ${item.cost} Gold
            `)}
          </div>
        </div>
      `;
      loadCachedImg(card.querySelector('img')!, imgUrl);
      card.addEventListener('click', () => (window as any).showItemDetails(item.id));
    } else if (currentMode === 'patches') {
      card.style.height = 'auto';
      card.innerHTML = `
        <div class="card-info">
          <div class="card-name" style="font-size: 1.2rem; color: var(--gold)">${item.patch_name}</div>
          <div class="card-attr">${new Date(item.patch_timestamp * 1000).toLocaleDateString()}</div>
        </div>
      `;
      card.addEventListener('click', () => (window as any).showPatchDetails(item.patch_name));
    }
    
    contentEl.appendChild(card);
  });
}
