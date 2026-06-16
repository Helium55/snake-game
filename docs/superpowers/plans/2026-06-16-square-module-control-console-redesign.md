# Square Module Control Console Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved square-module control-console redesign in the live single-file snake game.

**Architecture:** Keep the current single-file `index.html` architecture and existing performance caches. Replace rounded Canvas object drawing with square module drawing, tighten the visual system around grid-aligned objects, and update tests to lock in square snake/food rules. Preserve gameplay behavior, responsive layout, and the existing `default`, `synthwave`, and `acid` style switcher.

**Tech Stack:** Plain HTML/CSS/JavaScript, Canvas 2D API, existing Node-based source/behavior tests, GitHub Pages deployment.

---

## File Structure

- Modify: `C:\Users\31445\snake-game\index.html`
  - Replace rounded Canvas paths for snake and food with square module drawing.
  - Keep `drawCell()` for legacy glow/radar support, but prevent main snake/food helpers from using rounded module geometry.
  - Make snake body modules draw as contiguous square cells with no intentional padding gap.
  - Keep UI components professional and restrained while preserving existing responsive layout.
- Modify: `C:\Users\31445\snake-game\tests\game-rules.test.js`
  - Add source checks for square module markers and no-gap snake rendering.
  - Keep existing gameplay and performance cache checks.
- Modify: `C:\Users\31445\snake-game\tests\behavior.test.js`
  - Add a light behavior/source-adjacent scenario if needed to ensure square module helpers are exposed and gameplay still passes.
- Modify: `C:\Users\31445\snake-game\VERSION`
  - Bump to `0.4.0`.
- Modify: `C:\Users\31445\snake-game\CHANGELOG.md`
  - Add a dated `0.4.0` entry.
- Modify: `C:\Users\31445\snake-game\AGENTS.md`
  - Add durable square-module visual rules.

## Task 1: Add Failing Square Module Tests

**Files:**
- Modify: `C:\Users\31445\snake-game\tests\game-rules.test.js`

- [ ] **Step 1: Add source checks for square object rules**

Add this block after the existing distinct visual helper marker assertions:

```js
for (const marker of [
  'SQUARE_MODULE_PAD=0',
  'function squareCellRect',
  'function drawSquareModule',
  'function drawSquareFoodModule',
  'function drawSquareSpecialModule',
  'function drawSquareSnakeModule',
  'function drawSquareCompressedModule',
]) {
  assert(source.includes(marker), `square module visual marker missing: ${marker}`);
}

assert(
  /drawSnakeSegment\(seg,index,isHead\)\{[\s\S]*drawSquareSnakeModule/.test(source) &&
  /drawCompressedSegment\(seg,index,isHead\)\{[\s\S]*drawSquareCompressedModule/.test(source),
  'snake drawing should use square modules for normal and compressed body segments'
);

assert(
  /drawFoodChip\(f\)\{[\s\S]*drawSquareFoodModule/.test(source) &&
  /drawSpecialFoodCore\(f\)\{[\s\S]*drawSquareSpecialModule/.test(source),
  'food drawing should use square modules rather than rounded or circular objects'
);
```

- [ ] **Step 2: Run the source test and verify RED**

Run:

```powershell
node tests\game-rules.test.js
```

Expected: FAIL with `square module visual marker missing: SQUARE_MODULE_PAD=0`.

- [ ] **Step 3: Commit the failing test**

Run:

```powershell
git add tests\game-rules.test.js
git commit -m "test: add square module visual markers"
```

Expected: one test-only commit.

## Task 2: Implement Square Canvas Module Helpers

**Files:**
- Modify: `C:\Users\31445\snake-game\index.html`

- [ ] **Step 1: Add square module constants and helpers**

Near the current render helper area before `cellRect`, add:

```js
const SQUARE_MODULE_PAD=0;
function squareCellRect(gx,gy,pad=SQUARE_MODULE_PAD){
  return {x:gx*CELL+pad,y:gy*CELL+pad,w:CELL-pad*2,h:CELL-pad*2};
}
function drawSquareModule(ctx,r,fill,stroke='rgba(255,255,255,.22)',detail=''){
  ctx.save();
  ctx.fillStyle=fill;
  ctx.fillRect(r.x,r.y,r.w,r.h);
  ctx.strokeStyle=stroke;
  ctx.lineWidth=1;
  ctx.strokeRect(r.x+.5,r.y+.5,r.w-1,r.h-1);
  if(detail==='chip'){
    ctx.fillStyle='rgba(255,255,255,.45)';
    ctx.fillRect(r.x+r.w*.34,r.y+3,r.w*.32,2);
    ctx.fillStyle='rgba(0,0,0,.22)';
    ctx.fillRect(r.x+3,r.y+r.h-5,r.w-6,2);
  }
  if(detail==='scan'){
    ctx.fillStyle='rgba(255,255,255,.62)';
    ctx.fillRect(r.x+r.w*.42,r.y+2,r.w*.16,r.h-4);
    ctx.fillStyle='rgba(255,255,255,.24)';
    ctx.fillRect(r.x+2,r.y+r.h*.42,r.w-4,r.h*.16);
  }
  ctx.restore();
}
```

- [ ] **Step 2: Keep the legacy rounded helper available**

Do not delete `roundedRectPath()` or `drawCell()`. Existing radar/glow code may still call these helpers. The square-module helpers should be used by the main snake and food drawing functions only.

- [ ] **Step 3: Run syntax check**

Run:

```powershell
node --experimental-vm-modules tests\syntax-check.js
```

Expected: PASS.

## Task 3: Convert Food And Special Food To Square Modules

**Files:**
- Modify: `C:\Users\31445\snake-game\index.html`

- [ ] **Step 1: Add square food helpers**

Add these helpers near the Canvas drawing functions:

```js
function drawSquareFoodModule(f){
  const canvas=$('gameCanvas'),ctx=canvas.getContext('2d');
  const lvl=f.lvl||1,r=squareCellRect(f.x,f.y,3);
  const fill=lvl>1?'#e6b15d':'#e66b73';
  drawSquareModule(ctx,r,fill,'rgba(255,255,255,.28)','chip');
  if(lvl>1)drawMergedFoodCore(f);
}
function drawSquareSpecialModule(f){
  const canvas=$('gameCanvas'),ctx=canvas.getContext('2d');
  const r=squareCellRect(f.x,f.y,2);
  const age=Date.now()-f.spawnTime;
  const alpha=age>6000?Math.max(0,1-(age-6000)/2000):1;
  ctx.save();
  ctx.globalAlpha=alpha;
  drawSquareModule(ctx,r,'#e6b15d','rgba(157,145,255,.86)','scan');
  ctx.strokeStyle='rgba(102,217,239,.55)';
  ctx.strokeRect(r.x+4.5,r.y+4.5,r.w-9,r.h-9);
  ctx.restore();
}
```

- [ ] **Step 2: Update existing food draw functions**

Change `drawFoodChip(f)` to:

```js
function drawFoodChip(f){
  drawSquareFoodModule(f);
}
```

Change `drawSpecialFoodCore(f)` to:

```js
function drawSpecialFoodCore(f){
  drawSquareSpecialModule(f);
}
```

- [ ] **Step 3: Update merged food core to be square and compact**

Change `drawMergedFoodCore(f)` so it uses `squareCellRect(f.x,f.y,5)` and `ctx.fillRect(...)` / `ctx.strokeRect(...)`, not `roundedRectPath(...)`.

Use this body:

```js
function drawMergedFoodCore(f){
  const canvas=$('gameCanvas'),ctx=canvas.getContext('2d'),r=squareCellRect(f.x,f.y,5);
  ctx.save();
  ctx.fillStyle='rgba(7,11,16,.76)';
  ctx.fillRect(r.x+2,r.y+2,r.w-4,r.h-4);
  ctx.strokeStyle='rgba(255,255,255,.18)';
  ctx.strokeRect(r.x+2.5,r.y+2.5,r.w-5,r.h-5);
  ctx.fillStyle='#fff2bd';
  ctx.font='800 9px Segoe UI';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillText(String(f.lvl||2),r.x+r.w/2,r.y+r.h/2);
  ctx.restore();
}
```

- [ ] **Step 4: Run source test**

Run:

```powershell
node tests\game-rules.test.js
```

Expected: still fails until snake helpers are added in Task 4, but food square marker checks should pass.

## Task 4: Convert Snake To Continuous Square Modules

**Files:**
- Modify: `C:\Users\31445\snake-game\index.html`

- [ ] **Step 1: Add square snake helpers**

Add:

```js
function drawSquareSnakeModule(seg,index,isHead){
  const canvas=$('gameCanvas'),ctx=canvas.getContext('2d');
  const r=squareCellRect(seg.x,seg.y,0);
  drawSquareModule(ctx,r,isHead?'#dff7e8':'#74d99f',isHead?'rgba(255,255,255,.5)':'rgba(255,255,255,.18)');
  if(invincible){
    ctx.save();
    ctx.strokeStyle='rgba(230,177,93,.88)';
    ctx.lineWidth=2;
    ctx.strokeRect(r.x+1,r.y+1,r.w-2,r.h-2);
    ctx.restore();
  }
  if(autoMode&&isHead){
    ctx.save();
    ctx.strokeStyle='rgba(102,217,239,.68)';
    ctx.strokeRect(r.x+3.5,r.y+3.5,r.w-7,r.h-7);
    ctx.restore();
  }
  if(isHead){
    ctx.save();
    ctx.fillStyle='rgba(7,11,16,.72)';
    if(direction==='left'||direction==='right'){
      const x=direction==='left'?r.x+4:r.x+r.w-7;
      ctx.fillRect(x,r.y+5,3,4);
      ctx.fillRect(x,r.y+r.h-9,3,4);
    }else{
      const y=direction==='up'?r.y+4:r.y+r.h-7;
      ctx.fillRect(r.x+5,y,4,3);
      ctx.fillRect(r.x+r.w-9,y,4,3);
    }
    ctx.restore();
  }
}
function drawSquareCompressedModule(seg,index,isHead){
  const canvas=$('gameCanvas'),ctx=canvas.getContext('2d');
  const r=squareCellRect(seg.x,seg.y,0),lvl=seg.lvl||1;
  drawSquareModule(ctx,r,lvl>=8?'#9d91ff':'#66d9ef','rgba(255,255,255,.28)');
  if(invincible){
    ctx.save();
    ctx.strokeStyle='rgba(230,177,93,.88)';
    ctx.lineWidth=2;
    ctx.strokeRect(r.x+1,r.y+1,r.w-2,r.h-2);
    ctx.restore();
  }
  ctx.save();
  ctx.fillStyle='#071018';
  ctx.font=`900 ${lvl>=10?8:10}px Segoe UI`;
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillText(String(lvl),r.x+r.w/2,r.y+r.h/2);
  ctx.restore();
}
```

- [ ] **Step 2: Update existing snake draw functions**

Change `drawSnakeSegment(seg,index,isHead)` to:

```js
function drawSnakeSegment(seg,index,isHead){
  drawSquareSnakeModule(seg,index,isHead);
}
```

Change `drawCompressedSegment(seg,index,isHead)` to:

```js
function drawCompressedSegment(seg,index,isHead){
  drawSquareCompressedModule(seg,index,isHead);
}
```

- [ ] **Step 3: Verify body has no intentional gap**

The helper must call `squareCellRect(seg.x,seg.y,0)`. The test in Task 1 checks for `SQUARE_MODULE_PAD=0`; do not add per-segment padding to snake modules.

- [ ] **Step 4: Run source and behavior tests**

Run:

```powershell
node tests\game-rules.test.js
node tests\behavior.test.js
```

Expected: both PASS.

## Task 5: Tune UI System For Square Module Aesthetic

**Files:**
- Modify: `C:\Users\31445\snake-game\index.html`

- [ ] **Step 1: Add square-module CSS marker and subtle UI alignment**

In the Precision Control CSS section, add:

```css
body{--object-shape:square-module}
.canvas-container{border-radius:6px}
.style-swatch{border-radius:0}
.dpad-btn,.ab-btn{border-radius:6px}
```

- [ ] **Step 2: Keep cards and panels readable**

Do not make every UI panel square-edged. Repeated UI cards can stay at `6px` radius for readability. Only game objects and style swatches must be square modules.

- [ ] **Step 3: Run syntax check**

Run:

```powershell
node --experimental-vm-modules tests\syntax-check.js
```

Expected: PASS.

## Task 6: Update Tests And Documentation For Durable Rules

**Files:**
- Modify: `C:\Users\31445\snake-game\tests\game-rules.test.js`
- Modify: `C:\Users\31445\snake-game\AGENTS.md`

- [ ] **Step 1: Add source assertion for CSS marker**

Add this assertion near the square module marker checks:

```js
assert(
  source.includes('--object-shape:square-module'),
  'CSS should expose the square-module object shape marker'
);
```

- [ ] **Step 2: Update AGENTS visual notes**

Add these bullets under `Visual System Notes`:

```markdown
- Snake, compressed snake body, normal food, merged food, and special food use square modules, not rounded rectangles or circles.
- Snake body modules should render with no intentional gap between adjacent body cells.
- Keep `SQUARE_MODULE_PAD=0`, `squareCellRect`, and square drawing helper markers for source tests.
```

- [ ] **Step 3: Run source test**

Run:

```powershell
node tests\game-rules.test.js
```

Expected: PASS.

## Task 7: Browser Verification

**Files:**
- No source changes unless verification finds defects.

- [ ] **Step 1: Start or reuse local server**

Run:

```powershell
$port=8765
$existing=Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if(-not $existing){
  $p=Start-Process -FilePath python -ArgumentList @('-m','http.server',$port.ToString(),'--bind','127.0.0.1') -WorkingDirectory 'C:\Users\31445\snake-game' -WindowStyle Hidden -PassThru
  Set-Content -LiteralPath 'C:\Users\31445\snake-game\.superpowers\brainstorm\square-module-server.pid' -Value $p.Id
  Start-Sleep -Seconds 1
}
Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:$port/index.html"
```

Expected: status `200`.

- [ ] **Step 2: Desktop browser check**

Open:

```text
http://127.0.0.1:8765/index.html
```

Expected:

- Main menu centered.
- Style selector still works.
- Starting a game shows square food and square snake modules.
- Snake body modules touch with no intentional visual gap.
- No horizontal scroll.

- [ ] **Step 3: Mobile browser check**

Set viewport to `390x844` and check:

- Menu fits.
- Game canvas scales.
- Mobile controls are visible.
- No horizontal scroll.

- [ ] **Step 4: Upgrade overlay check**

Trigger:

```js
level=2;foodEaten=5;showUpgradeScreen();
```

Expected:

- Upgrade overlay scrolls.
- Selection animation still works.
- Confirm button remains reachable.

## Task 8: Version, Changelog, Commit, Tag, Push

**Files:**
- Modify: `C:\Users\31445\snake-game\VERSION`
- Modify: `C:\Users\31445\snake-game\CHANGELOG.md`
- Modify: `C:\Users\31445\snake-game\AGENTS.md`

- [ ] **Step 1: Bump version**

Set `VERSION` to:

```text
0.4.0
```

- [ ] **Step 2: Add changelog entry**

Add near the top:

```markdown
## [0.4.0] - 2026-06-16

### Changed

- Reworked snake, compressed body, normal food, merged food, and special food into square grid-aligned modules.
- Changed snake rendering so adjacent body modules connect without intentional gaps.
- Tuned the control-console visual system toward a more restrained square-module instrument style.
```

- [ ] **Step 3: Run final tests**

Run:

```powershell
node tests\behavior.test.js
node tests\game-rules.test.js
node --experimental-vm-modules tests\syntax-check.js
```

Expected: all PASS.

- [ ] **Step 4: Commit**

Run:

```powershell
git status --short
git add index.html tests\behavior.test.js tests\game-rules.test.js VERSION CHANGELOG.md AGENTS.md
git commit -m "feat: add square module control console visuals"
```

Do not add `.gitignore` or `.superpowers/`.

- [ ] **Step 5: Tag and push**

Run:

```powershell
git tag -a v0.4.0 -m "v0.4.0 - square module control console visuals"
git push origin main
git push origin v0.4.0
```

Expected: branch and tag are pushed.

- [ ] **Step 6: Verify GitHub Pages marker**

Run:

```powershell
$html = Invoke-WebRequest -UseBasicParsing "https://helium55.github.io/snake-game/index.html?v=0.4.0"
$html.Content.Contains("SQUARE_MODULE_PAD=0") -and $html.Content.Contains("--object-shape:square-module")
```

Expected: `True` after GitHub Pages refreshes.
