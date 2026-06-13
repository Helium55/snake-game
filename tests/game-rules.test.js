const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const htmlPath = path.join(__dirname, '..', 'index.html');
const source = fs.readFileSync(htmlPath, 'utf8');

assert(
  !source.includes('bp>cost+1') && !source.includes('bp<=cost+1'),
  'shop affordability must allow purchases when body points are equal to the item cost'
);

assert(
  source.includes("bodyCompress||c.id!=='merge_boost'"),
  'merge_boost should only appear when body compression is active'
);

assert(
  /if\(!autoMode&&isValidDirection\(nextDirection\)\)direction=nextDirection/.test(source),
  'manual nextDirection must not override the AI-selected direction in auto mode'
);

assert(
  /const DISABLED_FREE_UPGRADES=\['food_sense'\]/.test(source),
  'free upgrade cards without gameplay behavior should be filtered from the draw pool'
);

for (const marker of [
  'runStartTime',
  'tailGrowTimer',
  'maxShieldBonus',
  'timeWarpUntil',
  'safeZoneUntil',
  'revengeUntil',
  'wall_hack',
]) {
  assert(source.includes(marker), `expected implemented upgrade mechanic marker: ${marker}`);
}

console.log('game rule source checks passed');
