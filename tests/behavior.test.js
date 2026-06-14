const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const match = html.match(/<script\s+type="module">([\s\S]*?)<\/script>/);

if (!match) {
  throw new Error('Could not find inline module game script in index.html');
}

function element(id) {
  return {
    id,
    style: {},
    className: '',
    innerHTML: '',
    textContent: '',
    value: '',
    width: 500,
    height: 500,
    offsetWidth: 500,
    offsetHeight: 500,
    classList: {
      add() {},
      remove() {},
      contains() { return false; },
    },
    appendChild() {},
    remove() {},
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    getContext() {
      return {
        clearRect() {},
        fillRect() {},
        beginPath() {},
        arc() {},
        fill() {},
        stroke() {},
        moveTo() {},
        lineTo() {},
        quadraticCurveTo() {},
        closePath() {},
        createRadialGradient() { return { addColorStop() {} }; },
        fillText() {},
        save() {},
        restore() {},
      };
    },
  };
}

function makeContext() {
  const elements = new Map();
  const timeouts = [];
  const context = {
    console,
    Math,
    Date,
    Promise,
    parseInt,
    setTimeout(fn) { timeouts.push(fn); return timeouts.length; },
    clearTimeout() {},
    setInterval() { return 1; },
    clearInterval() {},
    requestAnimationFrame() { return 1; },
    cancelAnimationFrame() {},
    ResizeObserver: class {
      observe() {}
    },
    localStorage: {
      getItem() { return null; },
      setItem() {},
    },
    document: {
      getElementById(id) {
        if (!elements.has(id)) elements.set(id, element(id));
        return elements.get(id);
      },
      createElement(tag) {
        return element(tag);
      },
      addEventListener() {},
    },
  };

  context.window = context;
  context.supabase = { createClient: () => context.sb };
  vm.createContext(context);
  vm.runInContext(match[1], context, { filename: htmlPath });
  vm.runInContext('initGame(); clearTimeout(tickTimer); if (specialFoodTimer) clearInterval(specialFoodTimer);', context);
  context.__runTimeouts = () => {
    const pending = timeouts.splice(0);
    for (const fn of pending) if (typeof fn === 'function') fn();
  };
  return context;
}

function runScenario(script) {
  const context = makeContext();
  vm.runInContext(script, context, { filename: htmlPath });
  return context.__testResult;
}

const directAuto = runScenario(`
snake = [{x:10,y:10,lvl:1},{x:9,y:10,lvl:1},{x:8,y:10,lvl:1}];
direction = 'right';
nextDirection = 'right';
autoMode = true;
food = {x:10,y:12};
foods = [food];
specialFood = null;
paused = false;
gameOver = false;
gameTick();
clearTimeout(tickTimer);
__testResult = { head: snake[0], direction, gameOver };
`);

assert.equal(directAuto.head.x, 10, 'auto mode should keep the food column');
assert.equal(directAuto.head.y, 11, 'auto mode should move toward food instead of keeping stale manual direction');
assert.equal(directAuto.direction, 'down');
assert.equal(directAuto.gameOver, false);

const obstacleAuto = runScenario(`
snake = [
  {x:10,y:10,lvl:1},
  {x:10,y:11,lvl:1},
  {x:9,y:10,lvl:1},
  {x:8,y:10,lvl:1}
];
direction = 'right';
nextDirection = 'right';
autoMode = true;
food = {x:10,y:12};
foods = [food];
specialFood = null;
paused = false;
gameOver = false;
gameTick();
clearTimeout(tickTimer);
__testResult = { head: snake[0], direction, gameOver };
`);

assert.notEqual(obstacleAuto.direction, 'down', 'auto mode should not move into its own body');
assert.equal(obstacleAuto.gameOver, false, 'auto mode should choose a safe detour when the direct path is blocked');

const compressedPayment = runScenario(`
snake = [
  {x:5,y:5,lvl:1},
  {x:4,y:5,lvl:1},
  {x:3,y:5,lvl:2}
];
mergeThreshold = 4;
deductBodyPoints(3);
__testResult = { bodyPoints: totalBodyPoints(), levels: snake.map(s => s.lvl || 1) };
`);

assert.equal(compressedPayment.bodyPoints, 3, 'deducting 3 points from a 6-point body should leave 3 points');
assert.equal(JSON.stringify(compressedPayment.levels), JSON.stringify([1, 1, 1]), 'payment should split a higher tail segment and consume exact value');

const compressedMove = runScenario(`
snake = [{x:5,y:5,lvl:1},{x:4,y:5,lvl:1},{x:3,y:5,lvl:2}];
direction = 'right';
nextDirection = 'right';
bodyCompress = true;
food = {x:12,y:12};
foods = [food];
specialFood = null;
paused = false;
gameOver = false;
const before = totalBodyPoints();
gameTick();
clearTimeout(tickTimer);
__testResult = { before, after: totalBodyPoints(), levels: snake.map(s => s.lvl || 1), gameOver };
`);

assert.equal(compressedMove.gameOver, false);
assert.equal(compressedMove.after, compressedMove.before, 'moving without eating must not destroy compressed body points');

const compressedRepresentation = runScenario(`
snake = [
  {x:8,y:5,lvl:1},{x:7,y:5,lvl:1},{x:6,y:5,lvl:1},{x:5,y:5,lvl:1},
  {x:4,y:5,lvl:1},{x:3,y:5,lvl:1},{x:2,y:5,lvl:1},{x:1,y:5,lvl:1},
  {x:0,y:5,lvl:1},{x:0,y:6,lvl:1},{x:0,y:7,lvl:1}
];
bodyCompress = true;
mergeThreshold = 4;
const before = totalBodyPoints();
compressBody();
const afterCompress = totalBodyPoints();
const afterCompressLevels = snake.map(s => s.lvl || 1);
direction = 'right';
nextDirection = 'right';
food = {x:9,y:5};
foods = [food];
specialFood = null;
paused = false;
gameOver = false;
gameTick();
clearTimeout(tickTimer);
__testResult = {
  before,
  afterCompress,
  afterEat: totalBodyPoints(),
  afterCompressLevels,
  afterEatLevels: snake.map(s => s.lvl || 1),
  gameOver
};
`);

assert.equal(compressedRepresentation.before, 11);
assert.equal(compressedRepresentation.afterCompress, 11, 'compression should preserve total body points');
assert.equal(compressedRepresentation.afterEat, 12, 'eating after compression should still add one body point');
assert.equal(JSON.stringify(compressedRepresentation.afterEatLevels), JSON.stringify([2, 2, 2]), '12 points should fold into three level-2 body segments');

const autoCollect = runScenario(`
snake = [{x:5,y:5,lvl:1},{x:4,y:5,lvl:1},{x:3,y:5,lvl:1}];
direction = 'right';
nextDirection = 'right';
autoMode = true;
autoCollectRange = 2;
food = {x:8,y:5};
foods = [food];
specialFood = null;
paused = false;
gameOver = false;
gameTick();
clearTimeout(tickTimer);
__testResult = { score, foodEaten };
`);

assert.equal(autoCollect.score, 1, 'auto collect should eat regular food in range on the same tick');
assert.equal(autoCollect.foodEaten, 1);

const autoBodyGrowth = runScenario(`
snake = [{x:5,y:5,lvl:1},{x:4,y:5,lvl:1},{x:3,y:5,lvl:1}];
direction = 'right';
nextDirection = 'right';
autoMode = true;
food = {x:6,y:5};
foods = [food];
specialFood = null;
paused = false;
gameOver = false;
const before = totalBodyPoints();
gameTick();
clearTimeout(tickTimer);
__testResult = { before, after: totalBodyPoints(), length: snake.length, score, foodEaten };
`);

assert.equal(autoBodyGrowth.score, 1);
assert.equal(autoBodyGrowth.foodEaten, 1);
assert.equal(autoBodyGrowth.after, autoBodyGrowth.before + 1, 'eating regular food in auto mode should increase body points');
assert.equal(autoBodyGrowth.length, 4, 'regular food should grow the snake by one segment');

const autoSpeedUpgrade = runScenario(`
autoSpeedDivider = 4;
AUTO_SHOP.find(i => i.id === 'auto_speed').apply();
const afterFirst = autoSpeedDivider;
AUTO_SHOP.find(i => i.id === 'auto_speed').apply();
__testResult = { afterFirst, afterSecond: autoSpeedDivider };
`);

assert.equal(autoSpeedUpgrade.afterFirst, 3.2, 'auto speed +25% should reduce the tick divider by 1/1.25');
assert.equal(autoSpeedUpgrade.afterSecond, 2.56, 'auto speed upgrades should stack multiplicatively');

const playerSpeedMultiplier = runScenario(`
level = 1;
activeFree = [];
timeWarpUntil = 0;
runStartTime = Date.now() - 60000;
playerSpeedMult = 1.2;
autoMode = true;
__testResult = {
  normal: getSpeed(),
  auto: getTickDelay()
};
`);

assert.equal(playerSpeedMultiplier.normal, (130 - 8) / 1.2, 'player speed multiplier should shorten manual tick delay');
assert.equal(playerSpeedMultiplier.auto, 130 * 4 / 1.2, 'player speed multiplier should also shorten auto tick delay');

const playerSpeedScore = runScenario(`
snake = [{x:5,y:5,lvl:1},{x:4,y:5,lvl:1},{x:3,y:5,lvl:1}];
food = {x:6,y:5};
foods = [food];
specialFood = null;
direction = 'right';
nextDirection = 'right';
playerSpeedMult = 1.2;
paused = false;
gameOver = false;
gameTick();
clearTimeout(tickTimer);
__testResult = { score, foodEaten };
`);

assert.equal(playerSpeedScore.score, 1.2, '1.2x player speed should award 1.2x points');
assert.equal(playerSpeedScore.foodEaten, 1, 'speed multiplier should not change food progress');

const upgradeTriggerWithSpeedSlider = runScenario(`
snake = [{x:5,y:5,lvl:1},{x:4,y:5,lvl:1},{x:3,y:5,lvl:1}];
food = {x:6,y:5};
foods = [food];
specialFood = null;
direction = 'right';
nextDirection = 'right';
playerSpeedMult = 1.2;
foodEaten = 4;
upgradeProgress = 4.8;
nextUpgradeAt = 5;
paused = false;
gameOver = false;
gameTick();
clearTimeout(tickTimer);
__testResult = { foodEaten, upgradeProgress, paused, upgradeCount };
`);

assert.equal(upgradeTriggerWithSpeedSlider.foodEaten, 5, 'speed slider must not block food progress');
assert.equal(upgradeTriggerWithSpeedSlider.upgradeProgress, 6, 'speed-adjusted points should advance upgrade progress');
assert.equal(upgradeTriggerWithSpeedSlider.paused, true, 'hitting the speed-adjusted upgrade threshold should pause for the upgrade screen');
assert.equal(upgradeTriggerWithSpeedSlider.upgradeCount, 1, 'hitting the speed-adjusted upgrade threshold should open an upgrade choice');

const speedyDoesNotCancelCheatInvincible = runScenario(`
setCheatInvincible(true);
applyTimedInvincible(5000);
__runTimeouts();
__testResult = { invincible, cheatInvincible, timedInvincible };
`);

assert.equal(speedyDoesNotCancelCheatInvincible.cheatInvincible, true, 'cheat invincible should remain enabled');
assert.equal(speedyDoesNotCancelCheatInvincible.timedInvincible, false, 'timed invincible should expire');
assert.equal(speedyDoesNotCancelCheatInvincible.invincible, true, 'expiring timed invincible must not cancel cheat invincible');

const mobileKonami = runScenario(`
const inputs = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyA','KeyB','KeyA','KeyB'];
for (const c of inputs) handleKonamiInput(c);
__testResult = { invincible, cheatInvincible, usedInvincibleThisRun };
`);

assert.equal(mobileKonami.invincible, true, 'mobile controls should be able to toggle invincible through Konami');
assert.equal(mobileKonami.cheatInvincible, true, 'Konami should enable cheat invincible state');
assert.equal(mobileKonami.usedInvincibleThisRun, true, 'Konami should count toward the achievement on mobile');

const multiFood = runScenario(`
snake = [{x:5,y:5,lvl:1},{x:4,y:5,lvl:1},{x:3,y:5,lvl:1}];
food = {x:6,y:5};
foods = [food];
specialFood = null;
direction = 'right';
nextDirection = 'right';
splitChance = 1;
paused = false;
gameOver = false;
gameTick();
clearTimeout(tickTimer);
__testResult = { foods: foods.map(f => ({x:f.x,y:f.y})), score, foodEaten };
`);

assert.equal(multiFood.score, 1);
assert.equal(multiFood.foodEaten, 1);
assert.equal(multiFood.foods.length, 2, 'split food should leave two regular foods on the board');

const foodMerge = runScenario(`
snake = [{x:10,y:10,lvl:1},{x:9,y:10,lvl:1},{x:8,y:10,lvl:1}];
foods = [
  {x:1,y:1,lvl:1},
  {x:2,y:1,lvl:1},
  {x:1,y:2,lvl:1},
  {x:2,y:2,lvl:1}
];
mergeFoods();
__testResult = { foods: foods.map(f => ({x:f.x,y:f.y,lvl:f.lvl || 1})) };
`);

assert.equal(foodMerge.foods.length, 1, 'four adjacent same-level foods should merge into one food');
assert.equal(foodMerge.foods[0].lvl, 2, 'merged food should become level 2');

const highLevelFoodValue = runScenario(`
snake = [{x:5,y:5,lvl:1},{x:4,y:5,lvl:1},{x:3,y:5,lvl:1}];
food = {x:6,y:5,lvl:2};
foods = [food];
specialFood = null;
direction = 'right';
nextDirection = 'right';
paused = false;
gameOver = false;
const before = totalBodyPoints();
gameTick();
clearTimeout(tickTimer);
__testResult = { before, after: totalBodyPoints(), score, foodEaten };
`);

assert.equal(highLevelFoodValue.after, highLevelFoodValue.before + 4, 'level-2 food should add 4 body points');
assert.equal(highLevelFoodValue.score, 4, 'level-2 food should score like 4 regular foods');
assert.equal(highLevelFoodValue.foodEaten, 4, 'level-2 food should count as 4 food value');

const bodyLevelCap = runScenario(`
snake = [{x:5,y:5,lvl:1}];
mergeThreshold = 4;
__testResult = {
  levels: bodyLevelsFromPoints(Math.pow(4,15)),
  value: Math.pow(4,15)
};
`);

assert.equal(JSON.stringify(bodyLevelCap.levels), JSON.stringify([16]), 'body compression should support level 16');

const magnetLevelCap = runScenario(`
applyUpgrade('magnet', false);
applyUpgrade('magnet', false);
applyUpgrade('magnet', false);
applyUpgrade('magnet', false);
__testResult = {
  level: activeShop.filter(c => c.id === 'magnet').length
};
`);

assert.equal(magnetLevelCap.level, 3, 'magnet shop upgrade should cap at level 3');

const highLevelMagnetRange = runScenario(`
snake = [{x:5,y:5,lvl:1},{x:4,y:5,lvl:1},{x:3,y:5,lvl:1}];
direction = 'right';
nextDirection = 'right';
activeShop = [
  SHOP_UPGRADES.find(c => c.id === 'magnet'),
  SHOP_UPGRADES.find(c => c.id === 'magnet'),
  SHOP_UPGRADES.find(c => c.id === 'magnet')
];
food = {x:11,y:5};
foods = [food];
specialFood = null;
paused = false;
gameOver = false;
gameTick();
clearTimeout(tickTimer);
__testResult = { food: foods[0] };
`);

assert.equal(highLevelMagnetRange.food.x, 10, 'level-3 magnet should pull food from farther away than level 1');

console.log('behavior checks passed');
