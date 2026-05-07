// =================================================================
// BLOBDEX — encyclopedia
// =================================================================
import { state } from './state.js';
import { renderAchievements } from './achievements.js';

let view = 'list';
let selectedTier = null;

export function renderBlobdex(sideBody) {
  if (view === 'detail' && selectedTier !== null) return renderDetail(sideBody);
  let html = `
    <div class="panel-tabs">
      <button class="panel-tab active" data-tab="dex">Blobs</button>
      <button class="panel-tab" data-tab="ach">Trophies</button>
    </div>
    <div id="dexBody"></div>
  `;
  sideBody.innerHTML = html;
  document.querySelectorAll('#sidePanel .panel-tab').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('#sidePanel .panel-tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      if (t.dataset.tab === 'ach') renderAchievements(document.getElementById('dexBody'));
      else renderList();
    });
  });
  renderList();
}

function renderList() {
  const body = document.getElementById('dexBody');
  if (!body) return;
  let html = '<div class="dex-grid">';
  state.tiers.forEach((t, i) => {
    const found = (state.tierCount[i] || 0) > 0 || state.unlocked.has(i);
    html += `<div class="dex-card ${found ? '' : 'locked'}" data-tier="${i}">
      <div class="swatch" style="background:radial-gradient(circle at 30% 30%,${t.cs[0]},${t.cs[1]});"></div>
      <div class="name">${found ? t.name : '???'}</div>
      <div class="num">#${String(i + 1).padStart(2, '0')}</div>
    </div>`;
  });
  html += '</div>';
  body.innerHTML = html;
  body.querySelectorAll('.dex-card').forEach(c => {
    c.addEventListener('click', () => {
      const t = parseInt(c.dataset.tier, 10);
      const found = (state.tierCount[t] || 0) > 0 || state.unlocked.has(t);
      if (!found) return;
      selectedTier = t;
      view = 'detail';
      renderBlobdex(document.getElementById('sideBody'));
    });
  });
}

function renderDetail(sideBody) {
  const t = state.tiers[selectedTier];
  if (!t) { view = 'list'; renderBlobdex(sideBody); return; }
  const lore = state.loreData[selectedTier] || 'A blob.';
  const made = state.tierCount[selectedTier] || 0;
  sideBody.innerHTML = `
    <button class="btn btn-ghost" id="backDex" style="margin:0 0 10px;padding:6px 10px;font-size:10px;width:auto;">← All Blobs</button>
    <div class="dex-detail-card">
      <div class="swatch" style="background:radial-gradient(circle at 30% 30%,${t.cs[0]},${t.cs[1]});"></div>
      <div class="name">${t.name}</div>
      <div class="num">#${String(selectedTier + 1).padStart(2, '0')} · Tier ${selectedTier + 1}</div>
      <div class="lore">${lore}</div>
      <div class="stats">
        Made <b style="color:#fde68a;">${made}</b> times this run<br>
        Score per merge: <b style="color:#fde68a;">${(selectedTier + 1) * (selectedTier + 2)}</b>
      </div>
    </div>
  `;
  document.getElementById('backDex').addEventListener('click', () => {
    view = 'list';
    selectedTier = null;
    renderBlobdex(sideBody);
  });
}
