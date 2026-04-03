import { Dota2Datafeed } from '../../../src/client';
import { modalBody, allData } from '../state';
import { processImages } from '../utils';

export function renderItemDetails(item: any) {
  const urls = Dota2Datafeed.urls.ASSET_URLS;
  const isRecipe = item.name.includes('_recipe');
  const recipeClass = isRecipe ? 'item-component-recipe' : '';
  
  // Extract components/buildup early for cleaner structure
  const items = allData;
  const isCurrentRecipe = item.name.includes('_recipe');
  const recipeItem = isCurrentRecipe ? item : items.find((i: any) => i.name === `item_recipe_${item.name.replace('item_', '')}`);
  
  // 1. Get components from Valve's recipe (IDs) OR dotaconstants' components (Names)
  const valveComponentIds = recipeItem?.recipes?.[0]?.items || [];
  const constantComponentNames = item.components || [];

  // 2. Calculate upgrades (Buildup) checking both recipes and components
  const upgradeItems = items.filter((i: any) => {
    if (i.id === item.id) return false;
    // Exclude recipe items from showing up in buildup
    if (i.name.includes('_recipe')) return false;

    // Valve's recipe check (ID based)
    if (i.recipes?.[0]?.items?.includes(item.id)) return true;
    // dotaconstants' components check (Name based)
    if (i.components?.includes(item.name) || i.components?.includes(item.name.replace('item_', ''))) return true;
    return false;
  }).filter(Boolean);

  const hasDescription = (item.abilities && item.abilities.length > 0) || (item.desc_loc && item.desc_loc.trim().length > 0);

  modalBody.innerHTML = `
    <div class="item-details hero-details ${recipeClass}">
      <div class="item-details-layout">
        <!-- LEFT COLUMN: Identity & Relations -->
        <div class="item-details-left">
           <img data-src="${Dota2Datafeed.urls.itemImage(item.name)}" class="hero-main-img">
           <div class="hero-title" style="text-align: center; width: 100%;">
             <h2 style="margin-bottom: 10px">${item.dname || item.name_loc}</h2>
             
             ${item.behavior || item.dmg_type ? `
               <div class="const-ability-meta" style="justify-content: center; margin-bottom: 15px; opacity: 0.8">
                 ${item.behavior ? `
                   <div class="const-ability-meta-item" style="font-size: 10px">
                     <span style="color: var(--text-muted)">BEHAVIOR:</span>
                     <span style="color: white">${item.behavior}</span>
                   </div>
                 ` : ''}
                 ${item.dmg_type ? `
                   <div class="const-ability-meta-item" style="font-size: 10px">
                     <span style="color: var(--text-muted)">DAMAGE TYPE:</span>
                     <span style="color: white">${item.dmg_type}</span>
                   </div>
                 ` : ''}
               </div>
             ` : ''}

             <div class="hero-meta" style="justify-content: center">
               ${item.neutral_item_tier !== undefined && item.neutral_item_tier !== -1 ? `
                 <span class="meta-text" style="color: var(--secondary); font-size: 1.2rem; font-weight: bold; background: rgba(212, 179, 112, 0.1); padding: 4px 12px; border-radius: 4px; border: 1px solid var(--secondary);">
                   TIER ${item.neutral_item_tier + 1} NEUTRAL
                 </span>
               ` : item.name.startsWith('item_enhancement_') ? `
                 <span class="meta-text" style="color: var(--primary); font-size: 1.2rem; font-weight: bold; background: rgba(194, 62, 62, 0.1); padding: 4px 12px; border-radius: 4px; border: 1px solid var(--primary);">
                   ENHANCEMENT
                 </span>
               ` : `
                 <span class="meta-text" style="color: var(--gold); font-size: 1.2rem">
                   <img data-src="${urls.GOLD}" class="meta-icon">
                   ${item.cost}
                 </span>
               `}
             </div>
             
             ${item.cd || item.mc ? `
               <div class="const-ability-meta" style="justify-content: center; margin-top: 15px">
                 ${item.mc ? `
                   <div class="const-ability-meta-item">
                     <div class="mana-icon" style="width:12px;height:12px;background:#0097e6"></div>
                     <span>${item.mc}</span>
                   </div>
                 ` : ''}
                 ${item.cd ? `
                   <div class="const-ability-meta-item">
                     <img data-src="${Dota2Datafeed.urls.ASSET_URLS.COOLDOWN}" class="const-ability-meta-icon">
                     <span>${item.cd}</span>
                   </div>
                 ` : ''}
               </div>
             ` : ''}
           </div>

           ${(valveComponentIds.length > 0 || constantComponentNames.length > 0) ? `
             <div class="item-relations-group" style="margin-top: 20px">
               <h3 style="font-size: 14px; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px; margin-bottom: 15px">Components</h3>
               <div class="item-components-grid">
                 ${(() => {
                   const componentMap = new Map<string, any>();
                   
                   if (isCurrentRecipe) {
                     const finalItemName = item.name.replace('item_recipe_', 'item_');
                     const finalItem = items.find((i: any) => i.name === finalItemName);
                     if (finalItem) componentMap.set(finalItem.name, finalItem);
                   } else {
                     // Add Valve components (ID based)
                     valveComponentIds.forEach((id: number) => {
                       const found = items.find((i: any) => i.id === id);
                       if (found) componentMap.set(found.name, found);
                     });
                     
                     // Add constant components (Name based)
                     constantComponentNames.forEach((name: string) => {
                       const key = name.startsWith('item_') ? name : `item_${name}`;
                       const found = items.find((i: any) => i.name === key || i.name === name);
                       if (found) componentMap.set(found.name, found);
                     });

                     if (recipeItem && !componentMap.has(recipeItem.name)) {
                       componentMap.set(recipeItem.name, recipeItem);
                     }
                   }
                   
                   return Array.from(componentMap.values()).map((comp: any) => `
                     <div class="item-component-card ${comp.name.includes('_recipe') ? 'item-component-recipe' : ''}" onclick="window.showItemDetailsByName('${comp.name}')">
                       <img data-src="${Dota2Datafeed.urls.itemImage(comp.name)}">
                       <div class="item-component-name">${comp.name_loc || comp.name.replace('item_', '').replace(/_/g, ' ')}</div>
                       ${comp.cost ? `<div class="item-component-cost"><img data-src="${urls.GOLD}">${comp.cost}</div>` : ''}
                     </div>
                   `).join('');
                 })()}
               </div>
             </div>
           ` : ''}

           ${upgradeItems.length > 0 ? `
             <div class="item-relations-group" style="margin-top: 20px">
               <h3 style="font-size: 14px; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px; margin-bottom: 15px">Buildup</h3>
               <div class="item-components-grid">
                 ${upgradeItems.map((upg: any) => `
                   <div class="item-component-card" onclick="window.showItemDetailsByName('${upg.name}')">
                     <img data-src="${Dota2Datafeed.urls.itemImage(upg.name)}">
                     <div class="item-component-name">${upg.name_loc || upg.name.replace('item_', '').replace(/_/g, ' ')}</div>
                     ${upg.cost ? `<div class="item-component-cost"><img data-src="${urls.GOLD}">${upg.cost}</div>` : ''}
                   </div>
                 `).join('')}
               </div>
             </div>
           ` : ''}
        </div>

        <!-- RIGHT COLUMN: Stats & Abilities -->
        <div class="item-details-right">
          ${(item.attrib || item.attributes) ? `
            <div class="stats-card-group">
               <h3 style="font-size: 18px; color: var(--secondary); margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;">Attributes</h3>
               <div class="ability-special-values" style="background: none; padding: 0">
                 ${(item.attrib || item.attributes).map((attr: any) => {
                   const label = attr.display ? attr.display.replace('{value}', '').replace('+', '').trim() : (attr.header || attr.key.replace(/_/g, ' '));
                   const value = attr.value;
                   return `
                     <div class="special-value-row">
                       <span class="special-value-label">${label}</span>
                       <span class="special-value-amount">${attr.display && attr.display.includes('+') ? '+' : ''}${value}</span>
                     </div>
                   `;
                 }).join('')}
               </div>
            </div>
          ` : ''}

          ${hasDescription ? `
            <div class="description-card-group">
               <h3 style="font-size: 18px; color: var(--secondary); margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;">Description</h3>
               <div class="ability-description" style="font-size: 16px; line-height: 1.5; color: #ccc; padding: 0; border: none">
                 ${(() => {
                   if (item.abilities && item.abilities.length > 0) {
                     return item.abilities.map((a: any) => `
                       <div style="margin-bottom: 12px">
                         <strong style="color: var(--secondary); text-transform: uppercase; font-size: 14px">${a.type} ${a.title ? `- ${a.title}` : ''}</strong>
                         <div style="margin-top: 4px">${a.description}</div>
                       </div>
                     `).join('');
                   }
                   return Dota2Datafeed.utils.formatAbilityText(item.desc_loc, item.special_values);
                 })()}
               </div>
               
               ${(item.notes_loc && item.notes_loc.length > 0) || item.notes ? `
                 <div class="item-notes" style="margin-top: 15px; background: rgba(255,255,255,0.02); border-left: 2px solid var(--text-muted)">
                    ${item.notes_loc ? item.notes_loc.map((note: string) => `<div>• ${note}</div>`).join('') : ''}
                    ${item.notes ? `<div>• ${item.notes}</div>` : ''}
                 </div>
               ` : ''}
            </div>
          ` : ''}

          ${(item.lore || item.lore_loc) ? `
            <div class="ability-lore" style="opacity: 0.6; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; margin-top: auto">
              ${item.lore || item.lore_loc}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
  processImages(modalBody);
}
