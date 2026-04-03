import { 
  api, modalBody, modalEl, constantsHeroes, constantsItems, constantsAbilities, abilityLookup, constantsAbilityIds, valveHeroes, valveItems,
  setPatchVersion, setHeroId, setItemId
} from '../state';
import { LocalCache } from '../cache';
import { Dota2Datafeed } from '@core/client';
import { processImages } from '../utils';
import { ensureConstants } from '../data';

export async function showPatchDetails(version: string) {
  setPatchVersion(version);
  setHeroId(null);
  setItemId(null);
  
  modalBody.innerHTML = '<div class="loader"></div>';
  modalEl.classList.remove('hidden');
  document.body.classList.add('no-scroll');
  
  try {
    await ensureConstants();
    const patch = await LocalCache.getOrFetch(`patch_${version}`, () => api.getPatchNotes(version));
    
    let html = `
      <div class="patch-details-container">
        <div class="patch-header">
          <h2>Patch ${patch.patch_name}</h2>
          <div class="patch-date">${new Date(patch.patch_timestamp * 1000).toLocaleDateString()}</div>
        </div>
    `;

    // 1. General Notes
    if (patch.general_notes && patch.general_notes.length > 0) {
      html += `
        <div class="patch-section">
          <h3>General Notes</h3>
          <div class="patch-notes-list">
            ${patch.general_notes.map((gn: any) => `
              <div class="general-note-group">
                ${gn.title ? `<h4>${gn.title}</h4>` : ''}
                ${gn.generic.map((n: any) => {
                  const isBr = n.note.trim() === '<br>' || n.note.trim() === '';
                  const cls = isBr ? '' : `patch-note-item patch-note-indent-${n.indent_level || 1}`;
                  return `<div class="${cls}">${n.note}</div>`;
                }).join('')}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 2. Items
    if ((patch.items && patch.items.length > 0) || (patch.neutral_items && patch.neutral_items.length > 0)) {
      html += `
        <div class="patch-section">
          <h3>Items & Neutrals</h3>
          <div class="items-changes">
            ${[...(patch.items || []), ...(patch.neutral_items || [])].map((itemChange: any) => {
              const abId = Number(itemChange.ability_id);
              let internalName = constantsAbilityIds?.[abId] || '';
              let item: any = null;

              if (internalName) {
                // Remove item_ prefix to check keys in constants
                const cleanKey = internalName.replace('item_', '');
                item = constantsItems?.[cleanKey] || constantsItems?.[internalName];
              }

              // Fallback: search by ID in constants
              if (!item && constantsItems) {
                const entry = Object.entries(constantsItems).find(([_, data]: [string, any]) => data.id === abId);
                if (entry) {
                  internalName = entry[0];
                  item = entry[1];
                }
              }

              // Fallback: Valve data
              if (!item && valveItems) {
                item = valveItems.find((i: any) => i.id === abId);
                if (item) internalName = internalName || item.name;
              }

              const itemName = item?.dname || item?.name_loc || item?.name_english_loc || internalName || itemChange.title;
              const imgUrl = internalName ? Dota2Datafeed.urls.itemImage(internalName.replace('item_', '').replace('recipe_', '')) : '';
              
              return `
                <div class="change-item">
                  ${imgUrl ? `<img data-src="${imgUrl}" class="change-icon">` : ''}
                  <div class="change-content">
                    <div class="change-title">${itemName || 'Various Changes'}</div>
                    <div class="change-notes">
                      ${itemChange.ability_notes?.map((n: any) => {
                        const isBr = n.note.trim() === '<br>' || n.note.trim() === '';
                        const cls = isBr ? '' : `patch-note-item patch-note-indent-${n.indent_level || 1}`;
                        return `<div class="${cls}">${n.note}</div>`;
                      }).join('') || ''}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // 3. Heroes
    if (patch.heroes && patch.heroes.length > 0) {
      html += `
        <div class="patch-section">
          <h3>Heroes</h3>
          <div class="heroes-changes">
            ${patch.heroes.map((heroChange: any) => {
              const hero = (constantsHeroes ? constantsHeroes[heroChange.hero_id] : null) || 
                           valveHeroes?.find((h: any) => h.id === heroChange.hero_id);
              
              const heroName = hero?.localized_name || hero?.name_loc || hero?.name_english_loc || 'Unknown Hero';
              const internalName = hero?.name || '';
              const heroIconUrl = internalName ? Dota2Datafeed.urls.heroImage(internalName.replace('npc_dota_hero_', '')) : '';
              
              return `
                <div class="change-item">
                  ${heroIconUrl ? `<img data-src="${heroIconUrl}" class="change-icon">` : ''}
                  <div class="change-content">
                    <div class="change-title">${heroName}</div>
                    
                    ${heroChange.hero_notes?.length ? `
                      <div class="hero-general-notes">
                        ${heroChange.hero_notes.map((n: any) => {
                          const isBr = n.note.trim() === '<br>' || n.note.trim() === '';
                          const cls = isBr ? '' : `patch-note-item patch-note-indent-${n.indent_level || 1}`;
                          return `<div class="${cls}">${n.note}</div>`;
                        }).join('')}
                      </div>
                    ` : ''}

                    ${heroChange.abilities?.map((ab: any) => {
                      const abId = Number(ab.ability_id);
                      let internalName = constantsAbilityIds?.[abId] || '';
                      
                      if (!internalName && abilityLookup) {
                        const entry = Object.entries(abilityLookup).find(([_, data]: any) => Number(data.id) === abId);
                        if (entry) internalName = entry[0];
                      }

                      const ability = internalName ? constantsAbilities?.[internalName] : null;
                      let abilityName = ability?.dname || ability?.name;
                      
                      if (!abilityName && abilityLookup && internalName) {
                        abilityName = abilityLookup[internalName]?.dname;
                      }
                      
                      if (!abilityName) abilityName = ab.title || `Ability ${abId}`;

                      const abLookup = abilityLookup?.[internalName];
                      let abIcon = (internalName && abLookup?.has_icon !== false) ? Dota2Datafeed.urls.abilityImage(internalName) : '';

                      // Fallback to generic innate icon if specific icon is missing and it's an innate
                      if (!abIcon && abLookup?.is_innate) {
                        abIcon = Dota2Datafeed.urls.ASSET_URLS.INNATE_ICON;
                      }

                      return `
                        <div class="ability-change" style="margin-top: 10px;">
                          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                            ${abIcon ? `<img data-src="${abIcon}" style="width: 32px; height: auto; border-radius: 4px;">` : ''}
                            <div class="patch-note-item patch-note-title" style="font-weight: 500; color: var(--gold); margin-bottom: 0;">${abilityName}:</div>
                          </div>
                          ${ab.ability_notes.map((n: any) => {
                            const isBr = n.note.trim() === '<br>' || n.note.trim() === '';
                            const cls = isBr ? '' : `patch-note-item patch-note-indent-${n.indent_level || 1}`;
                            return `<div class="${cls}">${n.note}</div>`;
                          }).join('')}
                        </div>
                      `;
                    }).join('') || ''}

                    ${heroChange.talent_notes?.length ? `
                      <div class="talent-notes">
                        <div class="talent-title">Talent Changes</div>
                        ${heroChange.talent_notes.map((n: any) => {
                          const isBr = n.note.trim() === '<br>' || n.note.trim() === '';
                          const cls = isBr ? '' : `patch-note-item patch-note-indent-${n.indent_level || 1}`;
                          return `<div class="${cls}">${n.note}</div>`;
                        }).join('')}
                      </div>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    html += `</div>`;
    modalBody.innerHTML = html;
    processImages(modalBody);
  } catch (err) {
    console.error(err);
    modalBody.innerHTML = 'Error loading details.';
  }
}
