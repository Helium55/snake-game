# Auto Frontal Feeding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an automation shop upgrade that lets auto mode consume real normal foods inside the snake head's forward 3 by 3 area.

**Architecture:** Keep the single-file game structure. Add a per-run automation level variable, a forward-area helper, and a shared normal-food settlement helper so direct eating and area eating use one scoring/body-growth path. The feature only runs in `autoMode` and does not consume special food.

**Tech Stack:** Plain HTML/CSS/JavaScript, existing Canvas game loop, Node source and behavior tests, GitHub Pages deployment.

---

## File Structure

- Modify: `C:\Users\31445\snake-game\index.html`
  - Add `autoFrontalFeedLevel` per-run state.
  - Add `auto_frontal_feed` to `AUTO_SHOP` in the `auto` category.
  - Add helpers: `forwardBiteCells`, `autoFrontalFeedExtraLimit`, `growBodySegments`, `settleRegularFood`, `collectAutoFrontalFoods`.
  - Replace the inline normal-food settlement in `gameTick()` with calls to the helpers.
- Modify: `C:\Users\31445\snake-game\tests\game-rules.test.js`
  - Assert stable source markers for the new shop item and helpers.
- Modify: `C:\Users\31445\snake-game\tests\behavior.test.js`
  - Add a scenario proving auto mode consumes multiple normal foods in the forward 3 by 3 area and leaves special food alone.
- Modify: `C:\Users\31445\snake-game\VERSION`
  - Bump from `0.4.0` to `0.4.1`.
- Modify: `C:\Users\31445\snake-game\CHANGELOG.md`
  - Add a dated `0.4.1` entry.
- Modify: `C:\Users\31445\snake-game\AGENTS.md`
  - Add durable gameplay notes for the new automation upgrade.

## Task 1: Add Failing Tests

**Files:**
- Modify: `C:\Users\31445\snake-game\tests\game-rules.test.js`
- Modify: `C:\Users\31445\snake-game\tests\behavior.test.js`

- [ ] **Step 1: Add source markers**

Add this block near the existing automation shop id assertions in `tests\game-rules.test.js`:

```js
for (const marker of [
  "id:'auto_frontal_feed'",
  'autoFrontalFeedLevel',
  'function forwardBiteCells',
  'function autoFrontalFeedExtraLimit',
  'function settleRegularFood',
  'function collectAutoFrontalFoods',
]) {
  assert(source.includes(marker), `auto frontal feeding marker missing: ${marker}`);
}

assert(
  /autoFrontalFeedLevel=0/.test(source) &&
  /autoMode&&autoFrontalFeedLevel>0/.test(source),
  'auto frontal feeding should be per-run and active only in auto mode'
);
```

- [ ] **Step 2: Add behavior scenario**

Append this scenario to `tests\behavior.test.js` before the final `console.log(...)`:

```js
const autoFrontalFeed = runScenario(`
snake = [{x:5,y:5,lvl:1},{x:4,y:5,lvl:1},{x:3,y:5,lvl:1}];
markBodyPointsDirty();
direction = 'right';
nextDirection = 'right';
autoMode = true;
autoFrontalFeedLevel = 3;
autoFoodSpawn = 1;
autoFoodBonus = 0;
critChance = 0;
splitChance = 0;
goldenTouch = 0;
score = 0;
foodEaten = 0;
upgradeProgress = 0;
food = {x:6,y:5,lvl:1};
foods = [
  food,
  {x:7,y:4,lvl:1},
  {x:8,y:5,lvl:2},
  {x:9,y:6,lvl:1},
  {x:7,y:8,lvl:1}
];
specialFood = {x:7,y:5,spawnTime:Date.now()};
paused = false;
gameOver = false;
gameTick();
clearTimeout(tickTimer);
__testResult = {
  score,
  foodEaten,
  upgradeProgress,
  bodyPoints: totalBodyPoints(),
  length: snake.length,
  specialFood,
  outsideFoodStillPresent: foods.some(f => f.x === 7 && f.y === 8),
  gameOver
};
`);

assert.equal(autoFrontalFeed.gameOver, false);
assert.equal(autoFrontalFeed.score, 7, 'direct food plus three forward-area foods should score by their levels');
assert.equal(autoFrontalFeed.foodEaten, 7, 'forward-area foods should count as real food progress');
assert.equal(autoFrontalFeed.upgradeProgress, 7, 'forward-area foods should advance upgrade progress');
assert.equal(autoFrontalFeed.bodyPoints, 10, 'body points should grow by every consumed normal food');
assert.equal(autoFrontalFeed.length, 10, 'body length should include direct growth plus extra consumed food growth');
assert.deepEqual(autoFrontalFeed.specialFood && {x:autoFrontalFeed.specialFood.x,y:autoFrontalFeed.specialFood.y}, {x:7,y:5}, 'special food should not be consumed by frontal feeding');
assert.equal(autoFrontalFeed.outsideFoodStillPresent, true, 'foods outside the forward 3 by 3 area should remain');
```

- [ ] **Step 3: Run tests and verify RED**

Run:

```powershell
node tests\game-rules.test.js
node tests\behavior.test.js
```

Expected: source test fails with `auto frontal feeding marker missing: id:'auto_frontal_feed'`.

- [ ] **Step 4: Commit the failing tests**

Run:

```powershell
git add tests\game-rules.test.js tests\behavior.test.js
git commit -m "test: add auto frontal feeding coverage"
```

## Task 2: Implement Per-Run Upgrade State And Shop Item

**Files:**
- Modify: `C:\Users\31445\snake-game\index.html`

- [ ] **Step 1: Add state**

Change:

```js
let autoMode=false,autoSpeedDivider=4,autoCollectRange=1,autoFoodBonus=0;
```

to:

```js
let autoMode=false,autoSpeedDivider=4,autoCollectRange=1,autoFoodBonus=0,autoFrontalFeedLevel=0;
```

- [ ] **Step 2: Add the shop item**

Add this item in the `AUTO_SHOP` `auto` category after `auto_collect`:

```js
  {id:'auto_frontal_feed',cat:'auto',icon:'▦',name:'前域摄食',desc:'自动吃到食物时吞噬前方3×3内普通食物',baseCost:35,maxLevel:3,apply:()=>{autoFrontalFeedLevel=Math.min(3,autoFrontalFeedLevel+1)}},
```

- [ ] **Step 3: Reset the state per run**

Change the `initGame()` automation reset line:

```js
autoMode=false;autoSpeedDivider=4;autoCollectRange=1;autoFoodBonus=0;
```

to:

```js
autoMode=false;autoSpeedDivider=4;autoCollectRange=1;autoFoodBonus=0;autoFrontalFeedLevel=0;
```

- [ ] **Step 4: Hide max-level item in the auto shop**

In both `renderAutoShopLegacy()` and `renderAutoShop()`, change:

```js
for(const it of AUTO_SHOP.filter(i=>i.cat===cat)){
```

to:

```js
for(const it of AUTO_SHOP.filter(i=>i.cat===cat&&!(i.maxLevel&&((autoShopPurchases[i.id]||0)>=i.maxLevel)))){
```

- [ ] **Step 5: Run source test**

Run:

```powershell
node tests\game-rules.test.js
```

Expected: still fails until helper functions are added in Task 3.

## Task 3: Implement Forward Area And Shared Food Settlement

**Files:**
- Modify: `C:\Users\31445\snake-game\index.html`

- [ ] **Step 1: Add helper functions**

Add these helpers after `foodValue(f)`:

```js
function growBodySegments(count){
  for(let i=0;i<count;i++){const t=snake[snake.length-1];snake.push({x:t.x,y:t.y,lvl:1})}
  if(count>0)markSnakeChanged();
}
function settleRegularFood(eatenFood,effectCell,implicitGrowth){
  const value=foodValue(eatenFood);
  let pts=value*scoreMultiplier();
  if(Date.now()<revengeUntil)pts*=3;
  if(Math.random()<critChance)pts*=2;
  score+=pts;foodEaten+=value;upgradeProgress+=value*playerSpeedMult;
  pulseScore();pushCanvasEffect('eat',effectCell.x,effectCell.y,`+${Math.round(pts)}`);
  const extraGrow=value+growExtra-(implicitGrowth?1:0);
  growBodySegments(Math.max(0,extraGrow));
  if(autoMode&&autoFoodBonus>0)growBodySegments(autoFoodBonus);
}
function forwardBiteCells(head,dir){
  const cells=[];
  for(let depth=1;depth<=3;depth++){
    for(let side=-1;side<=1;side++){
      let x=head.x,y=head.y;
      if(dir==='right'){x+=depth;y+=side}
      else if(dir==='left'){x-=depth;y+=side}
      else if(dir==='down'){y+=depth;x+=side}
      else{x+=side;y-=depth}
      if(x>=0&&x<GRID&&y>=0&&y<GRID)cells.push({x,y,depth,side:Math.abs(side)});
    }
  }
  return cells;
}
function autoFrontalFeedExtraLimit(){
  return autoFrontalFeedLevel>=3?Infinity:autoFrontalFeedLevel===2?3:autoFrontalFeedLevel===1?1:0;
}
function collectAutoFrontalFoods(head){
  if(!(autoMode&&autoFrontalFeedLevel>0)||!foods||!foods.length)return [];
  const cells=forwardBiteCells(head,direction);
  const cellRanks=new Map(cells.map(c=>[cellKey(c.x,c.y),c.depth*10+c.side]));
  const matches=foods
    .filter(f=>cellRanks.has(cellKey(f.x,f.y)))
    .sort((a,b)=>cellRanks.get(cellKey(a.x,a.y))-cellRanks.get(cellKey(b.x,b.y)));
  const limit=autoFrontalFeedExtraLimit();
  const picked=limit===Infinity?matches:matches.slice(0,limit);
  if(!picked.length)return [];
  const pickedSet=new Set(picked);
  foods=foods.filter(f=>!pickedSet.has(f));
  syncPrimaryFood();
  for(const f of picked)settleRegularFood(f,f,false);
  return picked;
}
```

- [ ] **Step 2: Replace inline normal food settlement**

Replace the `if(willEatRegular){...}` body with:

```js
  if(willEatRegular){
    const eatenFood=foods[eatenFoodIndex];
    foods.splice(eatenFoodIndex,1);syncPrimaryFood();
    settleRegularFood(eatenFood,head,true);
    const extraFoods=collectAutoFrontalFoods(head);
    sfxEat();
    const consumedCount=1+extraFoods.length;
    for(let i=0;i<consumedCount*autoFoodSpawn;i++)spawnFood();
    for(let i=0;i<consumedCount;i++){
      if(Math.random()<goldenTouch&&!specialFood)spawnSpecialFood();
      if(Math.random()<splitChance)spawnFood();
    }
    if(autoMode&&Math.random()<autoSpecialRate&&!specialFood)spawnSpecialFood();
    if(specialFood&&foods.some(f=>f.x===specialFood.x&&f.y===specialFood.y)){specialFood=null;invalidateAutoPath()}
    mergeFoods();
```

- [ ] **Step 3: Run behavior and source tests**

Run:

```powershell
node tests\behavior.test.js
node tests\game-rules.test.js
```

Expected: both pass.

## Task 4: Update Docs And Version

**Files:**
- Modify: `C:\Users\31445\snake-game\VERSION`
- Modify: `C:\Users\31445\snake-game\CHANGELOG.md`
- Modify: `C:\Users\31445\snake-game\AGENTS.md`

- [ ] **Step 1: Bump version**

Set `VERSION` to:

```text
0.4.1
```

- [ ] **Step 2: Add changelog entry**

Add near the top of `CHANGELOG.md`:

```markdown
## [0.4.1] - 2026-06-16

### Added

- Added an automation shop `auto` upgrade that lets auto mode consume normal foods in the snake head's forward 3 by 3 area.

### Changed

- Shared normal food settlement between direct eating and automated frontal eating so score, body points, upgrade progress, and respawns stay consistent.
```

- [ ] **Step 3: Update agent guide**

Add under `Current Gameplay Rules To Preserve`:

```markdown
- `auto_frontal_feed` is a per-run automation shop upgrade in the `auto` category. At max level, auto mode consumes normal foods in the snake head's forward 3 by 3 area when a normal food is eaten; it does not consume special food.
```

## Task 5: Verify, Commit, Tag, Push

**Files:**
- No source changes unless verification finds defects.

- [ ] **Step 1: Run final tests**

Run:

```powershell
node tests\behavior.test.js
node tests\game-rules.test.js
node --experimental-vm-modules tests\syntax-check.js
```

Expected: all commands exit 0.

- [ ] **Step 2: Browser smoke check**

Run or reuse the local server at `http://127.0.0.1:8765/index.html`, start a game, force auto mode from the console or behavior test path, and confirm no startup console errors. The automated checks are the primary verification for the new rule.

- [ ] **Step 3: Commit implementation**

Run:

```powershell
git add index.html tests\behavior.test.js tests\game-rules.test.js VERSION CHANGELOG.md AGENTS.md
git commit -m "feat: add auto frontal feeding upgrade"
```

- [ ] **Step 4: Tag and push**

Run:

```powershell
git tag -a v0.4.1 -m "v0.4.1 - auto frontal feeding upgrade"
git push origin main
git push origin v0.4.1
```

- [ ] **Step 5: Verify GitHub Pages**

Run:

```powershell
$html = Invoke-WebRequest -UseBasicParsing "https://helium55.github.io/snake-game/index.html?v=0.4.1"
$html.Content.Contains("id:'auto_frontal_feed'") -and $html.Content.Contains("function collectAutoFrontalFoods")
```

Expected: `True` after GitHub Pages refreshes.
