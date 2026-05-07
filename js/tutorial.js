// =================================================================
// TUTORIAL — first-time user guidance
// =================================================================
import { state } from './state.js';
import { saveAll } from './save.js';

const STEPS = [
  { text: "<b>Hi, I'm Bloop! 👋</b><br>Tap inside the jar to drop a blob." },
  { text: "<b>Now drop another pebble next to it.</b><br>Same blobs <b>merge</b>!" },
  { text: "<b>EVOLUTION!</b> 💥<br>Bigger blobs = more points. Reach the <b>PLANET</b> to clear the stage!" },
  { text: "<b>Watch the pink line.</b> 🚨<br>If a blob crosses it for too long, game over. Use power-ups when stuck!" },
  { text: "<b>Tap 🏆 Ranks</b> to see the leaderboard.<br><b>📜 Quests</b> for goals.<br><b>🛍️ Shop</b> to spend coins.<br>Have fun!" }
];

let tut = null;
let tutCard = null;
let stepIdx = 0;

export function initTutorial() {
  tut = document.getElementById('tut');
  tutCard = document.getElementById('tutCard');
}

export function maybeStartTutorial() {
  if (state.hasSeenTutorial) return;
  stepIdx = 0;
  showStep();
}

function showStep() {
  if (!tut || !tutCard) return;
  const step = STEPS[stepIdx];
  if (!step) { endTutorial(); return; }
  tutCard.innerHTML = step.text +
    `<button class="nextbtn">${stepIdx < STEPS.length - 1 ? "Got it" : "Let's play!"}</button>`;
  tutCard.querySelector('.nextbtn').addEventListener('click', nextStep);
  tut.classList.add('show');
}

function nextStep() {
  stepIdx++;
  if (stepIdx >= STEPS.length) { endTutorial(); return; }
  tut.classList.remove('show');
  setTimeout(showStep, 250);
}

export function advanceTutorialOn(event) {
  // Auto-advance on game events
  if (!tut || !tut.classList.contains('show')) return;
  if (event === 'firstDrop' && stepIdx === 0) nextStep();
  else if (event === 'firstMerge' && stepIdx === 1) nextStep();
  else if (event === 'firstUpgrade' && stepIdx === 2) nextStep();
}

function endTutorial() {
  if (tut) tut.classList.remove('show');
  state.hasSeenTutorial = true;
  saveAll();
}

export function isTutorialActive() {
  return tut && tut.classList.contains('show');
}
