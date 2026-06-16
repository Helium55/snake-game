# Precision Control UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the snake game frontend into the approved Precision Control Console style, with distinct item visuals and polished microinteractions while preserving existing gameplay behavior.

**Architecture:** Keep the app as the existing single-file `index.html`. Add a shared CSS token/component system, light DOM animation hooks, and bounded canvas visual effects driven by the existing game loop. Existing tests remain source-level and VM-level checks, with new assertions for redesigned UI markers.

**Tech Stack:** Plain HTML/CSS/JavaScript, Canvas 2D API, existing Node-based tests, GitHub Pages deployment.

---

## File Structure

- Modify: `C:\Users\31445\snake-game\index.html`
  - Replace the current visual skin CSS with unified Precision Control tokens and shared component rules.
  - Keep selectable `default`, `synthwave`, and `acid` styles.
  - Add DOM hooks for score pulses, upgrade selection, purchase feedback, and canvas effect overlays.
  - Update Canvas drawing helpers for differentiated snake, food, compressed body, special food, and interaction effects.
- Modify: `C:\Users\31445\snake-game\tests\game-rules.test.js`
  - Update existing style marker checks that refer to old style copy.
  - Add source checks for the new token system, distinct item visual helpers, score feedback, and motion helpers.
- Modify: `C:\Users\31445\snake-game\tests\behavior.test.js`
  - Add minimal DOM stubs if needed for new animation classes or helper calls.
  - Keep existing gameplay scenarios passing.
- Modify: `C:\Users\31445\snake-game\VERSION`
  - Bump to `0.3.0`.
- Modify: `C:\Users\31445\snake-game\CHANGELOG.md`
  - Add a dated `0.3.0` entry describing the visual redesign, item redesign, and motion feedback.
- Modify: `C:\Users\31445\snake-game\AGENTS.md`
  - Add durable notes about the Precision Control visual system and required style markers for future agents.

## Task 1: Add Redesign Source Checks

**Files:**
- Modify: `C:\Users\31445\snake-game\tests\game-rules.test.js`

- [ ] **Step 1: Add failing source checks for the new visual system**

Append these checks near the existing visual style assertions in `tests\game-rules.test.js`:

```js
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
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```powershell
node tests\game-rules.test.js
```

Expected: FAIL with a marker such as `precision control UI marker missing: --surface-strong`.

- [ ] **Step 3: Commit the failing test**

Run:

```powershell
git add tests\game-rules.test.js
git commit -m "test: add precision control UI markers"
```

Expected: commit succeeds with only the test file staged.

## Task 2: Replace Global UI Tokens And Shared Components

**Files:**
- Modify: `C:\Users\31445\snake-game\index.html`

- [ ] **Step 1: Replace the current root token block**

In the `<style>` block, replace the existing `:root`, `body`, `body.style-synthwave`, and `body.style-acid` token/background rules with a shared system containing these markers:

```css
:root{
  --bg:#070b10;
  --surface:rgba(15,22,30,.88);
  --surface-strong:rgba(12,18,26,.96);
  --line:rgba(154,178,202,.16);
  --line-strong:rgba(76,201,240,.42);
  --text:#eef5fb;
  --muted:#8492a3;
  --accent:#4cc9f0;
  --success:#62d48c;
  --warning:#f5b85a;
  --danger:#ef6b73;
  --special:#a78bfa;
  --shadow-deep:0 24px 70px rgba(0,0,0,.42);
  --radius:8px;
}
*{margin:0;padding:0;box-sizing:border-box}
body{
  position:relative;
  isolation:isolate;
  min-height:100vh;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  padding:12px;
  overflow-x:hidden;
  overflow-y:auto;
  color:var(--text);
  font-family:'Segoe UI','PingFang SC',system-ui,sans-serif;
  background:
    linear-gradient(rgba(255,255,255,.024) 1px,transparent 1px),
    linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px),
    radial-gradient(circle at 18% 10%,rgba(76,201,240,.11),transparent 26%),
    radial-gradient(circle at 82% 12%,rgba(245,184,90,.08),transparent 22%),
    var(--bg);
  background-size:28px 28px,28px 28px,100% 100%,100% 100%,100% 100%;
  user-select:none;
  -webkit-user-select:none;
  -webkit-tap-highlight-color:transparent;
}
body.style-default{--theme-name:'precision-control-shell'}
```

- [ ] **Step 2: Add updated theme variants**

Add restrained theme variable overrides and background layers:

```css
body.style-synthwave{
  --bg:#070812;
  --surface:rgba(18,14,31,.86);
  --surface-strong:rgba(13,10,24,.96);
  --line:rgba(255,94,210,.18);
  --line-strong:rgba(76,201,240,.45);
  --accent:#54dff6;
  --success:#72e7b0;
  --warning:#ffd36f;
  --danger:#ff6b9a;
  --special:#ff5ed2;
  background:
    radial-gradient(circle at 50% 9%,rgba(255,94,210,.16),transparent 24%),
    linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),
    linear-gradient(90deg,rgba(255,255,255,.014) 1px,transparent 1px),
    linear-gradient(180deg,#090715 0%,#120d26 48%,#070812 100%);
  background-size:100% 100%,28px 28px,28px 28px,100% 100%;
}
body.style-acid{
  --bg:#090d0a;
  --surface:rgba(16,22,16,.88);
  --surface-strong:rgba(10,15,12,.96);
  --line:rgba(215,255,0,.2);
  --line-strong:rgba(215,255,0,.48);
  --accent:#9cf6ff;
  --success:#d7ff4d;
  --warning:#f4df5c;
  --danger:#ff4f8f;
  --special:#c7ff00;
  background:
    linear-gradient(135deg,rgba(215,255,0,.09),transparent 36%),
    linear-gradient(315deg,rgba(255,79,143,.08),transparent 42%),
    linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),
    linear-gradient(90deg,rgba(255,255,255,.016) 1px,transparent 1px),
    var(--bg);
  background-size:100% 100%,100% 100%,28px 28px,28px 28px,100% 100%;
}
```

- [ ] **Step 3: Normalize component geometry**

Update shared component rules so these selectors use `border-radius:var(--radius)`, `border:1px solid var(--line)`, `background:var(--surface)`, and `box-shadow:var(--shadow-deep)` where appropriate:

```css
.header,.speed-control,.name-input,.menu-btn,.style-panel,.canvas-container,.lb-panel,.achievement-toast,.pause-btn-mobile,.dpad-btn,.ab-btn{
  border-radius:var(--radius);
  border:1px solid var(--line);
  background:var(--surface);
  backdrop-filter:blur(14px);
}
.menu-btn,.btn,.btn-lb,.btn-back,.dpad-btn,.ab-btn,.pause-btn-mobile,.style-option,.upgrade-card{
  transition:transform .18s ease,border-color .18s ease,background .18s ease,box-shadow .18s ease;
}
.menu-btn:hover,.btn-lb:hover,.btn-back:hover,.style-option:hover,.upgrade-card:hover{
  transform:translateY(-2px);
  border-color:var(--line-strong);
}
.menu-btn:active,.btn:active,.dpad-btn:active,.ab-btn:active,.pause-btn-mobile:active{
  transform:translateY(1px) scale(.99);
}
```

- [ ] **Step 4: Run source test**

Run:

```powershell
node tests\game-rules.test.js
```

Expected: still fails on helper markers from Task 1, but token markers now pass.

## Task 3: Redesign Main Menu, Style Selector, HUD, And Mobile Controls

**Files:**
- Modify: `C:\Users\31445\snake-game\index.html`

- [ ] **Step 1: Add class markers to existing DOM**

Update the menu wrapper and style selector markup:

```html
<div class="game-wrapper precision-control-shell">
```

Update each style option to include a swatch:

```html
<button class="style-option" data-style="default">
  <span class="style-swatch swatch-default"></span>
  <span>
    <div class="style-option-name">精密控制台</div>
    <div class="style-option-desc">深石墨界面、冷青数据光和清晰仪表层级</div>
  </span>
</button>
```

Use equivalent labels for `synthwave` and `acid` while preserving their `data-style` values.

- [ ] **Step 2: Update HUD and speed control styling**

Make `.header` a compact instrument bar:

```css
.header{
  display:grid;
  grid-template-columns:1fr auto 1fr;
  gap:10px;
  align-items:center;
  width:100%;
  padding:12px 14px;
}
.score-value.score-pop-ready{
  animation:score-readout-pulse .24s ease-out;
}
@keyframes score-readout-pulse{
  0%{transform:scale(1);text-shadow:0 0 0 rgba(76,201,240,0)}
  45%{transform:scale(1.055);text-shadow:0 0 22px color-mix(in srgb,var(--accent) 62%,transparent)}
  100%{transform:scale(1);text-shadow:0 0 0 rgba(76,201,240,0)}
}
.speed-control{
  min-height:44px;
  padding:9px 12px;
}
.speed-slider{
  min-width:0;
  accent-color:var(--accent);
}
```

- [ ] **Step 3: Update mobile control styling**

Keep stable tap targets:

```css
.dpad-btn,.ab-btn{
  min-height:44px;
  border-radius:var(--radius);
  background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.018)),var(--surface);
}
.dpad-btn:active,.ab-btn:active{
  border-color:var(--line-strong);
  background:rgba(76,201,240,.12);
}
@media(max-width:600px){
  body{justify-content:flex-start;padding:8px}
  .game-wrapper{max-width:100%;gap:8px}
  .header{grid-template-columns:1fr auto 1fr;padding:10px}
  .menu-title{font-size:clamp(30px,10vw,42px)}
}
```

- [ ] **Step 4: Run syntax check**

Run:

```powershell
node --experimental-vm-modules tests\syntax-check.js
```

Expected: PASS.

## Task 4: Add Bounded Canvas Effect State

**Files:**
- Modify: `C:\Users\31445\snake-game\index.html`
- Modify if needed: `C:\Users\31445\snake-game\tests\behavior.test.js`

- [ ] **Step 1: Add effect state variables near other globals**

Add these globals near the existing game state variables:

```js
let canvasEffects=[];
let lastScoreValue=0;
```

- [ ] **Step 2: Add bounded effect helpers**

Add these helpers near drawing helper functions:

```js
function pushCanvasEffect(type,x,y,value=''){
  canvasEffects.push({type,x,y,value,start:Date.now(),life:type==='merge'?520:280});
  if(canvasEffects.length>24)canvasEffects=canvasEffects.slice(-24);
}
function pruneCanvasEffects(now=Date.now()){
  canvasEffects=canvasEffects.filter(e=>now-e.start<e.life);
}
function pulseScore(){
  const el=$('score');
  if(!el)return;
  el.classList.remove('score-pop-ready');
  void el.offsetWidth;
  el.classList.add('score-pop-ready');
}
```

- [ ] **Step 3: Trigger score pulse and eat effect after score changes**

Where the game updates score after eating food or special food, call:

```js
pulseScore();
pushCanvasEffect('eat',head.x,head.y,`+${gain}`);
```

Use the existing gain variable if available. If score is changed inline, compute:

```js
const beforeScore=score;
score+=points;
const gain=score-beforeScore;
```

- [ ] **Step 4: Add VM stubs if tests fail**

If `tests\behavior.test.js` fails because `offsetWidth` or `classList.remove` is missing, extend the existing element stub so it already supports:

```js
offsetWidth: 500,
classList: {
  add(...names) { for (const name of names) classes.add(name); },
  remove(...names) { for (const name of names) classes.delete(name); },
  contains(name) { return classes.has(name); },
  toggle(name, force) {
    if (force === undefined) {
      if (classes.has(name)) classes.delete(name);
      else classes.add(name);
    } else if (force) classes.add(name);
    else classes.delete(name);
  },
},
```

- [ ] **Step 5: Run behavior tests**

Run:

```powershell
node tests\behavior.test.js
```

Expected: PASS.

## Task 5: Redesign Canvas Drawing Helpers

**Files:**
- Modify: `C:\Users\31445\snake-game\index.html`

- [ ] **Step 1: Replace generic cell drawing with specific helpers**

Add helpers below `drawCellGlow` or replace `drawCell` usage with:

```js
function cellRect(gx,gy,pad=3){
  return {x:gx*CELL+pad,y:gy*CELL+pad,w:CELL-pad*2,h:CELL-pad*2};
}
function roundedRectPath(c,x,y,w,h,r){
  c.beginPath();
  c.moveTo(x+r,y);
  c.lineTo(x+w-r,y);
  c.quadraticCurveTo(x+w,y,x+w,y+r);
  c.lineTo(x+w,y+h-r);
  c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  c.lineTo(x+r,y+h);
  c.quadraticCurveTo(x,y+h,x,y+h-r);
  c.lineTo(x,y+r);
  c.quadraticCurveTo(x,y,x+r,y);
  c.closePath();
}
function drawFoodChip(f){
  const lvl=f.lvl||1;
  const r=cellRect(f.x,f.y,4);
  const pulse=0.86+Math.sin(Date.now()/180+f.x+f.y)*0.08;
  ctx.save();
  ctx.globalAlpha=.92;
  roundedRectPath(ctx,r.x,r.y,r.w,r.h,5);
  ctx.fillStyle=lvl>1?'#f5b85a':'#ef6b73';
  ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.28)';
  ctx.stroke();
  ctx.globalAlpha=.55*pulse;
  ctx.fillStyle=lvl>1?'#fff0ba':'#ffd0d3';
  ctx.fillRect(r.x+r.w*.34,r.y+3,r.w*.32,2);
  ctx.restore();
  if(lvl>1)drawMergedFoodCore(f);
}
function drawMergedFoodCore(f){
  const r=cellRect(f.x,f.y,5);
  ctx.save();
  ctx.fillStyle='rgba(7,11,16,.76)';
  roundedRectPath(ctx,r.x+3,r.y+3,r.w-6,r.h-6,4);
  ctx.fill();
  ctx.fillStyle='#fff2bd';
  ctx.font='800 9px Segoe UI';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillText(String(f.lvl||2),r.x+r.w/2,r.y+r.h/2);
  ctx.restore();
}
function drawSpecialFoodCore(f){
  const cx=f.x*CELL+CELL/2,cy=f.y*CELL+CELL/2;
  const age=Date.now()-f.spawnTime;
  const alpha=age>6000?Math.max(0,1-(age-6000)/2000):1;
  ctx.save();
  ctx.globalAlpha=alpha;
  ctx.beginPath();
  ctx.arc(cx,cy,8,0,Math.PI*2);
  ctx.fillStyle='#f5b85a';
  ctx.fill();
  ctx.lineWidth=2;
  ctx.strokeStyle='rgba(167,139,250,.9)';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx,cy,3,0,Math.PI*2);
  ctx.fillStyle='#fff7d8';
  ctx.fill();
  ctx.restore();
}
function drawSnakeSegment(seg,index,isHead){
  const r=cellRect(seg.x,seg.y,isHead?2:3);
  ctx.save();
  roundedRectPath(ctx,r.x,r.y,r.w,r.h,isHead?7:6);
  ctx.fillStyle=isHead?'#dff7e8':'#62d48c';
  ctx.fill();
  ctx.strokeStyle=isHead?'rgba(255,255,255,.48)':'rgba(255,255,255,.22)';
  ctx.stroke();
  if(isHead){
    ctx.fillStyle='rgba(7,11,16,.72)';
    ctx.fillRect(r.x+r.w*.62,r.y+r.h*.3,3,3);
  }
  ctx.restore();
}
function drawCompressedSegment(seg,index,isHead){
  const r=cellRect(seg.x,seg.y,3);
  ctx.save();
  roundedRectPath(ctx,r.x,r.y,r.w,r.h,6);
  ctx.fillStyle='#4cc9f0';
  ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.34)';
  ctx.stroke();
  ctx.fillStyle='#061019';
  ctx.font='900 10px Segoe UI';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillText(String(seg.lvl||1),r.x+r.w/2,r.y+r.h/2);
  ctx.restore();
}
```

- [ ] **Step 2: Update `draw()` to use distinct helpers**

Replace regular food drawing with:

```js
if(foods)for(const f of foods)drawFoodChip(f);
else if(food)drawFoodChip(food);
if(specialFood)drawSpecialFoodCore(specialFood);
```

Replace snake segment drawing with:

```js
snake.forEach((seg,i)=>{
  const isHead=i===0;
  if((seg.lvl||1)>1)drawCompressedSegment(seg,i,isHead);
  else drawSnakeSegment(seg,i,isHead);
});
```

- [ ] **Step 3: Draw canvas effects**

Add this at the end of `draw()` before `requestAnimationFrame` or after snake drawing:

```js
drawCanvasEffects();
```

Add helper:

```js
function drawCanvasEffects(now=Date.now()){
  pruneCanvasEffects(now);
  for(const e of canvasEffects){
    const t=(now-e.start)/e.life;
    const cx=e.x*CELL+CELL/2,cy=e.y*CELL+CELL/2;
    ctx.save();
    ctx.globalAlpha=1-t;
    if(e.type==='eat'||e.type==='merge'){
      ctx.beginPath();
      ctx.arc(cx,cy,6+t*16,0,Math.PI*2);
      ctx.strokeStyle=e.type==='merge'?'rgba(245,184,90,.85)':'rgba(76,201,240,.78)';
      ctx.lineWidth=2;
      ctx.stroke();
    }
    if(e.value){
      ctx.fillStyle='#ffe0a3';
      ctx.font='900 13px Segoe UI';
      ctx.textAlign='center';
      ctx.textBaseline='middle';
      ctx.fillText(e.value,cx,cy-14-t*18);
    }
    ctx.restore();
  }
}
```

- [ ] **Step 4: Run source test**

Run:

```powershell
node tests\game-rules.test.js
```

Expected: helper marker checks from Task 1 now pass, but other old visual text checks may need update in Task 7.

## Task 6: Redesign Upgrade Overlay And Automation Shop

**Files:**
- Modify: `C:\Users\31445\snake-game\index.html`

- [ ] **Step 1: Update upgrade card CSS**

Replace old upgrade overlay/card color rules with:

```css
.upgrade-overlay{
  display:none;
  position:absolute;
  inset:0;
  z-index:20;
  background:rgba(5,8,12,.88);
  backdrop-filter:blur(12px);
  flex-direction:column;
  align-items:center;
  justify-content:flex-start;
  overflow-x:hidden;
  overflow-y:auto;
  -webkit-overflow-scrolling:touch;
  overscroll-behavior:contain;
  touch-action:pan-y;
  padding:18px 10px;
}
.upgrade-content{
  width:100%;
  max-width:480px;
  margin:auto 0;
  padding:10px 8px 28px;
  display:flex;
  flex-direction:column;
  gap:14px;
  align-items:center;
}
.upgrade-card{
  width:min(156px,46vw);
  min-height:154px;
  padding:16px 12px;
  border-radius:var(--radius);
  border:1px solid var(--line);
  background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.018)),var(--surface);
  position:relative;
  overflow:hidden;
}
.upgrade-card::after{
  content:'';
  position:absolute;
  inset:-45% -80%;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent);
  transform:translateX(-80%) rotate(16deg);
  opacity:0;
}
.upgrade-card:hover::after,.upgrade-card.selected::after{
  opacity:1;
  animation:upgrade-card-scan .48s ease-out;
}
@keyframes upgrade-card-scan{
  to{transform:translateX(80%) rotate(16deg)}
}
.upgrade-card.selected{
  border-color:var(--line-strong);
  background:rgba(76,201,240,.1);
  box-shadow:0 0 0 1px rgba(76,201,240,.08),0 16px 34px rgba(0,0,0,.28);
}
```

- [ ] **Step 2: Update card selection JS to use class marker**

In `showUpgradeScreen()`, when selecting a card, replace direct shadow-only selection with class management:

```js
document.querySelectorAll('.upgrade-card').forEach(c=>c.classList.remove('selected'));
card.classList.add('selected');
```

For shop deselect behavior, keep the existing cancellation rule and add:

```js
card.classList.remove('selected');
```

- [ ] **Step 3: Style automation shop items**

Add CSS classes and use them in `renderAutoShop()`:

```css
.auto-shop-panel{
  display:none;
  position:absolute;
  inset:0;
  z-index:18;
  background:rgba(5,8,12,.92);
  backdrop-filter:blur(12px);
  flex-direction:column;
  overflow-y:auto;
  padding:16px;
}
.auto-shop-item{
  display:grid;
  grid-template-columns:36px 1fr auto;
  gap:10px;
  align-items:center;
  margin-bottom:8px;
  padding:10px;
  border:1px solid var(--line);
  border-radius:var(--radius);
  background:rgba(255,255,255,.035);
}
.auto-shop-item.purchased{
  border-color:rgba(98,212,140,.38);
}
```

Change the inline `autoShopPanel` style attribute to `class="auto-shop-panel"` and keep `id="autoShopPanel"`.

- [ ] **Step 4: Run behavior and source tests**

Run:

```powershell
node tests\behavior.test.js
node tests\game-rules.test.js
```

Expected: behavior tests pass; source test may still fail only on outdated old-copy visual assertions.

## Task 7: Update Style Tests To Match The Unified Visual System

**Files:**
- Modify: `C:\Users\31445\snake-game\tests\game-rules.test.js`

- [ ] **Step 1: Replace old synthwave/acid copy assertions**

Replace assertions that require exact old labels such as old mojibake text, old sun mask wording, or old acid copy with stable functional checks:

```js
assert(
  source.includes('data-style="default"') &&
  source.includes('data-style="synthwave"') &&
  source.includes('data-style="acid"') &&
  source.includes('swatch-default') &&
  source.includes('swatch-synthwave') &&
  source.includes('swatch-acid'),
  'visual style switcher should expose unified default, synthwave, and acid choices with swatches'
);

assert(
  /document\.body\.classList\.remove\('style-default','style-synthwave','style-acid'\)/.test(source) &&
  /currentVisualStyle=style==='synthwave'\?'synthwave':style==='acid'\?'acid':'default'/.test(source),
  'visual style switching should preserve all three selectable styles'
);

assert(
  source.includes('body.style-synthwave') &&
  source.includes('body.style-acid') &&
  source.includes('--surface-strong') &&
  source.includes('--line-strong'),
  'theme variants should share the precision control token system'
);
```

- [ ] **Step 2: Preserve gameplay assertions**

Keep all existing assertions for:

- `merge_boost` gated behind body compression.
- Manual input not overriding automation.
- Mobile upgrade overlay scroll.
- Magnet max-level filtering.
- Shop selection cancellation.
- Auto shop item ids.
- Upgrade mechanic markers.

- [ ] **Step 3: Run source test**

Run:

```powershell
node tests\game-rules.test.js
```

Expected: PASS.

## Task 8: Manual Browser Verification

**Files:**
- No source changes unless verification finds defects.

- [ ] **Step 1: Open local game**

Open:

```text
file:///C:/Users/31445/snake-game/index.html
```

Expected: main menu shows the Precision Control Console style by default, with centered layout and readable controls.

- [ ] **Step 2: Verify style switching**

In the browser:

1. Open style selector.
2. Select Precision Control Console.
3. Select Synthwave.
4. Select Acid.

Expected:

- Layout stays centered in all styles.
- Canvas background remains readable.
- Style options show active state.
- No text overflows buttons or cards.

- [ ] **Step 3: Verify gameplay feedback**

Start a game and eat at least one food.

Expected:

- Snake head/body/food visuals are distinct.
- Score pulses once when points increase.
- Eating creates a brief ring or local feedback.
- Game remains playable with keyboard and mobile controls if emulated.

- [ ] **Step 4: Verify upgrade overlay**

Trigger an upgrade by eating enough food or by temporarily setting state from DevTools if needed:

```js
level=2;foodEaten=5;showUpgradeScreen();
```

Expected:

- Overlay is scrollable on narrow viewport.
- Cards have distinct free/paid states.
- Selection gives a clear visual state.
- Confirm button remains reachable.

- [ ] **Step 5: Verify mobile width**

Use a narrow viewport around `390x844`.

Expected:

- Main menu, canvas, HUD, speed slider, and controls fit without horizontal scroll.
- Upgrade overlay scrolls vertically.
- A/B buttons remain visible and tappable.

## Task 9: Version, Changelog, Agent Notes, Commit, Tag, Push

**Files:**
- Modify: `C:\Users\31445\snake-game\VERSION`
- Modify: `C:\Users\31445\snake-game\CHANGELOG.md`
- Modify: `C:\Users\31445\snake-game\AGENTS.md`

- [ ] **Step 1: Bump version**

Set `VERSION` to:

```text
0.3.0
```

- [ ] **Step 2: Add changelog entry**

Add this near the top of `CHANGELOG.md`:

```markdown
## 0.3.0 - 2026-06-16

### Added
- Added the unified Precision Control Console frontend style.
- Added distinct canvas visuals for snake segments, compressed body levels, normal food, merged food, and special food.
- Added local feedback animations for score increases, eating, food merging, and upgrade selection.

### Changed
- Reworked the default, synthwave, and acid styles to share one component system and responsive layout.
- Reworked the upgrade overlay, automation shop, speed control, and mobile controls for clearer hierarchy and touch feedback.
```

- [ ] **Step 3: Update AGENTS.md durable notes**

Add this under Current Gameplay Rules or a new Visual System section:

```markdown
## Visual System Notes

- The default style is the Precision Control Console visual system.
- `default`, `synthwave`, and `acid` must share component geometry and interaction behavior.
- Keep `--surface-strong`, `--line-strong`, `--success`, `--warning`, and `--special` CSS token markers.
- Canvas visuals should keep distinct helpers for food chips, merged food, special food, normal snake segments, and compressed snake segments.
- Score/eating/upgrade feedback must stay bounded and lightweight to avoid late-game slowdown.
```

- [ ] **Step 4: Run all required tests**

Run:

```powershell
node tests\behavior.test.js
node tests\game-rules.test.js
node --experimental-vm-modules tests\syntax-check.js
```

Expected: all commands exit `0`.

- [ ] **Step 5: Commit implementation**

Run:

```powershell
git status --short
git add index.html tests\behavior.test.js tests\game-rules.test.js VERSION CHANGELOG.md AGENTS.md
git commit -m "feat: redesign UI with precision control style"
```

Expected: commit succeeds. Do not add `.gitignore` or `.superpowers/`.

- [ ] **Step 6: Tag and push**

Run:

```powershell
git tag -a v0.3.0 -m "v0.3.0 - precision control UI redesign"
git push origin main
git push origin v0.3.0
```

Expected: branch and tag are pushed.

- [ ] **Step 7: Verify GitHub Pages marker**

Run:

```powershell
$html = Invoke-WebRequest -UseBasicParsing "https://helium55.github.io/snake-game/index.html?v=0.3.0"
$html.Content.Contains("precision-control-shell")
```

Expected: `True` after GitHub Pages refreshes.
