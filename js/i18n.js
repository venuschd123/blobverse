// =================================================================
// I18N — translation loader
// =================================================================
let strings = {};

export async function loadLanguage(lang = 'en') {
  try {
    const res = await fetch(`./i18n/${lang}.json`);
    if (!res.ok) throw new Error('lang load fail');
    strings = await res.json();
  } catch (e) {
    console.warn('i18n load failed:', e);
    strings = {};
  }
}

export function t(key, fallback = '') {
  return strings[key] || fallback || key;
}
