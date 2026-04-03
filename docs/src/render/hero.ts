import { Dota2Datafeed } from '../../../src/client';
import type { DetailedHero } from '../../../src/types';
import { modalBody, constantsHeroes } from '../state';
import { getAttributeName, processImages } from '../utils';
import { renderHeroAbilities } from './abilities';

export function renderHeroDetails(hero: DetailedHero) {
  const attackType = hero.attack_capability === 1 ? 'melee' : 'ranged';
  const urls = Dota2Datafeed.urls.ASSET_URLS;

  // Enhance with dotaconstants
  const cHero = constantsHeroes?.[hero.id] || constantsHeroes?.[Dota2Datafeed.utils.normalizeHeroName(hero.name)];

  const strGain = cHero?.str_gain || hero.str_gain;
  const agiGain = cHero?.agi_gain || hero.agi_gain;
  const intGain = cHero?.int_gain || hero.int_gain;

  modalBody.innerHTML = `
    <div class="hero-details">
      <div class="top-section">
        <div class="hero-header">
          <img data-src="${Dota2Datafeed.urls.heroImage(hero.name)}" class="hero-main-img">
          <div class="hero-title">
            <h2>${hero.name_loc}</h2>
            <div class="hero-meta">
              <span class="meta-text">
                <img data-src="${Dota2Datafeed.urls.attributeIcon(hero.primary_attr)}" class="attr-icon">
                ${getAttributeName(hero.primary_attr)}
              </span>
              <span class="separator">|</span>
              <span class="meta-text">
                <img data-src="${urls.ATTACK_TYPE_ICON(attackType)}" class="meta-icon">
                ${attackType}
              </span>
              <span class="separator">|</span>
              <span class="meta-text">Complexity ${'★'.repeat(hero.complexity)}${'☆'.repeat(3-hero.complexity)}</span>
            </div>
          </div>
        </div>

        <div class="stats-condensed-section">
          <h3>Statistics</h3>
          <div class="stats-condensed">
            <!-- Attributes & Vitals -->
            <div class="condensed-row">
              <div class="condensed-group">
                <span class="condensed-label">Attributes</span>
                <span class="condensed-value">
                  <span class="str" style="color: var(--str-color)">${hero.str_base}<span class="gain">+${strGain}</span></span>
                  <span class="agi" style="color: var(--agi-color); margin: 0 10px">${hero.agi_base}<span class="gain">+${agiGain}</span></span>
                  <span class="int" style="color: var(--int-color)">${hero.int_base}<span class="gain">+${intGain}</span></span>
                </span>
              </div>
            </div>

            <div class="condensed-vitals">
              <div class="vital-pill health">HP: ${hero.max_health} +${hero.health_regen.toFixed(1)}</div>
              <div class="vital-pill mana">MP: ${hero.max_mana} +${hero.mana_regen.toFixed(1)}</div>
            </div>

            <!-- Attack & Defense -->
            <div class="condensed-row">
              <div class="condensed-group">
                <span class="condensed-label">Attack</span>
                <span class="condensed-value">
                  <img data-src="${urls.STAT_ICON('damage')}" class="stat-icon-img"> ${hero.damage_min}-${hero.damage_max}
                  <img data-src="${urls.STAT_ICON('attack_range')}" class="stat-icon-img" style="margin-left: 10px"> ${hero.attack_range}
                  <img data-src="${urls.STAT_ICON('attack_time')}" class="stat-icon-img" style="margin-left: 10px"> ${hero.attack_rate}
                </span>
              </div>
              <div class="condensed-group">
                <span class="condensed-label">Defense</span>
                <span class="condensed-value">
                  <img data-src="${urls.STAT_ICON('armor')}" class="stat-icon-img"> ${hero.armor.toFixed(1)}
                  <img data-src="${urls.STAT_ICON('magic_resist')}" class="stat-icon-img" style="margin-left: 10px"> ${hero.magic_resistance}%
                </span>
              </div>
            </div>

            <!-- Mobility & Vision -->
            <div class="condensed-row">
              <div class="condensed-group">
                <span class="condensed-label">Mobility</span>
                <span class="condensed-value">
                  <img data-src="${urls.STAT_ICON('movement_speed')}" class="stat-icon-img"> ${hero.movement_speed}
                  <img data-src="${urls.STAT_ICON('turn_rate')}" class="stat-icon-img" style="margin-left: 10px"> ${hero.turn_rate}
                </span>
              </div>
              <div class="condensed-group">
                <span class="condensed-label">Vision</span>
                <span class="condensed-value">
                  <img data-src="${urls.STAT_ICON('vision')}" class="stat-icon-img"> ${hero.sight_range_day} / ${hero.sight_range_night}
                </span>
              </div>
            </div>

            <!-- Roles -->
            <div class="condensed-row">
              <div class="condensed-group" style="width: 100%">
                <span class="condensed-label">Roles</span>
                <div class="roles-condensed">
                  ${hero.role_levels.map((level: number, i: number) => level > 0 ? `
                    <div class="role-pill">
                      ${Dota2Datafeed.utils.ROLE_NAMES[i]}
                      <div class="role-vbar"><div class="role-vfill" style="width: ${(level/3)*100}%"></div></div>
                    </div>
                  ` : '').join('')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="talents-section">
          <h3>Talents</h3>
          <div class="talents-grid">
            <div class="talent-row"><div class="talent-left">${Dota2Datafeed.utils.formatAbilityText(hero.talents[7].name_loc, hero.talents[7].special_values, hero, hero.talents[7])}</div><div class="talent-level">25</div><div class="talent-right">${Dota2Datafeed.utils.formatAbilityText(hero.talents[6].name_loc, hero.talents[6].special_values, hero, hero.talents[6])}</div></div>
            <div class="talent-row"><div class="talent-left">${Dota2Datafeed.utils.formatAbilityText(hero.talents[5].name_loc, hero.talents[5].special_values, hero, hero.talents[5])}</div><div class="talent-level">20</div><div class="talent-right">${Dota2Datafeed.utils.formatAbilityText(hero.talents[4].name_loc, hero.talents[4].special_values, hero, hero.talents[4])}</div></div>
            <div class="talent-row"><div class="talent-left">${Dota2Datafeed.utils.formatAbilityText(hero.talents[3].name_loc, hero.talents[3].special_values, hero, hero.talents[3])}</div><div class="talent-level">15</div><div class="talent-right">${Dota2Datafeed.utils.formatAbilityText(hero.talents[2].name_loc, hero.talents[2].special_values, hero, hero.talents[2])}</div></div>
            <div class="talent-row"><div class="talent-left">${Dota2Datafeed.utils.formatAbilityText(hero.talents[1].name_loc, hero.talents[1].special_values, hero, hero.talents[1])}</div><div class="talent-level">10</div><div class="talent-right">${Dota2Datafeed.utils.formatAbilityText(hero.talents[0].name_loc, hero.talents[0].special_values, hero, hero.talents[0])}</div></div>
          </div>
        </div>
      </div>

      ${renderHeroAbilities(hero)}

      <p class="hero-hype">${hero.hype_loc}</p>

      <div class="hero-bio-section" id="bio-section">
        <button class="hero-bio-toggle" onclick="document.getElementById('bio-section').classList.toggle('expanded')">
          Biography
          <span class="toggle-icon">▼</span>
        </button>
        <div class="hero-bio-content">
          <div class="hero-bio">${hero.bio_loc}</div>
        </div>
      </div>
    </div>
  `;
  processImages(modalBody);
}
