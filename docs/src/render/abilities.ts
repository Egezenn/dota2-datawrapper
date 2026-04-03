import { Dota2Datafeed } from '../../../src/client';
import type { DetailedAbility, DetailedHero } from '../../../src/types';
import { constantsAbilities, abilityLookup } from '../state';
import { getAbilityIconUrl } from '../utils';

export function renderAbilityMeta(cAbility: any) {
  const mana = Array.isArray(cAbility.mc) ? cAbility.mc.join(' / ') : cAbility.mc;
  const cooldown = Array.isArray(cAbility.cd) ? cAbility.cd.join(' / ') : cAbility.cd;
  
  if (!mana && !cooldown) return '';
  return `
    <div class="const-ability-meta">
      ${mana ? `
        <div class="const-ability-meta-item">
          <div class="mana-icon" style="width:10px;height:10px;background:#0097e6"></div>
          <span>${mana}</span>
        </div>
      ` : ''}
      ${cooldown ? `
        <div class="const-ability-meta-item">
          <img data-src="${Dota2Datafeed.urls.ASSET_URLS.COOLDOWN}" class="const-ability-meta-icon">
          <span>${cooldown}</span>
        </div>
      ` : ''}
    </div>
  `;
}

export function renderAbilityProperties(cAbility: any) {
  if (!cAbility.behavior && !cAbility.dmg_type && !cAbility.bkbpierce && !cAbility.dispellable) return '';
  const behaviorNames = cAbility.behavior ? Dota2Datafeed.utils.getAbilityBehaviorNames(cAbility.behavior) : [];
  
  return `
    <div class="const-ability-properties">
      ${behaviorNames.length > 0 ? `<div class="const-ability-prop">Ability:<span>${behaviorNames.join(', ')}</span></div>` : ''}
      ${cAbility.dmg_type ? `<div class="const-ability-prop">Damage:<span>${cAbility.dmg_type}</span></div>` : ''}
      ${cAbility.bkbpierce ? `<div class="const-ability-prop">Pierces BKB:<span>${cAbility.bkbpierce}</span></div>` : ''}
      ${cAbility.dispellable ? `<div class="const-ability-prop">Dispel:<span>${cAbility.dispellable}</span></div>` : ''}
    </div>
  `;
}

export function renderAbilityAttributes(cAbility: any, dAbility?: DetailedAbility) {
  if (!cAbility.attrib || cAbility.attrib.length === 0) return '';
  return `
    <div class="const-ability-attribs">
      ${cAbility.attrib.map((attr: any) => {
        const baseValue = Array.isArray(attr.value) ? attr.value.join(' / ') : attr.value;
        let bonusHtml = '';
        const sv = dAbility?.special_values.find(s => s.name === attr.key || s.name === attr.key.replace(/^bonus_/, ''));
        if (sv) {
          if (sv.values_scepter.length > 0 && JSON.stringify(sv.values_scepter) !== JSON.stringify(sv.values_float)) {
             const sValue = Array.isArray(sv.values_scepter) ? sv.values_scepter.join(' / ') : sv.values_scepter;
             bonusHtml += `<span class="const-ability-attrib-bonus scepter-bonus" title="Scepter Upgrade">+${sValue}</span>`;
          }
          if (sv.values_shard.length > 0 && JSON.stringify(sv.values_shard) !== JSON.stringify(sv.values_float)) {
             const sValue = Array.isArray(sv.values_shard) ? sv.values_shard.join(' / ') : sv.values_shard;
             bonusHtml += `<span class="const-ability-attrib-bonus shard-bonus" title="Shard Upgrade">+${sValue}</span>`;
          }
        }
        return `
          <div class="const-ability-attrib">
            <span class="const-ability-attrib-header">${attr.header || attr.key.replace(/_/g, ' ')}</span>
            <span class="const-ability-attrib-value">${baseValue}${bonusHtml}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

export function renderAbilityCard(nameOrAbility: string | DetailedAbility, hero: DetailedHero, options: { isAghs?: boolean, type?: 'scepter' | 'shard' | 'innate' } = {}) {
  if (!nameOrAbility) return '';
  const name = typeof nameOrAbility === 'string' ? nameOrAbility : (nameOrAbility as any).name;
  if (!name) return '';
  
  const dAbility = typeof nameOrAbility === 'string' ? hero.abilities.find((a: DetailedAbility) => a.name === name) : nameOrAbility;
  
  // Use dotaconstants if available, otherwise synthetic from Valve data
  const cAbility = constantsAbilities?.[name] || (dAbility ? {
    dname: dAbility.name_loc,
    desc: dAbility.desc_loc,
    lore: dAbility.lore_loc,
    cd: (dAbility.cooldowns && dAbility.cooldowns.length > 0 && Math.max(...dAbility.cooldowns) > 0) ? dAbility.cooldowns : null,
    mc: (dAbility.mana_costs && dAbility.mana_costs.length > 0 && Math.max(...dAbility.mana_costs) > 0) ? dAbility.mana_costs : null,
    behavior: dAbility.behavior,
    attrib: (dAbility.special_values || []).filter(sv => sv.heading_loc).map(sv => ({
      key: sv.name,
      header: sv.heading_loc,
      value: sv.values_float
    }))
  } : null);

  if (!cAbility) return '';

  const isInnate = dAbility?.ability_is_innate || options.type === 'innate' || (abilityLookup as any)[name]?.is_innate;
  const imgUrl = getAbilityIconUrl(name, dAbility);
  
  return `
    <div class="const-ability-entry ${options.isAghs ? 'aghs-mode' : ''} ${options.type || ''}">
      <div class="const-ability-header" style="flex-direction: column; align-items: flex-start; gap: 8px;">
        <div class="const-ability-header-top" style="display: flex; flex-direction: row; align-items: center; gap: 12px; width: 100%;">
          <div class="ability-icon-wrapper" style="width: 48px; height: 48px; position: relative; flex-shrink: 0; background: #000; border-radius: 4px;">
            <img data-src="${imgUrl}" class="const-ability-icon" loading="lazy"
                 style="width: 100%; height: 100%; border-radius: 4px; margin-bottom: 0;">
            ${isInnate ? '<span class="innate-tag" style="font-size: 8px; padding: 1px 3px;">Innate</span>' : ''}
          </div>
          <div class="const-ability-name" style="white-space: nowrap; text-overflow: ellipsis; flex: 1;" title="${cAbility.dname || name.replace(/_/g, ' ')}">${cAbility.dname || name.replace(/_/g, ' ')}</div>
        </div>
        <div class="const-ability-header-bottom">
          ${renderAbilityMeta(cAbility)}
        </div>
      </div>

      <div class="const-ability-main">
        <div class="const-ability-desc">
          <div style="margin-bottom: 8px;">${Dota2Datafeed.utils.formatAbilityText(cAbility.desc || '', dAbility?.special_values || [], hero, dAbility)}</div>
          ${renderAbilityProperties(cAbility)}
        </div>

        ${renderAbilityAttributes(cAbility, dAbility)}

        ${cAbility.lore ? `<div class="const-ability-lore" style="margin-top: 12px;">${cAbility.lore}</div>` : ''}
      </div>
    </div>
  `;
}

export function renderAghsAbilityCard(nameOrAbility: string | DetailedAbility, hero: DetailedHero, type: 'shard' | 'scepter' | 'other' = 'other') {
  if (!nameOrAbility) return '';
  const name = typeof nameOrAbility === 'string' ? nameOrAbility : (nameOrAbility as any).name;
  if (!name) return '';

  const aArr = typeof nameOrAbility === 'string' ? hero.abilities.find((abi: DetailedAbility) => abi.name === name) : nameOrAbility;
  
  const cAbility = constantsAbilities?.[name];
  // Synthetic ability if Valve data is missing but constants have it
  const a = aArr || (cAbility ? {
    name: name,
    name_loc: cAbility.dname || name.replace(/_/g, ' '),
    desc_loc: cAbility.desc || '',
    special_values: (cAbility.attrib || []).map((at: any) => ({
      name: at.key,
      heading_loc: at.header,
      values_float: Array.isArray(at.value) ? at.value : [at.value],
      values_shard: [],
      values_scepter: []
    })),
    cooldowns: [],
    mana_costs: [],
    ability_has_shard: false,
    ability_has_scepter: false,
    ability_is_granted_by_shard: false,
    ability_is_granted_by_scepter: false
  } as any as DetailedAbility : null);

  if (!a) return '';

  const isGranted = type === 'shard' ? a.ability_is_granted_by_shard : (type === 'scepter' ? a.ability_is_granted_by_scepter : (a.ability_is_granted_by_shard || a.ability_is_granted_by_scepter));
  
  if (isGranted) {
    return renderAbilityCard(a, hero, { isAghs: true, type: type !== 'other' ? type : undefined });
  }

  const imgUrl = getAbilityIconUrl(a.name, a);
  
  let upgradeText = '';
  if (type === 'shard') upgradeText = a.shard_loc;
  else if (type === 'scepter') upgradeText = a.scepter_loc;
  else {
    if (a.ability_has_shard && a.shard_loc) upgradeText += `<div class="upgrade-section shard">${Dota2Datafeed.utils.formatAbilityText(a.shard_loc, a.special_values, hero, a, 'shard')}</div>`;
    if (a.ability_has_scepter && a.scepter_loc) upgradeText += `<div class="upgrade-section scepter">${Dota2Datafeed.utils.formatAbilityText(a.scepter_loc, a.special_values, hero, a, 'scepter')}</div>`;
  }

  return `
    <div class="aghs-card ${type !== 'other' ? type : (a.ability_has_shard ? 'shard' : 'scepter')}">
      <div class="aghs-left" style="width: auto; flex-shrink: 0; padding-right: 0; min-width: 140px;">
        <div class="const-ability-header" style="flex-direction: row; align-items: center; gap: 12px; margin-bottom: 0;">
          <div class="ability-icon-wrapper" style="width: 48px; height: 48px; position: relative; flex-shrink: 0; background: #000; border-radius: 4px;">
            <img data-src="${imgUrl}" 
                 style="width: 100%; height: 100%; border-radius: 4px; margin-bottom: 0;">
          </div>
          <div class="const-ability-name" style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden; flex: 1; text-align: left; font-size: 14px; font-weight: 600;">${a.name_loc || a.name.replace(/_/g, ' ')}</div>
        </div>
      </div>
      <div class="aghs-right" style="padding-left: 12px; flex: 1; border-left: 1px solid rgba(255,255,255,0.05); margin-left: 12px;">
        <div class="aghs-desc" style="font-size: 13px; margin: 0; line-height: 1.5; color: #ccc;">
          ${Dota2Datafeed.utils.formatAbilityText(upgradeText || a.desc_loc, a.special_values, hero, a, type !== 'other' ? type : undefined)}
        </div>
      </div>
    </div>
  `;
}

export function renderHeroAbilities(hero: DetailedHero) {
  const cHeroAbilities: string[] = (abilityLookup as any)[hero.name]?.abilities || (abilityLookup as any)[Dota2Datafeed.utils.normalizeHeroName(hero.name)]?.abilities || [];
  const cAghs = (abilityLookup as any)[hero.name]?.aghs || (abilityLookup as any)[Dota2Datafeed.utils.normalizeHeroName(hero.name)]?.aghs || null;
  const getUpgradedAbilities = (type: 'shard' | 'scepter') => {
    return hero.abilities.filter(a => {
      const primaryName = type === 'shard' ? cAghs?.shard_skill_name : cAghs?.scepter_skill_name;
      const matchesName = primaryName && (a.name_loc === primaryName || a.name === primaryName || a.name === primaryName.toLowerCase().replace(/ /g, '_'));
      const hasFlag = type === 'shard' ? a.ability_has_shard : a.ability_has_scepter;
      const isGranted = type === 'shard' ? a.ability_is_granted_by_shard : a.ability_is_granted_by_scepter;
      return !!(matchesName || hasFlag || isGranted);
    });
  };
  
  const shardAbilities = getUpgradedAbilities('shard');
  const scepterAbilities = getUpgradedAbilities('scepter');
  const allAghsNames = Array.from(new Set([...shardAbilities, ...scepterAbilities].map(a => a.name)));
  
  // 1. Innate Abilities
  const innateAbilities = hero.abilities.filter(a => a.ability_is_innate);
  const innateNames = innateAbilities.map(a => a.name);

  let primaryAbilityNames = cHeroAbilities.filter((name: string) => {
    if (name === 'generic_hidden') return false;
    const dAbility = hero.abilities.find(ab => ab.name === name);
    if (dAbility && (dAbility.ability_is_granted_by_shard || dAbility.ability_is_granted_by_scepter)) return false;
    
    const lookup = (abilityLookup as any)[name];
    if (lookup && !lookup.has_icon && !lookup.is_innate) return false;
    return true;
  });

  // Fallback if dotaconstants list is empty or insufficient
  if (primaryAbilityNames.length === 0) {
    primaryAbilityNames = hero.abilities
      .filter(a => !a.ability_is_innate && !a.ability_is_granted_by_shard && !a.ability_is_granted_by_scepter && a.id > 0 && a.name_loc)
      .map(a => a.name)
      .slice(0, 6); // Pick first 6 primary-looking abilities
  }

  // Prepend innates to primary
  const finalPrimaryNames = Array.from(new Set([...innateNames, ...primaryAbilityNames]));

  // 2. Extra Abilities
  const combinedAbilityNames = Array.from(new Set([
    ...hero.abilities.map(a => a.name),
    ...cHeroAbilities
  ]));

  const otherAbilityNames = combinedAbilityNames.filter(name => {
    if (name === 'generic_hidden') return false;
    if (finalPrimaryNames.includes(name)) return false;
    if (allAghsNames.includes(name)) return false;
    return !!(constantsAbilities?.[name] || hero.abilities.find(a => a.name === name));
  });

  const primarySection = `
    <div class="abilities-section">
      <h3>Primary Abilities ${primaryAbilityNames.length === 0 ? '<span style="font-size: 12px; color: #666">(Dynamic fallback)</span>' : ''}</h3>
      <div class="constants-abilities-grid" style="grid-template-columns: repeat(${Math.min(finalPrimaryNames.length || 1, 6)}, 1fr);">
        ${finalPrimaryNames.map((name: string) => renderAbilityCard(name, hero)).join('')}
      </div>
    </div>
  `;

  const aghsSection = (shardAbilities.length > 0 || scepterAbilities.length > 0) ? `
    <div class="aghanims-section">
      <h3>Aghanim's Corner</h3>
      <div class="aghs-grid">
         <div class="aghs-column shard">
          ${shardAbilities.map(a => renderAghsAbilityCard(a, hero, 'shard')).join('')}
        </div>
        <div class="aghs-column scepter">
          ${scepterAbilities.map(a => renderAghsAbilityCard(a, hero, 'scepter')).join('')}
        </div>
      </div>
    </div>
  ` : '';

  const otherSection = otherAbilityNames.length > 0 ? `
    <div class="aghanims-section other-abilities-section" style="margin-top: 40px">
      <h3>Other Abilities</h3>
      <div class="aghs-grid" style="grid-template-columns: repeat(${Math.min(otherAbilityNames.length, 2)}, 1fr);">
        ${otherAbilityNames.map(name => renderAghsAbilityCard(name, hero, 'other')).join('')}
      </div>
    </div>
  ` : '';

  return primarySection + aghsSection + otherSection;
}
