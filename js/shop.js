// =================================================================
// SHOP — skins, themes, perks
// =================================================================
import { state } from './state.js';
import { saveAll } from './save.js';
import { showAchievementToast, refreshHud } from './ui.js';

let activeTab = 'skins';

export function renderShop(sideBody) {
  if (!state.skinsData) {
    sideBody.innerHTML = '<div class="empty-state">Loading shop…</div>';
    return;
  }
  sideBody.innerHTML = `
    <div class="panel-tabs">
      <button class="panel-tab ${activeTab === 'skins' ? 'active' : ''}" data-tab="skins">Skins</button>
      <button class="panel-tab ${activeTab === 'themes' ? 'active' : ''}" data-tab="themes">Themes</button>
      <button class="panel-tab ${activeTab === 'perks' ? 'active' : ''}" data-tab="perks">Perks</button>
    </div>
    <div id="shopBody"></div>
  `;
  sideBody.querySelectorAll('.panel-tab').forEach(t => {
    t.addEventListener('click', () => {
      activeTab = t.dataset.tab;
      renderShop(sideBody);
    });
  });
  renderShopBody();
}

function renderShopBody() {
  const body = document.getElementById('shopBody');
  if (!body) return;
  if (activeTab === 'skins') {
    body.innerHTML = `
      <div class="shop-cat-title">Blob Skins</div>
      <div class="shop-grid">${state.skinsData.skinPacks.map(item => renderItem(item, 'skin')).join('')}</div>
    `;
    bindButtons(body, 'skin');
  } else if (activeTab === 'themes') {
    body.innerHTML = `
      <div class="shop-cat-title">Jar Themes</div>
      <div class="shop-grid">${state.skinsData.themes.map(item => renderItem(item, 'theme')).join('')}</div>
    `;
    bindButtons(body, 'theme');
  } else if (activeTab === 'perks') {
    body.innerHTML = `
      <div class="shop-cat-title">Permanent Perks</div>
      <div class="shop-grid">${state.skinsData.perks.map(item => renderItem(item, 'perk')).join('')}</div>
    `;
    bindButtons(body, 'perk');
  }
}

function renderItem(item, type) {
  let owned = false, equipped = false;
  if (type === 'skin') { owned = state.ownedSkins.includes(item.id); equipped = state.equippedSkin === item.id; }
  else if (type === 'theme') { owned = state.ownedThemes.includes(item.id); equipped = state.equippedTheme === item.id; }
  else if (type === 'perk') { owned = state.ownedPerks.includes(item.id); equipped = owned; }
  const have = item.currency === 'star' ? state.stars : state.coins;
  const canAfford = have >= item.cost;
  const symbol = item.currency === 'star' ? '⭐' : '🪙';
  let buyClass = 'buy';
  let buyText = `${item.cost} ${symbol}`;
  if (equipped) { buyClass += ' equipped'; buyText = type === 'perk' ? 'OWNED' : 'EQUIPPED'; }
  else if (owned) { buyClass += ' owned'; buyText = type === 'perk' ? 'OWNED' : 'EQUIP'; }
  else if (!canAfford) { buyClass += ' cant'; }
  else if (item.currency === 'star') { buyClass += ' gold'; }
  return `
    <div class="shop-item ${owned ? 'owned' : ''} ${equipped ? 'equipped' : ''}" data-id="${item.id}" data-type="${type}">
      <div class="preview">${item.preview}</div>
      <div class="name">${item.name}</div>
      <div class="desc">${item.desc}</div>
      <button class="${buyClass}">${buyText}</button>
    </div>
  `;
}

function bindButtons(root, type) {
  root.querySelectorAll('.shop-item').forEach(el => {
    const btn = el.querySelector('.buy');
    if (!btn || btn.classList.contains('cant') || btn.classList.contains('equipped')) return;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = el.dataset.id;
      handlePurchase(type, id);
    });
  });
}

function handlePurchase(type, id) {
  if (!state.skinsData) return;
  let list, ownedList, equipKey, eqList;
  if (type === 'skin') { list = state.skinsData.skinPacks; ownedList = state.ownedSkins; equipKey = 'equippedSkin'; }
  else if (type === 'theme') { list = state.skinsData.themes; ownedList = state.ownedThemes; equipKey = 'equippedTheme'; }
  else if (type === 'perk') { list = state.skinsData.perks; ownedList = state.ownedPerks; equipKey = null; }
  const item = list.find(i => i.id === id);
  if (!item) return;
  const have = item.currency === 'star' ? state.stars : state.coins;
  if (!ownedList.includes(id)) {
    if (have < item.cost) return;
    if (item.currency === 'star') state.stars -= item.cost;
    else state.coins -= item.cost;
    ownedList.push(id);
    if (equipKey) state[equipKey] = id;
    showAchievementToast({ icon: item.preview, label: 'PURCHASED', name: item.name, desc: item.desc, reward: 0 });
    if (type === 'theme') applyTheme(id);
  } else {
    if (equipKey) {
      state[equipKey] = id;
      if (type === 'theme') applyTheme(id);
    }
  }
  saveAll();
  refreshHud();
  renderShopBody();
}

export function applyTheme(themeId) {
  document.body.className = document.body.className.replace(/theme-\w+/g, '').trim();
  document.body.classList.add('theme-' + (themeId || 'default'));
}
