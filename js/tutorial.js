// =================================================================
// TUTORIAL — first-time user guidance (v1.1: no unreachable gates)
// =================================================================
import { state } from './state.js';
import { saveAll } from './save.js';

const STEPS = [
  {
    text: "<b>Hi, I'm Bloop! 👋</b><br>Tap inside the jar to drop a blob.",
    autoAdvanceOn: 'firstDrop'
  },
  {
    text: "<b>Drop another pebble next to it.</b><br>Two of the same blob <b>merge</b> into a bigger one!",
    autoAdvanceOn: 'firstMerge'
  },
  {
    text: "<b>Watch the pink line.</b> 🚨<br>If a blob crosses it for too long, the run ends. Use power-ups when stuck!"
  },
  {
    text: "<b>Tap the icons below to explore:</b><br>🏆 Ranks · 📜 Quests · 🛍️ Shop · 📖 Blobdex · 🎁 Daily<br>Have fun!"
  }
];

let tut = null;
let tutCard = null;
let stepIdx = 0;
let active = false;

export function initTutorial() {
  tut = document.getElementById('tut');
  tutCard = document.getElementById('tutCard');
}

export function maybeStartTutorial() {
  if (state.hasSeenTutorial) return;
  stepIdx = 0;
  active = true;
  showStep();
}

function showStep() {
  if (!tut || !tutCard) return;
  const step = STEPS[stepIdx];
  if (!step) { endTutorial(); return; }
  const isLast = stepIdx === STEPS.length - 1;
  const buttonText = step.autoAdvanceOn ? 'Got it' : (isLast ? "Let's play!" : 'Next');
  tutCard.innerHTML = step.text + `<button class="nextbtn" type="button">${buttonText}</button>`;
  const btn = tutCard.querySelector('.nextbtn');
  if (btn) btn.addEventListener('click', e => { e.stopPropagation(); nextStep(); });
  tut.classList.add('show');
}

function nextStep() {
  stepIdx++;
  if (stepIdx >= STEPS.length) { endTutorial(); return; }
  tut.classList.remove('show');
  setTimeout(showStep, 250);
}

export function advanceTutorialOn(event) {
  if (!active) return;
  const step = STEPS[stepIdx];
  if (step && step.autoAdvanceOn === event) nextStep();
}

function endTutorial() {
  if (tut) tut.classList.remove('show');
  active = false;
  state.hasSeenTutorial = true;
  saveAll();
}

export function isTutorialActive() {
  return active && tut && tut.classList.contains('show');
}
