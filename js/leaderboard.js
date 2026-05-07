// =================================================================
// LEADERBOARD — Supabase + local fallback
// =================================================================
import { CONFIG } from './config.js';
import { state } from './state.js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

let supabase = null;
let usingSupabase = false;
const LOCAL_KEY = 'blobverse-local-leaderboard-v1';

export function initLeaderboard() {
  if (SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase) {
    try {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      usingSupabase = true;
    } catch (e) {
      console.warn('Supabase init failed, using local leaderboard:', e);
      usingSupabase = false;
    }
  }
}

export function isUsingGlobal() { return usingSupabase; }

export async function submitScore(score, stage) {
  const now = Date.now();
  if (now - state.lastLeaderboardSubmit < CONFIG.LEADERBOARD_MIN_SUBMIT_MS) {
    return { ok: false, reason: 'rate' };
  }
  if (score <= 0 || !state.profile.name) return { ok: false, reason: 'invalid' };
  state.lastLeaderboardSubmit = now;
  if (!usingSupabase) return submitLocal(score, stage);
  try {
    const payload = {
      name: String(state.profile.name).slice(0, CONFIG.LEADERBOARD_MAX_NAME),
      score: Math.floor(score),
      stage: Math.max(1, Math.min(99, Math.floor(stage || 1))),
      country: state.profile.country || null
    };
    const { error } = await supabase.from('scores').insert(payload);
    if (error) {
      console.warn('[Blobverse] Supabase insert failed:', error.message, error);
      // Most common cause: SQL setup not run, or RLS policy too restrictive.
      // We silently fall back to local but log loudly for the developer.
      return submitLocal(score, stage);
    }
    submitLocal(score, stage); // also keep local mirror
    return { ok: true };
  } catch (e) {
    console.warn('submitScore error:', e);
    return submitLocal(score, stage);
  }
}

function submitLocal(score, stage) {
  try {
    const list = readLocal();
    list.push({
      name: state.profile.name,
      score: Math.floor(score),
      stage: stage || 1,
      country: state.profile.country || '🌍',
      created_at: new Date().toISOString(),
      local: true
    });
    list.sort((a, b) => b.score - a.score);
    const trimmed = list.slice(0, CONFIG.LEADERBOARD_TOP_N);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(trimmed));
    return { ok: true, local: true };
  } catch (e) {
    return { ok: false, reason: 'storage' };
  }
}

function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr;
  } catch (e) { return []; }
}

export async function fetchTop(scope = 'all') {
  if (!usingSupabase) return readLocal();
  try {
    let query = supabase.from('scores').select('*').order('score', { ascending: false }).limit(CONFIG.LEADERBOARD_TOP_N);
    if (scope === 'week') {
      const wk = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', wk);
    }
    const { data, error } = await query;
    if (error) {
      console.warn('Leaderboard fetch failed:', error);
      return readLocal();
    }
    return data || [];
  } catch (e) {
    console.warn('fetchTop error:', e);
    return readLocal();
  }
}

export async function detectCountry() {
  if (state.profile.country && state.profile.country !== '🌍') return state.profile.country;
  try {
    const lang = (navigator.language || 'en-US').split('-')[1] || '';
    if (lang) {
      const flag = countryToEmoji(lang);
      if (flag) {
        state.profile.country = flag;
        return flag;
      }
    }
  } catch (e) {}
  return '🌍';
}

function countryToEmoji(code) {
  if (!code || code.length !== 2) return null;
  const A = 0x1F1E6;
  const upper = code.toUpperCase();
  return String.fromCodePoint(A + upper.charCodeAt(0) - 65) +
         String.fromCodePoint(A + upper.charCodeAt(1) - 65);
}

export function renderLeaderboard(sideBody, scope = 'all') {
  sideBody.innerHTML = `
    <div class="panel-tabs">
      <button class="panel-tab ${scope === 'all' ? 'active' : ''}" data-tab="all">All-Time</button>
      <button class="panel-tab ${scope === 'week' ? 'active' : ''}" data-tab="week">This Week</button>
    </div>
    <div id="lbList"><div class="empty-state">Loading...</div></div>
    <div style="font-size:10px;color:rgba(255,255,255,.4);text-align:center;margin-top:12px;">
      ${usingSupabase ? '🌍 Global leaderboard' : '📁 Local leaderboard (set up Supabase to go global)'}
    </div>
  `;
  sideBody.querySelectorAll('.panel-tab').forEach(t => {
    t.addEventListener('click', () => renderLeaderboard(sideBody, t.dataset.tab));
  });
  fetchTop(scope).then(rows => {
    const list = document.getElementById('lbList');
    if (!list) return;
    if (!rows || rows.length === 0) {
      if (usingSupabase) {
        list.innerHTML = `<div class="empty-state">No scores yet — be the first to submit!<br><br>End a run with a score above 0 to appear here.</div>`;
      } else {
        list.innerHTML = `<div class="empty-state">No scores yet on this device.<br><br>To enable the global leaderboard, paste your Supabase keys into <code style="background:rgba(255,255,255,0.08);padding:2px 5px;border-radius:4px;">js/supabase-config.js</code> in your repo and reload.</div>`;
      }
      return;
    }
    list.innerHTML = rows.map((r, i) => {
      const rankCls = i === 0 ? 'gold' : (i === 1 ? 'silver' : (i === 2 ? 'bronze' : ''));
      const medal = i === 0 ? '🥇' : (i === 1 ? '🥈' : (i === 2 ? '🥉' : (i + 1)));
      const isYou = r.name === state.profile.name;
      return `
        <div class="lb-row ${isYou ? 'you' : ''}">
          <div class="rank ${rankCls}">${medal}</div>
          <div class="name">
            <span class="flag">${r.country || '🌍'}</span>
            <span>${escapeHtml(r.name)}</span>
            ${isYou ? '<span style="font-size:9px;color:#f472b6;font-weight:900;">YOU</span>' : ''}
            ${r.local ? '<span style="font-size:9px;color:rgba(255,255,255,.3);">local</span>' : ''}
          </div>
          <div class="score">${(r.score || 0).toLocaleString()}</div>
        </div>
      `;
    }).join('');
  });
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
