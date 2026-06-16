# Snake Game Agent Guide

This file is the handoff guide for any AI agent continuing work on this repository.
Read this file, `CLAUDE.md`, `index.html`, and the tests before making changes.

## Project Overview

- This is a single-file HTML/CSS/JavaScript snake roguelike game.
- Main game file: `index.html`.
- Tests live in `tests/`.
- Production site: https://helium55.github.io/snake-game/
- Deployment target: GitHub Pages from `origin main`.
- The user usually expects completed fixes to be committed and pushed.

## Required Workflow

1. Inspect the relevant code before proposing or editing.
2. For bugs and behavior changes, add or update tests first when practical.
3. Keep edits scoped. Do not rewrite the whole single-file game unless explicitly asked.
4. Preserve unrelated user or generated changes.
5. Run verification before claiming the work is complete.
6. Update `VERSION` and `CHANGELOG.md` for every user-visible fix, feature, or gameplay change.
7. Commit and push finished work to `origin main` unless the user explicitly says not to.
8. Create and push a Git version tag for every completed update so bad releases can be rolled back.
9. Update this `AGENTS.md` when you add durable project knowledge, workflows, commands, or gameplay systems that future agents should know.

Do not touch unrelated untracked files. In recent sessions, `.gitignore` has existed as an untracked file and should be ignored unless the user asks for it.

## Test Commands

Run these from the repository root:

```powershell
node tests\behavior.test.js
node tests\game-rules.test.js
node --experimental-vm-modules tests\syntax-check.js
```

The VM modules command may print an experimental warning; exit code 0 is what matters.

## Deploy / Upload

```powershell
git add index.html tests\behavior.test.js tests\game-rules.test.js AGENTS.md
git commit -m "<short message>"
git push origin main
```

After pushing, GitHub Pages may take a short time to update. To verify live code, request:

```powershell
$html = Invoke-WebRequest -UseBasicParsing "https://helium55.github.io/snake-game/index.html?v=<commit>"
```

Then check for a marker from the change.

## Versioning And Rollback

Use semantic-ish versions:

- Patch (`0.1.1`): bug fixes and small balance/UI fixes.
- Minor (`0.2.0`): new gameplay systems, larger features, or meaningful behavior changes.
- Major (`1.0.0`): only for a stable public milestone.

For every completed update:

1. Bump `VERSION`.
2. Add a dated entry to `CHANGELOG.md` with `Added`, `Changed`, and/or `Fixed` bullets.
3. Commit the code, tests, `VERSION`, and `CHANGELOG.md`.
4. Tag the commit:

```powershell
git tag -a v0.1.1 -m "v0.1.1 - short release summary"
git push origin main
git push origin v0.1.1
```

To roll back GitHub Pages to a known good version:

```powershell
git checkout main
git revert --no-edit <bad-commit>
git push origin main
```

For a stronger rollback to a specific tag, create a new revert commit that restores that tag's tree rather than rewriting public history.

## Important Code Areas

- `initGame()` resets a new run.
- `gameTick()` is the main loop.
- `showUpgradeScreen()` renders regular upgrades and the paid body-point shop.
- `applyUpgrade(id, isFirst)` applies first-pick, free, and paid upgrades.
- `AUTO_SHOP` and `renderAutoShop()` define and render the automation shop.
- `compressBody()`, `bodyLevelsFromPoints()`, `totalBodyPoints()`, `deductBodyPoints()`, and `trimTailPoints()` control compressed body economy.
- `findAutoDirection()` controls automation pathfinding.
- `mergeFoods()` merges four adjacent same-level regular foods into a higher-level food.
- `setPlayerSpeed()` and `scoreMultiplier()` connect the player speed slider to tick speed and scoring.

## Current Gameplay Rules To Preserve

- First upgrade offers self-immunity or body compression.
- `merge_boost` only appears if body compression is active.
- Body compression uses 2048-like folding and supports body levels up to 16.
- Body points must still increase when eating, even with compression enabled.
- Food can merge: four adjacent same-level foods become one higher-level food.
- Magnet is a paid shop upgrade with 3 levels. Rebuying it increases level; max-level magnet no longer appears in shop draws.
- Magnet ranges are level-based: level 1 = 3, level 2 = 5, level 3 = 7.
- Clicking an already selected optional shop upgrade cancels that shop selection.
- Automation begins at level 10 via the automation transition choice.
- Automation shop purchases are per-run only. New games reset `autoShopPurchases` and all automation effects.
- The speed slider persists player preference and scales both tick speed and points.
- The main menu includes a visual style switcher. `default` is the Precision Control Console, while `synthwave` and `acid` are theme variants that share the same component system and persist via `snake_visual_style`.
- Mobile upgrade overlays must remain vertically scrollable so confirmation stays reachable.
- Mobile controls include A and B buttons so the Konami invincibility toggle can be entered on touch devices.
- Cheat invincibility and timed invincibility are separate; expiring timed invincibility must not turn off cheat invincibility.

## Visual System Notes

- The default style is the Precision Control Console visual system.
- `default`, `synthwave`, and `acid` must share component geometry and interaction behavior.
- Keep `--surface-strong`, `--line-strong`, `--success`, `--warning`, and `--special` CSS token markers.
- Canvas visuals should keep distinct helpers for food chips, merged food, special food, normal snake segments, and compressed snake segments.
- Snake, compressed snake body, normal food, merged food, and special food use square modules, not rounded rectangles or circles.
- Snake body modules should render with no intentional gap between adjacent body cells.
- Keep `SQUARE_MODULE_PAD=0`, `squareCellRect`, and square drawing helper markers for source tests.
- Score/eating/upgrade feedback must stay bounded and lightweight to avoid late-game slowdown.

## Performance Cache Notes

- `occupiedCells` caches snake occupancy. Call `markSnakeChanged()` after changing `snake` so collision, spawning, and auto pathfinding do not read stale occupancy.
- `cachedBodyPoints` is the body point cache. Call `markBodyPointsDirty()` or `markSnakeChanged()` after direct body mutations before reading `totalBodyPoints()`.
- `mergeFoodsFrom(food)` performs local food merging around a changed food. Keep `mergeFoods()` for full reconciliation after bulk food movement.
- `autoPathCache` caches automation directions. Call `invalidateAutoPath()` when targets, food positions, special food, or snake geometry changes.

## Recent Fix Context

- Automatic mode pathfinding should choose safe paths toward food and not keep stale manual directions.
- Auto collection should increase score, food progress, and body points.
- Auto speed upgrades stack by reducing `autoSpeedDivider`.
- `autoShopPurchases` intentionally no longer uses `localStorage`.
- The ordinary paid shop uses body points and must allow purchase when body points exactly equal cost.
- Food radar is currently disabled from the free upgrade draw pool unless implemented later.

## Performance Notes

Late-game slowdown is likely to come from repeated full scans rather than only large numbers. Likely hotspots:

- `snake.some(...)` occupancy checks in collision, spawning, magnet, and pathfinding.
- Repeated `totalBodyPoints()` scans and `Math.pow` calls.
- `mergeFoods()` full-list grouping when many foods exist.
- `findAutoDirection()` full BFS every tick in automation mode.
- Canvas text/shadow drawing when many objects are present.

Potential future optimizations:

- Maintain an occupancy `Set` keyed by `"x,y"`.
- Treat `bodyPoints` as the authoritative cached value and update it incrementally.
- Make food merging local/queued instead of full-list scanning every time.
- Cache automation paths for a few ticks and recompute only when needed.
- Cache static canvas layers or reduce expensive shadow/text drawing.
