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
  const context = {
    console,
    Math,
    Date,
    Promise,
    parseInt,
    setTimeout() { return 1; },
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

console.log('behavior checks passed');
