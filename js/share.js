// =================================================================
// SHARE — generate a score card image and share it via Web Share API
// =================================================================
import { state } from './state.js';
import { showAchievementToast } from './ui.js';

export function initShare() {
  // Hook into game over modal — looks for #btnShare when modal is open
  document.addEventListener('click', e => {
    if (e.target && e.target.id === 'btnShare') {
      e.preventDefault();
      openShareSheet();
    }
  });
}

export async function openShareSheet() {
  const blob = await renderShareImage();
  if (!blob) {
    fallbackShare();
    return;
  }
  // Web Share API with file
  try {
    const file = new File([blob], 'blobverse-score.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Blobverse',
        text: `I scored ${state.score.toLocaleString()} in Blobverse on stage ${state.stageId}! Beat me 👉`
      });
      return;
    }
  } catch (e) { /* fall through */ }
  // Fallback: copy to clipboard
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      showAchievementToast({ icon: '📋', label: 'COPIED', name: 'Score card on clipboard', desc: 'Paste it anywhere!' });
      return;
    }
  } catch (e) {}
  // Final fallback: download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'blobverse-score.png';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function fallbackShare() {
  if (navigator.share) {
    navigator.share({
      title: 'Blobverse',
      text: `I scored ${state.score.toLocaleString()} in Blobverse — beat me!`,
      url: location.href
    }).catch(() => {});
    return;
  }
  // Copy text to clipboard
  const text = `I scored ${state.score.toLocaleString()} in Blobverse — beat me at ${location.href}`;
  navigator.clipboard?.writeText(text).then(() =>
    showAchievementToast({ icon: '📋', label: 'COPIED', name: 'Share text on clipboard' })
  ).catch(() => {});
}

async function renderShareImage() {
  try {
    const w = 1080, h = 1080;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');

    // Background gradient
    const bg = ctx.createRadialGradient(w * 0.3, h * 0.3, 50, w / 2, h / 2, w * 0.8);
    bg.addColorStop(0, '#6d28d9');
    bg.addColorStop(0.5, '#1e1b4b');
    bg.addColorStop(1, '#0c0a1f');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (let i = 0; i < 80; i++) {
      const r = Math.random() * 2 + 0.5;
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Title
    ctx.textAlign = 'center';
    ctx.font = 'bold 72px -apple-system, system-ui, sans-serif';
    const titleGrad = ctx.createLinearGradient(0, 100, 0, 200);
    titleGrad.addColorStop(0, '#f472b6');
    titleGrad.addColorStop(0.5, '#a78bfa');
    titleGrad.addColorStop(1, '#38bdf8');
    ctx.fillStyle = titleGrad;
    ctx.fillText('BLOBVERSE', w / 2, 160);

    ctx.font = '500 28px -apple-system, system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.fillText('Drop · Merge · Ascend', w / 2, 210);

    // Big blob in middle
    const t = state.tiers[Math.min(state.highestTier, state.tiers.length - 1)] || state.tiers[0];
    if (t) {
      const cx = w / 2, cy = h / 2 + 30, rr = 200;
      const grad = ctx.createRadialGradient(cx - rr * 0.4, cy - rr * 0.4, rr * 0.1, cx, cy, rr);
      grad.addColorStop(0, t.cs[0]); grad.addColorStop(1, t.cs[1]);
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.fill();
      // Eyes
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(cx - 70, cy - 40, 32, 0, Math.PI * 2);
      ctx.arc(cx + 70, cy - 40, 32, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(cx - 70, cy - 38, 16, 0, Math.PI * 2);
      ctx.arc(cx + 70, cy - 38, 16, 0, Math.PI * 2); ctx.fill();
      // Mouth
      ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(cx, cy + 40, 60, 0.2, Math.PI - 0.2); ctx.stroke();
    }

    // Score
    ctx.font = 'bold 96px -apple-system, system-ui, sans-serif';
    ctx.fillStyle = '#fde68a';
    ctx.fillText(state.score.toLocaleString(), w / 2, 880);

    ctx.font = '600 32px -apple-system, system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    ctx.fillText(`${state.profile.name} ${state.profile.country || ''} · Stage ${state.stageId}`, w / 2, 940);

    ctx.font = '500 24px -apple-system, system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.fillText('Beat me — link in bio', w / 2, 1010);

    return await new Promise(res => c.toBlob(res, 'image/png'));
  } catch (e) {
    console.warn('renderShareImage failed', e);
    return null;
  }
}
