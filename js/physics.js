// =================================================================
// PHYSICS — Matter.js engine wrapper
// =================================================================
import { CONFIG } from './config.js';
import { state } from './state.js';

let engine = null;
let world = null;
let walls = [];

export function getEngine() { return engine; }
export function getWorld() { return world; }

export function initPhysics() {
  const { Engine, Bodies, World } = Matter;
  engine = Engine.create({
    gravity: { x: 0, y: 1.05 },
    enableSleeping: false
  });
  engine.positionIterations = 8;
  engine.velocityIterations = 6;
  engine.constraintIterations = 3;
  world = engine.world;
  buildWalls();
}

export function buildWalls(inset = 0) {
  const { Bodies, World } = Matter;
  // Remove any existing walls
  for (const w of walls) World.remove(world, w);
  walls = [];
  const wallOpts = { isStatic: true, restitution: 0.2, friction: 0.4, label: 'wall' };
  const W = CONFIG.W, H = CONFIG.H, T = CONFIG.WALL_T;
  walls.push(
    Bodies.rectangle(W / 2, H + T / 2, W, T, wallOpts),
    Bodies.rectangle(-T / 2 + inset, H / 2, T, H * 2, wallOpts),
    Bodies.rectangle(W + T / 2 - inset, H / 2, T, H * 2, wallOpts)
  );
  World.add(world, walls);
}

export function applyStagePhysics(stage) {
  if (!engine || !stage) return;
  engine.gravity.y = stage.gravity || 1.05;
  buildWalls(stage.wallInset || 0);
}

export function makeBlob(tier, x, y, vy = 0) {
  const t = state.tiers[tier];
  if (!t) return null;
  const stage = state.stageData;
  const friction = (stage && stage.friction !== undefined) ? stage.friction : 0.05;
  const restitution = (stage && stage.restitution !== undefined) ? stage.restitution : 0.18;
  const { Bodies, Body, World } = Matter;
  const body = Bodies.circle(x, y, t.r, {
    restitution,
    friction,
    frictionAir: 0.001,
    density: 0.0014 + tier * 0.0002,
    label: 'blob',
    slop: 0.04
  });
  body.tier = tier;
  body.merging = false;
  body.bornAt = performance.now();
  body.spawnT = performance.now();
  body.spin = (Math.random() - 0.5) * 0.04;
  Body.setAngularVelocity(body, body.spin);
  if (vy) Body.setVelocity(body, { x: 0, y: vy });
  World.add(world, body);
  state.bodies.add(body);
  state.tierCount[tier] = (state.tierCount[tier] || 0) + 1;
  if (tier > state.highestTier) state.highestTier = tier;
  return body;
}

export function removeBody(body) {
  if (!body || !world) return;
  if (state.bodies.has(body)) {
    Matter.World.remove(world, body);
    state.bodies.delete(body);
  }
}

export function clearAllBodies() {
  for (const b of Array.from(state.bodies)) removeBody(b);
  state.bodies.clear();
}

export function applyMagnet() {
  // Pull same-tier blobs gently together
  const groups = {};
  for (const b of state.bodies) {
    if (!groups[b.tier]) groups[b.tier] = [];
    groups[b.tier].push(b);
  }
  const { Body } = Matter;
  for (const tier in groups) {
    const arr = groups[tier];
    if (arr.length < 2) continue;
    let cx = 0, cy = 0;
    for (const b of arr) { cx += b.position.x; cy += b.position.y; }
    cx /= arr.length; cy /= arr.length;
    for (const b of arr) {
      const dx = cx - b.position.x;
      const dy = cy - b.position.y;
      const d = Math.hypot(dx, dy) || 1;
      Body.applyForce(b, b.position, {
        x: (dx / d) * 0.0008 * b.mass,
        y: (dy / d) * 0.0008 * b.mass
      });
    }
  }
}

export function applyWind(now) {
  // Storm Mode — gusts of sideways force
  if (!state.stageData || state.stageData.weather !== 'storm') return;
  if (now < state.windT) return;
  state.windT = now + 4000 + Math.random() * 3000;
  state.windPhase = (Math.random() - 0.5) * 0.0015;
  setTimeout(() => { state.windPhase = 0; }, 1500);
}

export function applyWindForce() {
  if (state.windPhase === 0) return;
  const { Body } = Matter;
  for (const b of state.bodies) {
    Body.applyForce(b, b.position, { x: state.windPhase * b.mass, y: 0 });
  }
}

export function applyAntiGravity(now) {
  if (!state.stageData || state.stageData.weather !== 'flip') return;
  if (now > state.antiGravUntil && now > state.antiGravNext) {
    state.antiGravUntil = now + CONFIG.ANTI_GRAVITY_DURATION;
    state.antiGravNext = now + CONFIG.ANTI_GRAVITY_INTERVAL;
  }
  if (engine) {
    engine.gravity.y = (now < state.antiGravUntil) ? -0.5 : (state.stageData.gravity || 1.05);
  }
}

export function pickRandomDropTier() {
  const r = Math.random();
  // Lucky egg perk: 5% chance pebble becomes egg
  if (state.ownedPerks.includes('lucky_egg') && Math.random() < 0.05) return 1;
  for (const w of CONFIG.DROP_WEIGHTS) {
    if (r < w.prob) return w.tier;
  }
  return 0;
}
