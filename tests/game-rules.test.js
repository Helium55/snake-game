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
  /if\(!autoMode\)\{\s*if\(inputQueue\.length\)nextDirection=inputQueue\.shift\(\);\s*if\(isValidDirection\(nextDirection\)\)direction=nextDirection;\s*\}/.test(source),
  'manual input queue must not override the AI-selected direction in auto mode'
);

assert(
  source.includes('INPUT_ACCEL_DELAY') &&
  source.includes('INPUT_QUEUE_LIMIT=2') &&
  source.includes('function scheduleGameTick') &&
  source.includes('function speedUpPendingTickForInput') &&
  source.includes('inputQueue.length>=INPUT_QUEUE_LIMIT'),
  'manual controls should queue quick turns and accelerate the next pending tick'
);

assert(
  source.includes('swipeHandled') &&
  source.includes("gc.addEventListener('touchmove'") &&
  source.includes('{passive:false}') &&
  /if\(Math\.abs\(dx\)<20&&Math\.abs\(dy\)<20\)return/.test(source),
  'mobile swipe controls should turn during touchmove once the gesture crosses the threshold'
);

assert(
  /const DISABLED_FREE_UPGRADES=\['food_sense'\]/.test(source),
  'free upgrade cards without gameplay behavior should be filtered from the draw pool'
);

assert(
  source.includes('id="btnStyle"') &&
  source.includes('id="stylePanel"') &&
  source.includes('data-style="default"') &&
  source.includes('data-style="synthwave"') &&
  source.includes('data-style="acid"'),
  'main menu should expose default, synthwave, and acid visual style choices'
);

for (const marker of [
  '--surface-strong',
  '--line-strong',
  '--success',
  '--warning',
  '--special',
  'precision-control-shell',
  'style-swatch',
]) {
  assert(source.includes(marker), `precision control UI marker missing: ${marker}`);
}

for (const marker of [
  'function pushCanvasEffect',
  'function drawFoodChip',
  'function drawMergedFoodCore',
  'function drawSpecialFoodCore',
  'function drawSnakeSegment',
  'function drawCompressedSegment',
  'function pulseScore',
]) {
  assert(source.includes(marker), `distinct visual helper missing: ${marker}`);
}

assert(
  source.includes('score-value score-pop-ready') &&
  source.includes('canvas-effect-ring') &&
  source.includes('upgrade-card selected'),
  'score, eating, and upgrade selection feedback should have stable CSS markers'
);

assert(
  source.includes('.style-acid') &&
  source.includes('@keyframes acid-drift') &&
  source.includes('@keyframes acid-pulse') &&
  source.includes('酸性艺术'),
  'acid art style should include its own UI palette, animated background, and menu label'
);

assert(
  /document\.body\.classList\.remove\('style-default','style-synthwave','style-acid'\)/.test(source) &&
  /currentVisualStyle=style==='synthwave'\?'synthwave':style==='acid'\?'acid':'default'/.test(source) &&
  /currentVisualStyle==='acid'\?'酸性艺术'/.test(source),
  'visual style switching should preserve acid as a first-class selectable style'
);

assert(
  /canvasBaseBackground\(\)\{return currentVisualStyle==='synthwave'\?'rgba\(7,0,18,0\.58\)':currentVisualStyle==='acid'\?'rgba\(10,16,0,0\.68\)'/.test(source),
  'acid art style should use a matching translucent canvas background'
);

assert(
  source.includes('.style-synthwave') &&
  source.includes('mask-image:repeating-linear-gradient') &&
  source.includes('@keyframes synth-sun-glow') &&
  source.includes('@keyframes synth-grid-drift'),
  'synthwave style should include a glowing scanline sun and moving horizon-grid styling'
);

assert(
  !source.includes('synth-building') &&
  !source.includes('class="synth-city"') &&
  !source.includes('.synth-city::before') &&
  !source.includes('天际线'),
  'synthwave style should remove building and skyline layers'
);

assert(
  source.includes('动态落日和底部透视网格'),
  'synthwave style option should describe the current sun and bottom-grid look'
);

assert(
  /body\.style-synthwave::before\{[^}]*mask-image:repeating-linear-gradient/.test(source) &&
  /body\.style-synthwave::before\{[^}]*animation:synth-sun-glow/.test(source) &&
  !source.includes('mask-position') &&
  !source.includes('infinite alternate'),
  'synthwave sun animation should pulse the sunset glow without moving scanline cuts'
);

assert(
  /body\.style-synthwave::after\{[^}]*bottom:-12vh/.test(source) &&
  /body\.style-synthwave::after\{[^}]*height:54vh/.test(source) &&
  /body\.style-synthwave::after\{[^}]*animation:synth-grid-drift/.test(source),
  'synthwave horizon grid should sit at the bottom of the screen and keep moving'
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
