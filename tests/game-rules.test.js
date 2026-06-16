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

assert(
  source.includes('id="btnStyle"') &&
  source.includes('id="stylePanel"') &&
  source.includes('data-style="default"') &&
  source.includes('data-style="synthwave"'),
  'main menu should expose default and synthwave visual style choices'
);

assert(
  source.includes('.style-synthwave') &&
  source.includes('@keyframes synth-sun-scan') &&
  source.includes('@keyframes synth-grid-drift'),
  'synthwave style should include scanline sun and moving horizon-grid styling'
);

assert(
  source.includes('class="synth-city"') &&
  source.includes('.synth-city::before') &&
  source.includes('.synth-city::after'),
  'synthwave style should include a fixed skyline layer with buildings and a horizon glow'
);

assert(
  /body\{[^}]*flex-direction:column[^}]*overflow-x:hidden/.test(source),
  'page body should use column flex layout and hide horizontal overflow so screens stay centered'
);

assert(
  /SHOP_UPGRADES\.filter\(c=>!\(c\.id==='magnet'&&magnetLevel\(\)>=3\)\)/.test(source),
  'max-level magnet should be removed from the shop draw pool'
);

assert(
  /if\(pickedShop===card\.dataset\.id\)\{card\.style\.boxShadow='';pickedShop='';updateConfirmBtn\(\);return\}/.test(source),
  'clicking the selected shop upgrade again should cancel that optional purchase'
);

assert(
  /\.upgrade-overlay\{[^}]*overflow-y:auto/.test(source) &&
  /\.upgrade-overlay\{[^}]*-webkit-overflow-scrolling:touch/.test(source) &&
  /\.upgrade-overlay\{[^}]*touch-action:pan-y/.test(source),
  'upgrade overlay must be vertically scrollable on mobile so the confirm button remains reachable'
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

for (const id of [
  'auto_speed',
  'auto_collect',
  'auto_smart',
  'auto_food_bonus',
  'auto_food_spawn',
  'auto_special_rate',
  'auto_split',
  'env_night',
  'env_matrix',
  'env_galaxy',
  'env_dawn',
]) {
  assert(source.includes(`id:'${id}'`), `auto shop item must have stable id: ${id}`);
}

console.log('game rule source checks passed');
